import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { KeywordsTable } from '@/components/results/keywords-table';
import { ShareButtons } from '@/components/results/share-buttons';
import { Footer } from '@/components/landing/footer';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;

  return {
    title: `${domain} - AI Overview Analysis`,
    description: `See which of ${domain}'s ranking keywords are affected by Google's AI Overviews`,
    openGraph: {
      title: `${domain} - AI Overview Analysis`,
      description: `Check which keywords trigger AI Overviews for ${domain}`,
      images: [`/api/og/${domain}`],
    },
  };
}

export default async function ResultsPage({ params }: Props) {
  const { domain } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/check`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  // Handle empty results
  if (data.stats.total === 0) {
    return (
      <main className="min-h-screen bg-white">
        {/* Background Grid */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-60 z-50" />

        <div className="relative max-w-3xl mx-auto text-center py-32 px-6">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight">
              No Ranking Keywords Found
            </h1>
            <p className="text-lg text-black/60 mb-2">
              We could not find any ranking keywords for <span className="font-bold text-black">{domain}</span>
            </p>
            <p className="text-base text-black/40 mb-10">
              This could mean the domain is new, has low rankings, or does not rank in US English results.
            </p>
            <a
              href="/"
              className="inline-block px-10 py-4 bg-[#FF4500] text-white font-black text-sm uppercase tracking-wider hover:bg-[#FF4500]/90 transition-all border-2 border-[#FF4500] button-press"
            >
              Try Another Domain
            </a>
          </div>
        </div>
      </main>
    );
  }

  const { total, withAio, withoutAio } = data.stats;
  const impactPercentage = total > 0 ? Math.round((withAio / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Top Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-60 z-50" />

      <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <header className="mb-8 md:mb-10">
          {/* Back Link */}
          <div className="mb-6 animate-fade-in">
            <a href="/" className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Scan another domain</span>
            </a>
          </div>

          {/* Domain + Key Insight */}
          <div className="text-center animate-fade-in-up">
            {/* Domain - The Anchor */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-black mb-3">
              {domain}
            </h1>

            {/* Label */}
            <p className="text-[10px] md:text-xs text-black/40 uppercase tracking-[0.2em] font-bold mb-6">
              AI Overview Impact Report
            </p>

            {/* Key Insight - The Main Number */}
            <div className="mb-2">
              <span className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter">
                <span className="text-[#FF4500]">{withAio}</span>
                <span className="text-black/20 mx-1 md:mx-2">/</span>
                <span className="text-black">{total}</span>
              </span>
            </div>

            {/* Supporting Text */}
            <p className="text-base md:text-lg text-black/50 font-light">
              keywords affected by AI Overviews
            </p>

            {/* Scan Timestamp */}
            <p className="text-[10px] text-black/30 mt-4 font-mono">
              Scanned {new Date(data.cachedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </header>

        {/* Keywords Section - Direct, no redundant cards */}
        <section className="mb-8 animate-fade-in-up animation-delay-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg md:text-xl font-black text-black tracking-tight">
              Keyword Analysis
            </h2>
            <span className="text-xs text-black/40 font-mono">
              Top {data.keywords.length} keywords by risk score
            </span>
          </div>
          <KeywordsTable keywords={data.keywords} />
        </section>

        {/* Share Section - Compact */}
        <section className="mb-10 animate-fade-in animation-delay-300">
          <ShareButtons
            domain={domain}
            impactPercentage={impactPercentage}
            totalKeywords={total}
            affectedKeywords={withAio}
          />
        </section>

        {/* CTA Section - Clean */}
        <section className="animate-fade-in-up animation-delay-400">
          <div className="bg-gray-50 border border-black/10 p-6 md:p-10 text-center">
            <h3 className="text-xl md:text-2xl font-black text-black mb-2 tracking-tight">
              Want to get cited in AI Overviews?
            </h3>
            <p className="text-sm md:text-base text-black/50 mb-6 max-w-md mx-auto">
              Stop losing traffic to AI. Get your content cited instead.
            </p>
            <a
              href="https://outrank.so"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF4500] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#FF4500]/90 transition-all button-press"
            >
              Learn More at Outrank
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
