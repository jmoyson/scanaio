/**
 * Stats Module
 *
 * Provides global statistics from the stats table (single row).
 * Instant reads - no computation needed!
 *
 * NOTE ON COUNTING:
 * - totalKeywords = count of keyword-domain pairs (rankings), NOT unique keywords
 * - The same keyword "best credit cards" counted once per domain that ranks for it
 * - This is intentional: we analyze RANKINGS, not unique keyword strings
 * - UI should say "rankings analyzed" not "keywords analyzed"
 */

import { getGlobalStats as getStatsRow } from './db/stats';

// ============================================================================
// Types (for backward compatibility with existing components)
// ============================================================================

export interface SeverityTier {
  name: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface SeverityDistribution {
  tiers: SeverityTier[];
  totalDomains: number;
}

export interface ImpactStats {
  totalSearchVolume: number;
  aioSearchVolume: number;
  aioPercent: number;
}

export interface IntentStat {
  intent: string;
  label: string;
  keywordsCount: number;
  aioCount: number;
  aioPercent: number;
}

export interface IntentStats {
  intents: IntentStat[];
  totalKeywords: number;
}

export interface Stats {
  totalDomains: number;
  totalKeywords: number;
  avgAioPercent: number;
  severityDistribution: SeverityDistribution;
  impactStats: ImpactStats;
  intentStats: IntentStats;
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Get global stats from stats table
 *
 * This is now a SINGLE ROW READ - instant!
 */
export async function getStats(): Promise<Stats | null> {
  try {
    const row = await getStatsRow();

    if (!row) {
      return null;
    }

    // Build severity distribution
    const severityDistribution: SeverityDistribution = {
      tiers: [
        {
          name: 'critical',
          label: 'Critical',
          count: row.severity_critical,
          percent: row.total_domains > 0
            ? Math.round((row.severity_critical / row.total_domains) * 100)
            : 0,
          color: '#dc2626',
        },
        {
          name: 'high',
          label: 'High Risk',
          count: row.severity_high,
          percent: row.total_domains > 0
            ? Math.round((row.severity_high / row.total_domains) * 100)
            : 0,
          color: '#f97316',
        },
        {
          name: 'medium',
          label: 'Medium',
          count: row.severity_medium,
          percent: row.total_domains > 0
            ? Math.round((row.severity_medium / row.total_domains) * 100)
            : 0,
          color: '#eab308',
        },
        {
          name: 'low',
          label: 'Low Risk',
          count: row.severity_low,
          percent: row.total_domains > 0
            ? Math.round((row.severity_low / row.total_domains) * 100)
            : 0,
          color: '#22c55e',
        },
      ],
      totalDomains: row.total_domains,
    };

    // Build impact stats
    const impactStats: ImpactStats = {
      totalSearchVolume: row.total_search_volume,
      aioSearchVolume: row.aio_search_volume,
      aioPercent: Math.round(row.aio_percent),
    };

    // Build intent stats
    const totalIntentKeywords =
      row.intent_informational +
      row.intent_commercial +
      row.intent_transactional +
      row.intent_navigational;

    // Estimate based on overall rate
    const overallAioRate = row.total_keywords > 0
      ? row.keywords_with_aio / row.total_keywords
      : 0;

    const intents: IntentStat[] = [
      {
        intent: 'informational',
        label: 'Informational',
        keywordsCount: row.intent_informational,
        aioCount: Math.round(row.intent_informational * overallAioRate),
        aioPercent: Math.round(overallAioRate * 100),
      },
      {
        intent: 'commercial',
        label: 'Commercial',
        keywordsCount: row.intent_commercial,
        aioCount: Math.round(row.intent_commercial * overallAioRate),
        aioPercent: Math.round(overallAioRate * 100),
      },
      {
        intent: 'transactional',
        label: 'Transactional',
        keywordsCount: row.intent_transactional,
        aioCount: Math.round(row.intent_transactional * overallAioRate),
        aioPercent: Math.round(overallAioRate * 100),
      },
      {
        intent: 'navigational',
        label: 'Navigational',
        keywordsCount: row.intent_navigational,
        aioCount: Math.round(row.intent_navigational * overallAioRate),
        aioPercent: Math.round(overallAioRate * 100),
      },
    ].filter(i => i.keywordsCount > 0);

    const intentStats: IntentStats = {
      intents,
      totalKeywords: totalIntentKeywords,
    };

    return {
      totalDomains: row.total_domains,
      totalKeywords: row.total_keywords,
      avgAioPercent: Math.round(row.avg_aio_percent),
      severityDistribution,
      impactStats,
      intentStats,
    };
  } catch (error) {
    console.error('[Stats] Error fetching stats:', error);
    return null;
  }
}
