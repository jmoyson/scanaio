/**
 * Domains Table Operations
 *
 * Domain stats - one row per domain, always up to date.
 */

import { supabase } from './client';
import type { DomainRow, ParsedStats } from '../types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if domain has fresh data (within 24h)
 */
export async function getCachedDomain(domain: string): Promise<DomainRow | null> {
  const twentyFourHoursAgo = new Date(Date.now() - CACHE_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('domain', domain)
    .gte('last_scanned_at', twentyFourHoursAgo)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    console.error('[DB/domains] Cache check error:', error);
    throw new Error('Failed to check cache');
  }

  return data;
}

/**
 * Get domain stats (regardless of cache age)
 */
export async function getDomain(domain: string): Promise<DomainRow | null> {
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .eq('domain', domain)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[DB/domains] Fetch error:', error);
    throw new Error('Failed to fetch domain');
  }

  return data;
}

/**
 * Upsert domain stats
 */
export async function upsertDomain(
  domain: string,
  scanId: string,
  stats: ParsedStats
): Promise<DomainRow> {
  // Check if domain exists
  const existing = await getDomain(domain);
  const isNewDomain = !existing;

  const { data, error } = await supabase
    .from('domains')
    .upsert({
      domain,
      last_scan_id: scanId,
      keywords_analyzed: stats.total,
      keywords_with_aio: stats.withAio,
      keywords_without_aio: stats.withoutAio,
      intent_informational: stats.byIntent.informational,
      intent_commercial: stats.byIntent.commercial,
      intent_transactional: stats.byIntent.transactional,
      intent_navigational: stats.byIntent.navigational,
      total_search_volume: stats.totalSearchVolume,
      aio_search_volume: stats.aioSearchVolume,
      last_scanned_at: new Date().toISOString(),
      // Keep first_scanned_at for existing domains
      ...(isNewDomain ? { first_scanned_at: new Date().toISOString() } : {}),
    }, {
      onConflict: 'domain',
    })
    .select()
    .single();

  if (error) {
    console.error('[DB/domains] Upsert error:', error);
    throw new Error('Failed to save domain');
  }

  return data;
}

/**
 * Get all domains (for stats recalculation)
 */
export async function getAllDomains(): Promise<DomainRow[]> {
  const { data, error } = await supabase
    .from('domains')
    .select('*');

  if (error) {
    console.error('[DB/domains] Fetch all error:', error);
    throw new Error('Failed to fetch domains');
  }

  return data || [];
}
