/**
 * Supabase Module - Backward Compatibility
 *
 * @deprecated Import from lib/db instead
 */

export { supabase as supabaseAdmin } from './db/client';
export * from './db';
export type { ScanRow as Scan, DomainRow as DomainStatsRow } from './types';
