/**
 * Stats calculation from cached scans
 * Uses existing `scans` table and parses raw_response for detailed stats
 */

import { supabaseAdmin } from './supabase';

// Severity distribution tier
export interface SeverityTier {
  name: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

// Distribution of domains by severity
export interface SeverityDistribution {
  tiers: SeverityTier[];
  totalDomains: number;
}

// Impact stats (volume-based)
export interface ImpactStats {
  totalSearchVolume: number;
  atRiskSearchVolume: number;
  atRiskPercent: number;
}

// Intent-based stats (using DataForSEO's classification)
export interface IntentStat {
  intent: string;
  label: string;
  keywordsCount: number;
  affectedCount: number;
  affectedPercent: number;
}

export interface IntentStats {
  intents: IntentStat[];
  totalKeywords: number;
}

// Main stats interface
export interface Stats {
  totalDomains: number;
  totalKeywords: number;
  avgAffectedPercent: number;
  severityDistribution: SeverityDistribution;
  impactStats: ImpactStats;
  intentStats: IntentStats;
}

/**
 * Get stats from Supabase scans table
 * Calculates severity distribution, impact stats, and intent stats from real data
 */
export async function getStats(): Promise<Stats | null> {
  try {
    // Get all scans with raw_response for detailed analysis
    const { data: scans, error: scansError } = await supabaseAdmin
      .from('scans')
      .select('domain, keywords_total, keywords_with_aio, raw_response');

    if (scansError) {
      console.error('Error fetching scans:', scansError);
      return null;
    }

    if (!scans || scans.length === 0) {
      return null;
    }

    // Calculate basic totals
    let totalKeywords = 0;
    let totalAffected = 0;

    for (const scan of scans) {
      totalKeywords += scan.keywords_total || 0;
      totalAffected += scan.keywords_with_aio || 0;
    }

    const avgAffectedPercent = totalKeywords > 0
      ? Math.round((totalAffected / totalKeywords) * 100)
      : 0;

    // Calculate severity distribution
    const severityDistribution = calculateSeverityDistribution(scans);

    // Calculate impact and intent stats from raw_response
    const { impactStats, intentStats } = calculateDetailedStats(scans);

    return {
      totalDomains: scans.length,
      totalKeywords,
      avgAffectedPercent,
      severityDistribution,
      impactStats,
      intentStats,
    };
  } catch (error) {
    console.error('Error in getStats:', error);
    return null;
  }
}

/**
 * Calculate severity distribution from scans
 */
function calculateSeverityDistribution(scans: any[]): SeverityDistribution {
  const tiers = {
    critical: { count: 0, label: 'Critical', color: '#dc2626' },  // red-600
    high: { count: 0, label: 'High Risk', color: '#f97316' },     // orange-500
    medium: { count: 0, label: 'Medium', color: '#eab308' },      // yellow-500
    low: { count: 0, label: 'Low Risk', color: '#22c55e' },       // green-500
  };

  for (const scan of scans) {
    if (!scan.keywords_total || scan.keywords_total === 0) continue;

    const percent = (scan.keywords_with_aio / scan.keywords_total) * 100;

    if (percent > 75) {
      tiers.critical.count++;
    } else if (percent > 50) {
      tiers.high.count++;
    } else if (percent > 25) {
      tiers.medium.count++;
    } else {
      tiers.low.count++;
    }
  }

  const totalDomains = scans.length;

  return {
    tiers: [
      { name: 'critical', ...tiers.critical, percent: totalDomains > 0 ? Math.round((tiers.critical.count / totalDomains) * 100) : 0 },
      { name: 'high', ...tiers.high, percent: totalDomains > 0 ? Math.round((tiers.high.count / totalDomains) * 100) : 0 },
      { name: 'medium', ...tiers.medium, percent: totalDomains > 0 ? Math.round((tiers.medium.count / totalDomains) * 100) : 0 },
      { name: 'low', ...tiers.low, percent: totalDomains > 0 ? Math.round((tiers.low.count / totalDomains) * 100) : 0 },
    ],
    totalDomains,
  };
}

/**
 * Calculate impact stats and intent stats from raw_response JSONB
 */
function calculateDetailedStats(scans: any[]): { impactStats: ImpactStats; intentStats: IntentStats } {
  let totalSearchVolume = 0;
  let atRiskSearchVolume = 0;

  // Intent tracking
  const intentData: Record<string, { count: number; affected: number }> = {
    informational: { count: 0, affected: 0 },
    commercial: { count: 0, affected: 0 },
    transactional: { count: 0, affected: 0 },
    navigational: { count: 0, affected: 0 },
  };

  let totalKeywordsProcessed = 0;

  for (const scan of scans) {
    if (!scan.raw_response) continue;

    try {
      const rawData = scan.raw_response;
      const tasks = rawData.tasks || [];
      const items = tasks[0]?.result?.[0]?.items || [];

      for (const item of items) {
        const keywordData = item.keyword_data || {};
        const serpInfo = keywordData.serp_info || {};
        const keywordInfo = keywordData.keyword_info || {};
        const searchIntentInfo = keywordData.search_intent_info || {};

        // Search volume
        const searchVolume = keywordInfo.search_volume || 0;
        totalSearchVolume += searchVolume;

        // Check if has AI Overview
        const serpItemTypes = serpInfo.serp_item_types || [];
        const hasAiOverview = serpItemTypes.includes('ai_overview');

        if (hasAiOverview) {
          atRiskSearchVolume += searchVolume;
        }

        // Intent classification
        const mainIntent = searchIntentInfo.main_intent || 'unknown';
        if (intentData[mainIntent]) {
          intentData[mainIntent].count++;
          if (hasAiOverview) {
            intentData[mainIntent].affected++;
          }
        }

        totalKeywordsProcessed++;
      }
    } catch (e) {
      // Skip malformed raw_response
      continue;
    }
  }

  // Build impact stats
  const impactStats: ImpactStats = {
    totalSearchVolume,
    atRiskSearchVolume,
    atRiskPercent: totalSearchVolume > 0 ? Math.round((atRiskSearchVolume / totalSearchVolume) * 100) : 0,
  };

  // Build intent stats with labels
  const intentLabels: Record<string, string> = {
    informational: 'Informational',
    commercial: 'Commercial',
    transactional: 'Transactional',
    navigational: 'Navigational',
  };

  const intents: IntentStat[] = Object.entries(intentData)
    .filter(([_, data]) => data.count > 0)
    .map(([intent, data]) => ({
      intent,
      label: intentLabels[intent] || intent,
      keywordsCount: data.count,
      affectedCount: data.affected,
      affectedPercent: data.count > 0 ? Math.round((data.affected / data.count) * 100) : 0,
    }))
    .sort((a, b) => b.affectedPercent - a.affectedPercent); // Sort by most affected first

  const intentStats: IntentStats = {
    intents,
    totalKeywords: totalKeywordsProcessed,
  };

  return { impactStats, intentStats };
}
