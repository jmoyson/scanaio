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
  rawResponse: unknown
): Promise<ScanRow> {
  const { data, error } = await supabase
    .from('scans')
    .insert({
      domain,
      raw_response: rawResponse,
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
