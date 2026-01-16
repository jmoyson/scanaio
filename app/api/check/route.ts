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
import {
  insertScan,
  getCachedDomain,
  upsertDomain,
  getKeywordsByDomain,
  replaceKeywords,
  recalculateGlobalStats,
} from "@/lib/db";

export const runtime = "edge";
export const revalidate = 86400;

// Prevent duplicate requests
const pendingRequests = new Map<string, Promise<CheckResponse>>();

// Rate limiting (10 domains per IP per 24h)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const isDev = process.env.NODE_ENV === 'development';

function checkRateLimit(ip: string): { limited: boolean; resetInHours?: number } {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  const recent = requests.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = Math.min(...recent);
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - oldest);
    return { limited: true, resetInHours: Math.ceil(resetIn / 3600000) };
  }

  rateLimitMap.set(ip, [...recent, now]);
  return { limited: false };
}

function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);
}

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (rateLimit.limited) {
      return NextResponse.json({
        error: 'Daily Limit Reached',
        message: `You've scanned ${RATE_LIMIT_MAX} domains today. Try again in ${rateLimit.resetInHours} hour(s).`,
      } as APIError, { status: 429 });
    }

    // Parse and validate
    const body: CheckRequest = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({
        error: 'Invalid Request',
        message: 'Domain is required',
      } as APIError, { status: 400 });
    }

    if (!isValidDomain(domain)) {
      return NextResponse.json({
        error: 'Invalid Request',
        message: 'Invalid domain format',
      } as APIError, { status: 400 });
    }

    if (isDev) console.log('[API /check] Request:', domain);

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

        // 3. Store scan (raw response archive)
        const scan = await insertScan(domain, rawResponse);

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
