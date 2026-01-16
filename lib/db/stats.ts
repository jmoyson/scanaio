/**
 * Stats Table Operations
 *
 * Global platform stats - single row, pre-computed.
 * Recalculated from domains table after each scan.
 */

import { supabase } from './client';
import type { StatsRow } from '../types';

type SeverityTier = 'critical' | 'high' | 'medium' | 'low';

/**
 * Get global stats (single row)
 * This is what powers the landing page and insights
 */
export async function getGlobalStats(): Promise<StatsRow | null> {
  const { data, error } = await supabase
    .from('stats')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[DB/stats] Fetch error:', error);
    throw new Error('Failed to fetch stats');
  }

  return data;
}

/**
 * Recalculate global stats from domains table
 * Called after each scan to keep stats accurate
 */
export async function recalculateGlobalStats(): Promise<void> {
  // Fetch all domains
  const { data: domains, error: fetchError } = await supabase
    .from('domains')
    .select('*');

  if (fetchError) {
    console.error('[DB/stats] Fetch domains error:', fetchError);
    throw new Error('Failed to fetch domains for recalculation');
  }

  if (!domains || domains.length === 0) {
    // Reset to zeros
    await supabase
      .from('stats')
      .upsert({
        id: 1,
        total_domains: 0,
        total_keywords: 0,
        keywords_with_aio: 0,
        avg_aio_percent: 0,
        total_search_volume: 0,
        aio_search_volume: 0,
        aio_percent: 0,
        intent_informational: 0,
        intent_commercial: 0,
        intent_transactional: 0,
        intent_navigational: 0,
        severity_critical: 0,
        severity_high: 0,
        severity_medium: 0,
        severity_low: 0,
        updated_at: new Date().toISOString(),
      });
    return;
  }

  // Aggregate from all domains
  let totalKeywords = 0;
  let keywordsWithAio = 0;
  let totalVolume = 0;
  let aioVolume = 0;
  let intentInfo = 0;
  let intentComm = 0;
  let intentTrans = 0;
  let intentNav = 0;
  let severityCritical = 0;
  let severityHigh = 0;
  let severityMedium = 0;
  let severityLow = 0;

  for (const d of domains) {
    totalKeywords += d.keywords_analyzed;
    keywordsWithAio += d.keywords_with_aio;
    totalVolume += d.total_search_volume || 0;
    aioVolume += d.aio_search_volume || 0;
    intentInfo += d.intent_informational;
    intentComm += d.intent_commercial;
    intentTrans += d.intent_transactional;
    intentNav += d.intent_navigational;

    // Severity distribution
    const tier = getSeverityTier(d.keywords_with_aio, d.keywords_analyzed);
    if (tier === 'critical') severityCritical++;
    else if (tier === 'high') severityHigh++;
    else if (tier === 'medium') severityMedium++;
    else severityLow++;
  }

  const avgAioPercent = totalKeywords > 0
    ? (keywordsWithAio / totalKeywords) * 100
    : 0;

  const aioPercent = totalVolume > 0
    ? (aioVolume / totalVolume) * 100
    : 0;

  // Update stats row
  const { error: updateError } = await supabase
    .from('stats')
    .upsert({
      id: 1,
      total_domains: domains.length,
      total_keywords: totalKeywords,
      keywords_with_aio: keywordsWithAio,
      avg_aio_percent: Math.round(avgAioPercent * 10) / 10,
      total_search_volume: totalVolume,
      aio_search_volume: aioVolume,
      aio_percent: Math.round(aioPercent * 10) / 10,
      intent_informational: intentInfo,
      intent_commercial: intentComm,
      intent_transactional: intentTrans,
      intent_navigational: intentNav,
      severity_critical: severityCritical,
      severity_high: severityHigh,
      severity_medium: severityMedium,
      severity_low: severityLow,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    console.error('[DB/stats] Update error:', updateError);
    throw new Error('Failed to update stats');
  }
}

/**
 * Determine severity tier based on AIO percentage
 */
function getSeverityTier(withAio: number, total: number): SeverityTier {
  if (total === 0) return 'low';
  const percent = (withAio / total) * 100;
  if (percent >= 75) return 'critical';
  if (percent >= 50) return 'high';
  if (percent >= 25) return 'medium';
  return 'low';
}
