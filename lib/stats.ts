/**
 * Stats calculation from cached scans
 * Uses existing `scans` table
 */

import { supabaseAdmin } from './supabase';

export interface CategoryStat {
  name: string;
  affectedPercent: number;
  domainsCount: number;
}

export interface Stats {
  totalDomains: number;
  totalKeywords: number;
  avgAffectedPercent: number;
  categories: CategoryStat[];
}

// Fake category data for beta (will be replaced with real data later)
const FAKE_CATEGORIES: CategoryStat[] = [
  { name: 'Health & Fitness', affectedPercent: 78, domainsCount: 42 },
  { name: 'How-To & Tutorials', affectedPercent: 84, domainsCount: 38 },
  { name: 'Technology', affectedPercent: 71, domainsCount: 56 },
  { name: 'Finance', affectedPercent: 65, domainsCount: 31 },
  { name: 'Food & Recipes', affectedPercent: 82, domainsCount: 27 },
  { name: 'Travel', affectedPercent: 59, domainsCount: 23 },
];

/**
 * Get stats from Supabase scans table
 * Falls back to defaults if no data available
 */
export async function getStats(): Promise<Stats | null> {
  try {
    // Get count of unique domains
    const { count: totalDomains, error: countError } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching domain count:', countError);
      return null;
    }

    // Get aggregated stats from all scans
    const { data: scans, error: scansError } = await supabaseAdmin
      .from('scans')
      .select('keywords_total, keywords_with_aio');

    if (scansError) {
      console.error('Error fetching scans:', scansError);
      return null;
    }

    // Calculate totals
    let totalKeywords = 0;
    let totalAffected = 0;

    for (const scan of scans || []) {
      totalKeywords += scan.keywords_total || 0;
      totalAffected += scan.keywords_with_aio || 0;
    }

    // Calculate average affected percentage
    const avgAffectedPercent = totalKeywords > 0
      ? Math.round((totalAffected / totalKeywords) * 100)
      : 0;

    return {
      totalDomains: totalDomains || 0,
      totalKeywords,
      avgAffectedPercent,
      categories: FAKE_CATEGORIES,
    };
  } catch (error) {
    console.error('Error in getStats:', error);
    return null;
  }
}
