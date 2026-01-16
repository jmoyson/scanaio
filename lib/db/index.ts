/**
 * Database Module Exports
 *
 * 4-table normalized schema:
 * - scans: Raw API responses (history)
 * - domains: Domain stats (one per domain)
 * - keywords: Top 15 keywords per domain (for display)
 * - stats: Global platform stats (single row)
 */

export { supabase } from './client';

// Scans - Raw data archive
export {
  insertScan,
  getLatestScan,
  getAllScans,
} from './scans';

// Domains - Domain stats
export {
  getCachedDomain,
  getDomain,
  upsertDomain,
  getAllDomains,
} from './domains';

// Keywords - For results display
export {
  getKeywordsByDomain,
  getAllKeywordsByDomain,
  replaceKeywords,
} from './keywords';

// Stats - Global platform stats
export {
  getGlobalStats,
  recalculateGlobalStats,
} from './stats';
