/**
 * Keywords Table Operations
 *
 * Stores ALL keywords per domain for data analysis.
 * Replaced on each new scan (DELETE + INSERT).
 * Results display uses top 15 by risk score.
 */

import { supabase } from './client';
import type { KeywordRow, ParsedKeyword, Keyword } from '../types';

const DEFAULT_DISPLAY_LIMIT = 15;

/**
 * Get keywords for a domain (for results page)
 * Returns top N keywords sorted by risk_score descending
 *
 * @param domain - The domain to get keywords for
 * @param limit - Max keywords to return (default: 15 for display)
 */
export async function getKeywordsByDomain(
  domain: string,
  limit: number = DEFAULT_DISPLAY_LIMIT
): Promise<Keyword[]> {
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('domain', domain)
    .order('risk_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DB/keywords] Fetch error:', error);
    throw new Error('Failed to fetch keywords');
  }

  // Convert from DB row (snake_case) to API format (camelCase)
  return (data || []).map(rowToKeyword);
}

/**
 * Get ALL keywords for a domain (for analysis)
 * No limit applied
 */
export async function getAllKeywordsByDomain(domain: string): Promise<Keyword[]> {
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('domain', domain)
    .order('risk_score', { ascending: false });

  if (error) {
    console.error('[DB/keywords] Fetch error:', error);
    throw new Error('Failed to fetch keywords');
  }

  return (data || []).map(rowToKeyword);
}

/**
 * Replace keywords for a domain (DELETE old + INSERT new)
 * Called on each new scan
 * Stores ALL keywords, not just top 15
 */
export async function replaceKeywords(
  domain: string,
  scanId: string,
  keywords: ParsedKeyword[]
): Promise<void> {
  // 1. Delete old keywords for this domain
  const { error: deleteError } = await supabase
    .from('keywords')
    .delete()
    .eq('domain', domain);

  if (deleteError) {
    console.error('[DB/keywords] Delete error:', deleteError);
    throw new Error('Failed to delete old keywords');
  }

  // 2. Insert ALL new keywords (not just top 15)
  if (keywords.length === 0) return;

  const rows = keywords.map(kw => ({
    domain,
    scan_id: scanId,
    keyword: kw.keyword,
    search_volume: kw.searchVolume,
    position: kw.position,
    intent: kw.intent,
    etv: Math.round(kw.etv),
    has_ai_overview: kw.hasAiOverview,
    risk_score: kw.riskScore,
  }));

  const { error: insertError } = await supabase
    .from('keywords')
    .insert(rows);

  if (insertError) {
    console.error('[DB/keywords] Insert error:', insertError);
    throw new Error('Failed to insert keywords');
  }
}

/**
 * Convert DB row to API keyword format
 */
function rowToKeyword(row: KeywordRow): Keyword {
  return {
    keyword: row.keyword,
    searchVolume: row.search_volume,
    position: row.position,
    intent: row.intent,
    etv: row.etv,
    hasAiOverview: row.has_ai_overview,
  };
}
