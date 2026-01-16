"use client";

import { useEffect, useState } from 'react';
import type { Stats } from '@/lib/stats';
import { HeroSection } from '@/components/landing/hero-section';
import { ImpactBanner } from '@/components/landing/impact-banner';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setStatsLoading(false));
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

      <HeroSection stats={stats} isLoading={statsLoading} />
      {stats && (
        <ImpactBanner
          impactStats={stats.impactStats}
          totalDomains={stats.totalDomains}
        />
      )}
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
