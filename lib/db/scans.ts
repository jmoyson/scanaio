/**
 * Scans Table Operations
 *
 * Raw API response archive - keeps ALL scan history.
 */

import { supabase } from './client';
import type { ScanRow } from '../types';

/**
 * Insert a new scan record
 */
export async function insertScan(
  domain: string,
  rawResponse: unknown,
  ipAddress?: string
): Promise<ScanRow> {
  const { data, error } = await supabase
    .from('scans')
    .insert({
      domain,
      raw_response: rawResponse,
      ip_address: ipAddress || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB/scans] Insert error:', error);
    throw new Error('Failed to save scan');
  }

  return data;
}

/**
 * Count scans by IP address in the last 24 hours
 * Used for persistent rate limiting
 */
export async function getScanCountByIP(ipAddress: string): Promise<number> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', twentyFourHoursAgo);

  if (error) {
    console.error('[DB/scans] Count by IP error:', error);
    // On error, return 0 to not block users
    return 0;
  }

  return count || 0;
}

/**
 * Get the most recent scan for a domain
 */
export async function getLatestScan(domain: string): Promise<ScanRow | null> {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('domain', domain)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[DB/scans] Fetch error:', error);
    throw new Error('Failed to fetch scan');
  }

  return data;
}

/**
 * Get all scans (for migration)
 */
export async function getAllScans(): Promise<ScanRow[]> {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB/scans] Fetch all error:', error);
    throw new Error('Failed to fetch scans');
  }

  return data || [];
}
