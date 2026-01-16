/**
 * Keyword Parser
 *
 * Parses DataForSEO response into keywords and stats.
 */

import type { SearchIntent, ParsedKeyword, ParsedStats } from './types';
import { INTENT } from './types';

// ============================================================================
// Main Parser
// ============================================================================

export function parseDataForSEOResponse(rawResponse: unknown): {
  keywords: ParsedKeyword[];
  stats: ParsedStats;
} {
  const response = rawResponse as any;
  const items = response?.tasks?.[0]?.result?.[0]?.items || [];

  if (items.length === 0) {
    return { keywords: [], stats: emptyStats() };
  }

  const keywords = items.map(parseItem);
  const stats = computeStats(keywords);

  return { keywords, stats };
}

// ============================================================================
// Item Parser
// ============================================================================

function parseItem(item: any): ParsedKeyword {
  const serpItemTypes = item.keyword_data?.serp_info?.serp_item_types || [];
  const hasAiOverview = serpItemTypes.includes('ai_overview');

  const searchVolume = item.keyword_data?.keyword_info?.search_volume || 0;
  const position = item.ranked_serp_element?.serp_item?.rank_absolute || 0;
  const etv = Math.round(item.ranked_serp_element?.serp_item?.etv || 0);
  const intent = parseIntent(item.keyword_data?.search_intent_info?.main_intent);

  const kw: ParsedKeyword = {
    keyword: item.keyword_data?.keyword || 'Unknown',
    searchVolume,
    position,
    intent,
    etv,
    hasAiOverview,
    riskScore: 0,
  };

  // Risk score: volume × aioMultiplier × rankMultiplier
  kw.riskScore = searchVolume * (hasAiOverview ? 2 : 0.5) * (1 / Math.sqrt(position || 1));

  return kw;
}

function parseIntent(raw: string | undefined): SearchIntent {
  const value = raw?.toLowerCase();
  if (value === INTENT.COMMERCIAL) return 'commercial';
  if (value === INTENT.TRANSACTIONAL) return 'transactional';
  if (value === INTENT.NAVIGATIONAL) return 'navigational';
  return 'informational';
}

// ============================================================================
// Stats Computation
// ============================================================================

function computeStats(keywords: ParsedKeyword[]): ParsedStats {
  let withAio = 0;
  let withoutAio = 0;
  let totalSearchVolume = 0;
  let aioSearchVolume = 0;
  const byIntent = { informational: 0, commercial: 0, transactional: 0, navigational: 0 };

  for (const kw of keywords) {
    if (kw.hasAiOverview) {
      withAio++;
      aioSearchVolume += kw.searchVolume;
    } else {
      withoutAio++;
    }
    byIntent[kw.intent]++;
    totalSearchVolume += kw.searchVolume;
  }

  return {
    total: keywords.length,
    withAio,
    withoutAio,
    byIntent,
    totalSearchVolume,
    aioSearchVolume,
  };
}

function emptyStats(): ParsedStats {
  return {
    total: 0,
    withAio: 0,
    withoutAio: 0,
    byIntent: { informational: 0, commercial: 0, transactional: 0, navigational: 0 },
    totalSearchVolume: 0,
    aioSearchVolume: 0,
  };
}
