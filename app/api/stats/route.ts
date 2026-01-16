/**
 * API route to get platform stats
 * Returns aggregated stats from Supabase scans table
 */

import { NextResponse } from 'next/server';
import { getStats } from '@/lib/stats';
import type { Stats } from '@/lib/stats';

export const runtime = 'edge';
export const revalidate = 60; // Cache for 1 minute - quick updates when new domains are scanned

// Default stats when no data is available
const defaultStats: Stats = {
  totalDomains: 0,
  totalKeywords: 0,
  avgAffectedPercent: 0,
  severityDistribution: {
    tiers: [
      { name: 'critical', label: 'Critical', count: 0, percent: 0, color: '#dc2626' },
      { name: 'high', label: 'High Risk', count: 0, percent: 0, color: '#f97316' },
      { name: 'medium', label: 'Medium', count: 0, percent: 0, color: '#eab308' },
      { name: 'low', label: 'Low Risk', count: 0, percent: 0, color: '#22c55e' },
    ],
    totalDomains: 0,
  },
  impactStats: {
    totalSearchVolume: 0,
    atRiskSearchVolume: 0,
    atRiskPercent: 0,
  },
  intentStats: {
    intents: [],
    totalKeywords: 0,
  },
};

export async function GET() {
  try {
    const stats = await getStats();

    if (!stats) {
      return NextResponse.json(defaultStats);
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
