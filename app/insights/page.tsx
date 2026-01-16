"use client";

import { useEffect, useState } from 'react';
import type { Stats } from '@/lib/stats';
import { SeverityDistributionSection } from '@/components/landing/severity-distribution';
import { InsightsSection } from '@/components/landing/insights-section';
import { StrategySection } from '@/components/landing/strategy-section';
import { Footer } from '@/components/landing/footer';
import Link from 'next/link';

export default function InsightsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Top Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-60 z-50" />

      {/* Header */}
      <header className="relative py-6 px-6 border-b border-black/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-black hover:text-[#FF4500] transition-colors">
            CheckAIOverviews
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-[#FF4500] text-white text-sm font-bold hover:bg-[#FF4500]/90 transition-colors"
          >
            Scan Your Domain
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight">
            AI Overview Insights
          </h1>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            Real data from domains we've scanned. See how AI Overviews are impacting different types of content.
          </p>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#FF4500]/20 border-t-[#FF4500] rounded-full animate-spin" />
          <p className="mt-4 text-black/50">Loading insights...</p>
        </div>
      )}

      {/* Stats Sections */}
      {!isLoading && stats && (
        <>
          <SeverityDistributionSection distribution={stats.severityDistribution} />
          <InsightsSection stats={stats} />
          <StrategySection />
        </>
      )}

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-black mb-4">
            Check Your Own Domain
          </h2>
          <p className="text-black/60 mb-6">
            See how your keywords are affected by AI Overviews.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#FF4500] text-white font-bold text-lg hover:bg-[#FF4500]/90 transition-colors"
          >
            Scan Now
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
