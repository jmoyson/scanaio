/**
 * Shared Types for checkaioverviews.com
 *
 * Naming: Uses DataForSEO terminology (hasAiOverview, withAio)
 * Frontend labels can use "Stolen by AI" for branding
 */

// ============================================================================
// Constants
// ============================================================================

export const INTENT = {
  INFORMATIONAL: 'informational',
  COMMERCIAL: 'commercial',
  TRANSACTIONAL: 'transactional',
  NAVIGATIONAL: 'navigational',
} as const;

// ============================================================================
// Core Types
// ============================================================================

export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';

// ============================================================================
// Database Row Types (matching Supabase tables)
// ============================================================================

/** Table: scans - Raw API response archive */
export interface ScanRow {
  id: string;
  domain: string;
  raw_response: unknown;
  ip_address: string | null; // For rate limiting (nullable for historical scans)
  created_at: string;
}

/** Table: domains - Domain stats (one row per domain) */
export interface DomainRow {
  domain: string;
  last_scan_id: string | null;
  keywords_analyzed: number;
  keywords_with_aio: number;
  keywords_without_aio: number;
  intent_informational: number;
  intent_commercial: number;
  intent_transactional: number;
  intent_navigational: number;
  total_search_volume: number;
  aio_search_volume: number;
  first_scanned_at: string;
  last_scanned_at: string;
}

/** Table: keywords - Individual keywords for display */
export interface KeywordRow {
  id: string;
  domain: string;
  scan_id: string;
  keyword: string;
  search_volume: number;
  position: number;
  intent: SearchIntent;
  etv: number;
  has_ai_overview: boolean;
  risk_score: number;
  created_at: string;
}

/**
 * Table: stats - Global platform stats (single row)
 *
 * NOTE: total_keywords counts keyword-domain pairs (rankings), not unique keywords.
 * The same keyword appearing for 5 domains = 5 in total_keywords.
 */
export interface StatsRow {
  id: number;
  total_domains: number;
  total_keywords: number; // Count of rankings, not unique keywords
  keywords_with_aio: number;
  avg_aio_percent: number;
  total_search_volume: number;
  aio_search_volume: number;
  aio_percent: number;
  intent_informational: number;
  intent_commercial: number;
  intent_transactional: number;
  intent_navigational: number;
  severity_critical: number;
  severity_high: number;
  severity_medium: number;
  severity_low: number;
  updated_at: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface CheckRequest {
  domain: string;
}

/** Keyword as returned by API */
export interface Keyword {
  keyword: string;
  searchVolume: number;
  position: number;
  intent: SearchIntent;
  etv: number;
  hasAiOverview: boolean;
}

export interface CheckResponse {
  domain: string;
  keywords: Keyword[];
  stats: {
    total: number;
    withAio: number;
    withoutAio: number;
  };
  cachedAt: string;
}

export interface APIError {
  error: string;
  message: string;
}

// ============================================================================
// Parser Types
// ============================================================================

export interface ParsedKeyword {
  keyword: string;
  searchVolume: number;
  position: number;
  intent: SearchIntent;
  etv: number;
  hasAiOverview: boolean;
  riskScore: number;
}

export interface ParsedStats {
  total: number;
  withAio: number;
  withoutAio: number;
  byIntent: {
    informational: number;
    commercial: number;
    transactional: number;
    navigational: number;
  };
  totalSearchVolume: number;
  aioSearchVolume: number;
}
