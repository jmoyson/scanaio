/**
 * One-shot Migration Script
 *
 * Populates domains, keywords, and stats tables from the scans table.
 * Safe to run multiple times - it will overwrite existing data.
 *
 * Prerequisites:
 * 1. Run supabase-schema.sql first to create tables
 * 2. scans table must have raw_response data
 *
 * Run with: npx dotenv -e .env.local -- npx tsx scripts/migrate-domain-stats.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// Types
// ============================================================================

type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

interface ParsedKeyword {
  keyword: string;
  searchVolume: number;
  position: number;
  intent: SearchIntent;
  etv: number;
  hasAiOverview: boolean;
  riskScore: number;
}

interface ParsedStats {
  total: number;
  withAio: number;
  withoutAio: number;
  byIntent: Record<SearchIntent, number>;
  totalSearchVolume: number;
  aioSearchVolume: number;
}

// ============================================================================
// Parsers (same logic as lib/keyword-parser.ts)
// ============================================================================

function parseIntent(intent: string | undefined): SearchIntent {
  const normalized = intent?.toLowerCase();
  if (normalized === 'commercial') return 'commercial';
  if (normalized === 'transactional') return 'transactional';
  if (normalized === 'navigational') return 'navigational';
  return 'informational';
}

function calculateRiskScore(searchVolume: number, position: number, hasAiOverview: boolean): number {
  const volumeWeight = searchVolume || 1;
  const aioMultiplier = hasAiOverview ? 2 : 0.5;
  const rankMultiplier = 1 / Math.sqrt(position || 1);
  return volumeWeight * aioMultiplier * rankMultiplier;
}

function parseRawResponse(rawResponse: any): { keywords: ParsedKeyword[]; stats: ParsedStats } {
  const tasks = rawResponse?.tasks || [];

  if (tasks.length === 0 || !tasks[0]?.result?.[0]?.items) {
    return {
      keywords: [],
      stats: {
        total: 0,
        withAio: 0,
        withoutAio: 0,
        byIntent: { informational: 0, commercial: 0, transactional: 0, navigational: 0 },
        totalSearchVolume: 0,
        aioSearchVolume: 0,
      },
    };
  }

  const items = tasks[0].result[0].items || [];

  // Parse all keywords
  const keywords: ParsedKeyword[] = items.map((item: any) => {
    const serpItemTypes = item.keyword_data?.serp_info?.serp_item_types || [];
    const hasAiOverview = serpItemTypes.includes('ai_overview');
    const intent = parseIntent(item.keyword_data?.search_intent_info?.main_intent);
    const searchVolume = item.keyword_data?.keyword_info?.search_volume || 0;
    const position = item.ranked_serp_element?.serp_item?.rank_absolute || 0;
    const etv = item.ranked_serp_element?.serp_item?.etv || 0;

    return {
      keyword: item.keyword_data?.keyword || 'Unknown',
      searchVolume,
      position,
      intent,
      etv,
      hasAiOverview,
      riskScore: calculateRiskScore(searchVolume, position, hasAiOverview),
    };
  });

  // Compute stats from all keywords
  let withAio = 0;
  let withoutAio = 0;
  let totalSearchVolume = 0;
  let aioSearchVolume = 0;
  const byIntent: Record<SearchIntent, number> = {
    informational: 0,
    commercial: 0,
    transactional: 0,
    navigational: 0
  };

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
    keywords,
    stats: {
      total: keywords.length,
      withAio,
      withoutAio,
      byIntent,
      totalSearchVolume,
      aioSearchVolume,
    },
  };
}

// ============================================================================
// Migration
// ============================================================================

async function migrate() {
  console.log('='.repeat(50));
  console.log('Migration: Populate tables from scans');
  console.log('='.repeat(50));
  console.log('');

  // Step 1: Fetch all scans
  console.log('Step 1: Fetching scans...');
  const { data: scans, error: scansError } = await supabase
    .from('scans')
    .select('*')
    .order('domain')
    .order('created_at', { ascending: false });

  if (scansError) {
    console.error('Error fetching scans:', scansError);
    process.exit(1);
  }

  console.log(`  Found ${scans?.length || 0} total scans`);

  if (!scans || scans.length === 0) {
    console.log('  No scans to migrate. Done.');
    return;
  }

  // Step 2: Group by domain, keep only latest scan per domain
  console.log('\nStep 2: Grouping by domain (keeping latest)...');
  const latestByDomain = new Map<string, any>();
  for (const scan of scans) {
    if (!latestByDomain.has(scan.domain)) {
      latestByDomain.set(scan.domain, scan);
    }
  }
  console.log(`  Found ${latestByDomain.size} unique domains`);

  // Step 3: Clear existing data (fresh start)
  console.log('\nStep 3: Clearing existing domains/keywords...');
  await supabase.from('keywords').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('domains').delete().neq('domain', '');
  console.log('  Done');

  // Step 4: Process each domain
  console.log('\nStep 4: Processing domains...');
  let successDomains = 0;
  let successKeywords = 0;
  let errors = 0;

  for (const [domain, scan] of latestByDomain) {
    try {
      const { keywords, stats } = parseRawResponse(scan.raw_response);

      // Insert domain
      const { error: domainError } = await supabase
        .from('domains')
        .insert({
          domain,
          last_scan_id: scan.id,
          keywords_analyzed: stats.total,
          keywords_with_aio: stats.withAio,
          keywords_without_aio: stats.withoutAio,
          intent_informational: stats.byIntent.informational,
          intent_commercial: stats.byIntent.commercial,
          intent_transactional: stats.byIntent.transactional,
          intent_navigational: stats.byIntent.navigational,
          total_search_volume: stats.totalSearchVolume,
          aio_search_volume: stats.aioSearchVolume,
          first_scanned_at: scan.created_at,
          last_scanned_at: scan.created_at,
        });

      if (domainError) {
        console.error(`  [ERROR] ${domain}: ${domainError.message}`);
        errors++;
        continue;
      }

      // Insert keywords
      if (keywords.length > 0) {
        const keywordRows = keywords.map(kw => ({
          domain,
          scan_id: scan.id,
          keyword: kw.keyword,
          search_volume: kw.searchVolume,
          position: kw.position,
          intent: kw.intent,
          etv: Math.round(kw.etv),
          has_ai_overview: kw.hasAiOverview,
          risk_score: kw.riskScore,
        }));

        const { error: keywordsError } = await supabase.from('keywords').insert(keywordRows);

        if (keywordsError) {
          console.error(`  [ERROR] ${domain} keywords: ${keywordsError.message}`);
          errors++;
          continue;
        }

        successKeywords += keywords.length;
      }

      console.log(`  [OK] ${domain}: ${stats.total} keywords, ${stats.withAio} with AIO`);
      successDomains++;
    } catch (e) {
      console.error(`  [ERROR] ${domain}: ${e}`);
      errors++;
    }
  }

  // Step 5: Recalculate global stats
  console.log('\nStep 5: Calculating global stats...');
  const { data: domains } = await supabase.from('domains').select('*');

  if (domains && domains.length > 0) {
    const totalDomains = domains.length;
    const totalKeywords = domains.reduce((sum, d) => sum + d.keywords_analyzed, 0);
    const keywordsWithAio = domains.reduce((sum, d) => sum + d.keywords_with_aio, 0);
    const totalSearchVolume = domains.reduce((sum, d) => sum + (d.total_search_volume || 0), 0);
    const aioSearchVolume = domains.reduce((sum, d) => sum + (d.aio_search_volume || 0), 0);

    const intentInformational = domains.reduce((sum, d) => sum + d.intent_informational, 0);
    const intentCommercial = domains.reduce((sum, d) => sum + d.intent_commercial, 0);
    const intentTransactional = domains.reduce((sum, d) => sum + d.intent_transactional, 0);
    const intentNavigational = domains.reduce((sum, d) => sum + d.intent_navigational, 0);

    // Calculate severity distribution
    let severityCritical = 0, severityHigh = 0, severityMedium = 0, severityLow = 0;
    for (const d of domains) {
      const pct = d.keywords_analyzed > 0 ? (d.keywords_with_aio / d.keywords_analyzed) * 100 : 0;
      if (pct >= 75) severityCritical++;
      else if (pct >= 50) severityHigh++;
      else if (pct >= 25) severityMedium++;
      else severityLow++;
    }

    const avgAioPercent = totalKeywords > 0 ? (keywordsWithAio / totalKeywords) * 100 : 0;
    const aioPercent = totalSearchVolume > 0 ? (aioSearchVolume / totalSearchVolume) * 100 : 0;

    await supabase.from('stats').upsert({
      id: 1,
      total_domains: totalDomains,
      total_keywords: totalKeywords,
      keywords_with_aio: keywordsWithAio,
      avg_aio_percent: Math.round(avgAioPercent * 10) / 10,
      total_search_volume: totalSearchVolume,
      aio_search_volume: aioSearchVolume,
      aio_percent: Math.round(aioPercent * 10) / 10,
      intent_informational: intentInformational,
      intent_commercial: intentCommercial,
      intent_transactional: intentTransactional,
      intent_navigational: intentNavigational,
      severity_critical: severityCritical,
      severity_high: severityHigh,
      severity_medium: severityMedium,
      severity_low: severityLow,
      updated_at: new Date().toISOString(),
    });

    console.log('  Done');
  }

  // Summary
  console.log('');
  console.log('='.repeat(50));
  console.log('Migration Complete');
  console.log('='.repeat(50));
  console.log(`Domains:  ${successDomains}/${latestByDomain.size}`);
  console.log(`Keywords: ${successKeywords}`);
  console.log(`Errors:   ${errors}`);
}

migrate().catch(console.error);
