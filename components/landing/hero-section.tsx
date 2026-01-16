"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import type { Stats } from '@/lib/stats';
import { isValidDomain, cleanDomain } from '@/lib/domain-utils';

interface HeroSectionProps {
  stats: Stats | null;
  isLoading?: boolean;
}

export function HeroSection({ stats, isLoading = false }: HeroSectionProps) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedDomain = cleanDomain(domain);

      // Validate domain format before making API call
      if (!isValidDomain(normalizedDomain)) {
        throw new Error('Please enter a valid domain (e.g., example.com)');
      }

      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: normalizedDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check domain');
      }

      router.push(`/d/${normalizedDomain}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl w-full">
        {/* Headline */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            <span className="block text-[#FF4500]">AI STOLE</span>
            <span className="block text-[#FF4500]">YOUR</span>
            <span className="block text-black">TRAFFIC</span>
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-black/70 font-light leading-relaxed mb-3">
              Google's AI Overview is hijacking your hard-earned rankings.
            </p>
            <p className="text-base text-black/50 font-light">
              See exactly which of your keywords are losing traffic to AI.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-[#FF4500] blur-sm opacity-10" />
            <div className="relative bg-white border-2 border-black p-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  disabled={loading}
                  className="flex-1 px-6 py-4 text-base bg-white border-2 border-black/10 text-black !outline-none focus:!outline-none focus-visible:!outline-none ring-0 focus:ring-0 focus:border-black/10 disabled:opacity-50 placeholder:text-black/30 font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !domain}
                  className="px-10 py-4 bg-[#FF4500] text-white font-black text-sm uppercase tracking-wider hover:bg-[#FF4500]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-2 border-[#FF4500]"
                >
                  {loading ? 'SCANNING' : 'SCAN NOW'}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 border-2 border-[#FF4500] bg-[#FF4500]/5">
              <p className="text-sm text-[#FF4500] text-center font-mono">{error}</p>
            </div>
          )}
        </form>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-8 mb-20 text-sm text-black/40 flex-wrap">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-black/30" />
            <span>Instant Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-black/30" />
            <span>No Registration</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-black/30" />
            <span>100% Free Forever</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 max-w-4xl mx-auto">
          <div className="bg-black/5 border border-black/10 p-6 text-center hover:bg-black/10 transition-all group">
            <div className="text-3xl md:text-4xl font-black text-black mb-2 group-hover:scale-110 transition-transform">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-black/10 animate-pulse rounded" />
              ) : (
                <>{stats?.avgAioPercent || 0}%</>
              )}
            </div>
            <div className="text-xs md:text-sm text-black/50 uppercase tracking-wider font-bold">
              Avg Keywords Affected
            </div>
          </div>
          <div className="bg-black/5 border border-black/10 p-6 text-center hover:bg-black/10 transition-all group">
            <div className="text-3xl md:text-4xl font-black text-black mb-2 group-hover:scale-110 transition-transform">
              {isLoading ? (
                <span className="inline-block w-12 h-8 bg-black/10 animate-pulse rounded" />
              ) : (
                <>{stats?.totalDomains || 0}+</>
              )}
            </div>
            <div className="text-xs md:text-sm text-black/50 uppercase tracking-wider font-bold">
              Domains Scanned
            </div>
          </div>
          <div className="bg-black/5 border border-black/10 p-6 text-center hover:bg-black/10 transition-all group">
            <div className="text-3xl md:text-4xl font-black text-black mb-2 group-hover:scale-110 transition-transform">
              {isLoading ? (
                <span className="inline-block w-16 h-8 bg-black/10 animate-pulse rounded" />
              ) : (
                <>{stats?.totalKeywords?.toLocaleString() || 0}+</>
              )}
            </div>
            <div className="text-xs md:text-sm text-black/50 uppercase tracking-wider font-bold">
              Rankings Analyzed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
