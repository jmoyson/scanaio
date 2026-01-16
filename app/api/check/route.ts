// POST /api/check
// Body: { domain: string }
//
// 1. Validate domain
// 2. Check Supabase cache (24h)
// 3. If miss: call DataForSEO
// 4. Store raw response
// 5. Return parsed results

import { NextResponse } from "next/server";
import type { CheckRequest, CheckResponse, APIError } from "@/lib/types";
import { getCachedScan, saveScan } from "@/lib/supabase";
import { getKeywordsWithAioStatus } from "@/lib/dataforseo";

// Use Edge Runtime for fast responses (recommended for viral tools)
export const runtime = "edge";

// Enable caching at CDN level (24 hours)
export const revalidate = 86400;

// Prevent race condition: track pending DataForSEO requests
const pendingRequests = new Map<string, Promise<any>>();

// Rate limiting: 10 domains per IP per day (resets on deploy)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 domains per day per IP

function checkRateLimit(ip: string): { limited: boolean; resetInHours?: number } {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Filter to requests within the 24h window
  const recentRequests = requests.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    // Calculate hours until oldest request expires
    const oldestRequest = Math.min(...recentRequests);
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - oldestRequest);
    const resetInHours = Math.ceil(resetIn / (60 * 60 * 1000));
    return { limited: true, resetInHours };
  }

  // Add current request
  rateLimitMap.set(ip, [...recentRequests, now]);
  return { limited: false };
}

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';

    // Check rate limit (10 domains per day)
    const rateLimitResult = checkRateLimit(ip);
    if (rateLimitResult.limited) {
      const hours = rateLimitResult.resetInHours || 24;
      const error: APIError = {
        error: 'Daily Limit Reached',
        message: `You've scanned 10 domains today. Try again in ${hours} hour${hours > 1 ? 's' : ''}.`,
      };
      return NextResponse.json(error, { status: 429 });
    }

    const body: CheckRequest = await request.json();
    const { domain } = body;

    if (isDev) console.log('[API /check] Request for domain:', domain, 'from IP:', ip);

    // 1. Validate domain
    if (!domain || typeof domain !== 'string') {
      if (isDev) console.warn('[API /check] Invalid request: domain missing or not string');
      const error: APIError = {
        error: 'Invalid Request',
        message: 'Domain is required',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Basic domain validation (simple regex)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      if (isDev) console.warn('[API /check] Invalid domain format:', domain);
      const error: APIError = {
        error: 'Invalid Request',
        message: 'Invalid domain format',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // 2. Check cache (24h)
    if (isDev) console.log('[API /check] Checking cache for domain:', domain);
    const cachedScan = await getCachedScan(domain);

    if (cachedScan) {
      // Cache hit - parse keywords from raw response
      if (isDev) console.log('[API /check] Cache HIT! Returning cached data from:', cachedScan.created_at);

      // Extract keywords from raw DataForSEO response
      const rawData = cachedScan.raw_response as any;
      const tasks = rawData.tasks || [];
      const items = tasks[0]?.result?.[0]?.items || [];

      // Re-parse keywords (same logic as initial parsing)
      const keywords = items
        .map((item: any) => {
          // Simple detection for cached data
          const serpItemTypes = item.keyword_data?.serp_info?.serp_item_types || [];
          const hasAiOverview = serpItemTypes.includes('ai_overview');
          const isReferenced = item.ranked_serp_element?.serp_item?.type === 'ai_overview_reference';

          const aiOverviewStatus = !hasAiOverview ? 'safe' : (isReferenced ? 'referenced' : 'stolen');

          return {
            keyword: item.keyword_data?.keyword || 'Unknown',
            searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
            position: item.ranked_serp_element?.serp_item?.rank_absolute || 0,
            aiOverviewStatus: aiOverviewStatus as any,
            hasAiOverview: hasAiOverview,
          };
        })
        .sort((a: any, b: any) => b.searchVolume - a.searchVolume)
        .slice(0, 15);

      const response: CheckResponse = {
        domain: cachedScan.domain,
        keywords: keywords,
        stats: {
          withAIO: cachedScan.keywords_with_aio,
          total: cachedScan.keywords_total,
        },
        cachedAt: cachedScan.created_at,
      };
      return NextResponse.json(response);
    }

    // 3. Cache miss - check if request is already pending (prevent race condition)
    if (isDev) console.log('[API /check] Cache MISS - checking for pending request');

    const pending = pendingRequests.get(domain);
    if (pending) {
      if (isDev) console.log('[API /check] Request already pending, waiting for result');
      const result = await pending;
      return NextResponse.json(result);
    }

    // 4. Create new DataForSEO request and track it
    if (isDev) console.log('[API /check] Calling DataForSEO API');
    const dataForSEOPromise = (async () => {
      try {
        const dataForSEOResult = await getKeywordsWithAioStatus(domain);
        const { rawResponse, keywords } = dataForSEOResult;

        if (isDev) console.log('[API /check] DataForSEO returned', keywords.length, 'keywords');

        // Calculate stats
        const withAIO = keywords.filter((k) => k.hasAiOverview).length;
        const total = keywords.length;

        if (isDev) console.log('[API /check] Stats:', withAIO, 'with AI Overview out of', total, 'total');

        // 5. Save to database (new row for historical tracking)
        if (isDev) console.log('[API /check] Saving to database with RAW DataForSEO response...');
        await saveScan(domain, rawResponse, withAIO, total);
        if (isDev) console.log('[API /check] Saved successfully');

        // 6. Return response (use parsed keywords for client)
        const response: CheckResponse = {
          domain,
          keywords,
          stats: { withAIO, total },
          cachedAt: new Date().toISOString(),
        };

        return response;
      } finally {
        // Clean up pending request
        pendingRequests.delete(domain);
      }
    })();

    // Track pending request
    pendingRequests.set(domain, dataForSEOPromise);

    const result = await dataForSEOPromise;
    if (isDev) console.log('[API /check] Returning response with', result.keywords.length, 'keywords');
    return NextResponse.json(result);
  } catch (error) {
    if (isDev) console.error('[API /check] ERROR:', error);
    const apiError: APIError = {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
