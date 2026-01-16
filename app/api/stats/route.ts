/**
 * API route to get platform stats
 * Returns aggregated stats from Supabase scans table
 */

import { NextResponse } from 'next/server';
import { getStats } from '@/lib/stats';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const stats = await getStats();

    if (!stats) {
      return NextResponse.json({
        totalDomains: 0,
        totalKeywords: 0,
        avgAffectedPercent: 0,
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
