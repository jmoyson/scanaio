/**
 * POST /api/check
 *
 * Domain scan endpoint:
 * 1. Validate domain
 * 2. Check cache (24h)
 * 3. If miss: fetch from DataForSEO, store, return
 * 4. If hit: return cached data
 */

import { NextResponse } from "next/server";
import type { CheckRequest, CheckResponse, APIError, Keyword } from "@/lib/types";
import { fetchRankedKeywords } from "@/lib/dataforseo-client";
import { parseDataForSEOResponse } from "@/lib/keyword-parser";
import { isValidDomain, cleanDomain } from "@/lib/domain-utils";
import {
  insertScan,
  getCachedDomain,
  upsertDomain,
  getKeywordsByDomain,
  replaceKeywords,
  recalculateGlobalStats,
  getScanCountByIP,
} from "@/lib/db";

export const runtime = "edge";
export const revalidate = 86400;

// Prevent duplicate requests
const pendingRequests = new Map<string, Promise<CheckResponse>>();

// Rate limiting (10 domains per IP per 24h)
// Hybrid approach: in-memory for speed + database for persistence
// - In-memory check is fast and catches repeated requests
// - Database check runs only if in-memory passes (prevents abuse after redeploy)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const isDev = process.env.NODE_ENV === 'development';

/**
 * Check in-memory rate limit (fast path)
 * Returns: { limited, resetInHours, shouldCheckDB }
 * - If limited: user exceeded in-memory limit
 * - If shouldCheckDB: in-memory passed but should verify against database
 */
function checkInMemoryRateLimit(ip: string): { limited: boolean; resetInHours?: number; inMemoryCount: number } {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  const recent = requests.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = Math.min(...recent);
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - oldest);
    return { limited: true, resetInHours: Math.ceil(resetIn / 3600000), inMemoryCount: recent.length };
  }

  return { limited: false, inMemoryCount: recent.length };
}

/**
 * Record a request in the in-memory rate limit
 */
function recordInMemoryRequest(ip: string): void {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  const recent = requests.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, [...recent, now]);
}

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Check rate limit (hybrid: in-memory first, then database if needed)
    const inMemoryCheck = checkInMemoryRateLimit(ip);

    if (inMemoryCheck.limited) {
      const retryAfterSeconds = (inMemoryCheck.resetInHours || 1) * 3600;
      return NextResponse.json({
        error: 'Daily Limit Reached',
        message: `You've scanned ${RATE_LIMIT_MAX} domains today. Try again in ${inMemoryCheck.resetInHours} hour(s).`,
      } as APIError, {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      });
    }

    // If in-memory count is low, check database for persistent rate limiting
    // This handles the case where server restarted but user already scanned today
    if (inMemoryCheck.inMemoryCount === 0 && ip !== 'unknown') {
      const dbCount = await getScanCountByIP(ip);
      if (dbCount >= RATE_LIMIT_MAX) {
        return NextResponse.json({
          error: 'Daily Limit Reached',
          message: `You've scanned ${RATE_LIMIT_MAX} domains today. Try again later.`,
        } as APIError, {
          status: 429,
          headers: {
            'Retry-After': '3600', // 1 hour default
          },
        });
      }
      // Pre-populate in-memory with DB count to avoid repeated DB checks
      for (let i = 0; i < dbCount; i++) {
        recordInMemoryRequest(ip);
      }
    }

    // Parse and validate
    const body: CheckRequest = await request.json();
    const rawDomain = body.domain;

    if (!rawDomain || typeof rawDomain !== 'string') {
      return NextResponse.json({
        error: 'Invalid Request',
        message: 'Domain is required',
      } as APIError, { status: 400 });
    }

    // Clean the domain (remove http://, www., paths, etc.)
    const domain = cleanDomain(rawDomain);

    if (!isValidDomain(domain)) {
      return NextResponse.json({
        error: 'Invalid Request',
        message: 'Invalid domain format. Please enter a valid domain like example.com',
      } as APIError, { status: 400 });
    }

    if (isDev) console.log('[API /check] Request:', domain, rawDomain !== domain ? `(cleaned from: ${rawDomain})` : '');

    // =========================================================================
    // Cache Check
    // =========================================================================
    const cached = await getCachedDomain(domain);

    if (cached) {
      if (isDev) console.log('[API /check] Cache HIT');

      const keywords = await getKeywordsByDomain(domain);
      const withAioCount = keywords.filter(k => k.hasAiOverview).length;

      const response: CheckResponse = {
        domain,
        keywords,
        stats: {
          total: keywords.length,
          withAio: withAioCount,
          withoutAio: keywords.length - withAioCount,
        },
        cachedAt: cached.last_scanned_at,
      };

      return NextResponse.json(response);
    }

    // =========================================================================
    // Check for pending request (prevent duplicate API calls)
    // =========================================================================
    const pending = pendingRequests.get(domain);
    if (pending) {
      if (isDev) console.log('[API /check] Waiting for pending request');
      return NextResponse.json(await pending);
    }

    // =========================================================================
    // Cache Miss - Fetch and store
    // =========================================================================
    if (isDev) console.log('[API /check] Cache MISS');

    // Record the request in-memory before making the API call
    // (This prevents duplicate API calls while the scan is in progress)
    recordInMemoryRequest(ip);

    const scanPromise = (async (): Promise<CheckResponse> => {
      try {
        // 1. Fetch from DataForSEO
        const rawResponse = await fetchRankedKeywords(domain);

        // 2. Parse response
        const parsed = parseDataForSEOResponse(rawResponse);

        if (isDev) {
          console.log('[API /check] Parsed:', parsed.keywords.length, 'keywords');
          console.log('[API /check] Stats:', parsed.stats);
        }

        // 3. Store scan (raw response archive + IP for rate limiting)
        const scan = await insertScan(domain, rawResponse, ip !== 'unknown' ? ip : undefined);

        // 4. Update domain stats
        await upsertDomain(domain, scan.id, parsed.stats);

        // 5. Replace keywords (delete old + insert all)
        await replaceKeywords(domain, scan.id, parsed.keywords);

        // 6. Recalculate global stats
        await recalculateGlobalStats();

        if (isDev) console.log('[API /check] Stored successfully');

        // 7. Return top 15 keywords for display
        const displayKeywords: Keyword[] = parsed.keywords
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 15)
          .map(kw => ({
            keyword: kw.keyword,
            searchVolume: kw.searchVolume,
            position: kw.position,
            intent: kw.intent,
            etv: kw.etv,
            hasAiOverview: kw.hasAiOverview,
          }));

        const withAioCount = displayKeywords.filter(k => k.hasAiOverview).length;

        return {
          domain,
          keywords: displayKeywords,
          stats: {
            total: displayKeywords.length,
            withAio: withAioCount,
            withoutAio: displayKeywords.length - withAioCount,
          },
          cachedAt: new Date().toISOString(),
        };
      } finally {
        pendingRequests.delete(domain);
      }
    })();

    pendingRequests.set(domain, scanPromise);

    return NextResponse.json(await scanPromise);

  } catch (error) {
    if (isDev) console.error('[API /check] ERROR:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as APIError, { status: 500 });
  }
}
