-- ============================================================================
-- Supabase Database Schema for checkaioverviews.com
-- ============================================================================
--
-- 4-table schema:
-- 1. scans     - Raw API responses (source of truth)
-- 2. domains   - Domain stats (computed from scans)
-- 3. keywords  - Keywords for display (computed from scans)
-- 4. stats     - Global stats (computed from domains)
--
-- Safe to run on fresh DB or DB with only scans table.
-- After running this, run the migration script to populate from scans.

-- ============================================================================
-- TABLE 1: scans (source of truth - raw API responses)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  raw_response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_domain ON scans(domain);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);

-- ============================================================================
-- TABLE 2: domains (computed from scans)
-- ============================================================================

CREATE TABLE IF NOT EXISTS domains (
  domain TEXT PRIMARY KEY,
  last_scan_id UUID REFERENCES scans(id),
  keywords_analyzed INTEGER NOT NULL DEFAULT 0,
  keywords_with_aio INTEGER NOT NULL DEFAULT 0,
  keywords_without_aio INTEGER NOT NULL DEFAULT 0,
  intent_informational INTEGER NOT NULL DEFAULT 0,
  intent_commercial INTEGER NOT NULL DEFAULT 0,
  intent_transactional INTEGER NOT NULL DEFAULT 0,
  intent_navigational INTEGER NOT NULL DEFAULT 0,
  total_search_volume BIGINT NOT NULL DEFAULT 0,
  aio_search_volume BIGINT NOT NULL DEFAULT 0,
  first_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_last_scanned ON domains(last_scanned_at DESC);

-- ============================================================================
-- TABLE 3: keywords (computed from scans)
-- ============================================================================

CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES domains(domain) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  intent TEXT NOT NULL DEFAULT 'informational',
  etv INTEGER NOT NULL DEFAULT 0,
  has_ai_overview BOOLEAN NOT NULL DEFAULT FALSE,
  risk_score FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keywords_domain ON keywords(domain);
CREATE INDEX IF NOT EXISTS idx_keywords_scan_id ON keywords(scan_id);

-- ============================================================================
-- TABLE 4: stats (single row, computed from domains)
-- ============================================================================
-- NOTE: total_keywords counts keyword-domain pairs (rankings), not unique keywords.
-- The same keyword appearing for 5 domains = 5 in total_keywords.
-- This is intentional: we analyze RANKINGS per domain, not unique keyword strings.

CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_domains INTEGER NOT NULL DEFAULT 0,
  total_keywords INTEGER NOT NULL DEFAULT 0, -- rankings count, not unique keywords
  keywords_with_aio INTEGER NOT NULL DEFAULT 0,
  avg_aio_percent FLOAT NOT NULL DEFAULT 0,
  total_search_volume BIGINT NOT NULL DEFAULT 0,
  aio_search_volume BIGINT NOT NULL DEFAULT 0,
  aio_percent FLOAT NOT NULL DEFAULT 0,
  intent_informational INTEGER NOT NULL DEFAULT 0,
  intent_commercial INTEGER NOT NULL DEFAULT 0,
  intent_transactional INTEGER NOT NULL DEFAULT 0,
  intent_navigational INTEGER NOT NULL DEFAULT 0,
  severity_critical INTEGER NOT NULL DEFAULT 0,
  severity_high INTEGER NOT NULL DEFAULT 0,
  severity_medium INTEGER NOT NULL DEFAULT 0,
  severity_low INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize stats row
INSERT INTO stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Block anonymous access (use service role key for all operations)
DROP POLICY IF EXISTS "No public access" ON scans;
DROP POLICY IF EXISTS "No public access" ON domains;
DROP POLICY IF EXISTS "No public access" ON keywords;
DROP POLICY IF EXISTS "No public access" ON stats;

CREATE POLICY "No public access" ON scans FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON domains FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON keywords FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON stats FOR ALL TO anon USING (false);
