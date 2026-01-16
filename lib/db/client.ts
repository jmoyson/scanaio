/**
 * Supabase Database Client
 *
 * Single client instance for server-side database access.
 * IMPORTANT: Only use in API routes and Server Components.
 */

import { createClient } from "@supabase/supabase-js";

// Server-side only client - bypasses RLS for admin operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
