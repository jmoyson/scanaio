import { benefits } from '@/lib/landing-data';
import { Footer } from '@/components/landing/footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Use This Tool? | Check AI Overviews',
  description: 'Stop guessing which keywords are affected by AI Overviews. Make data-driven content decisions with our free tool.',
};

export default function WhyPage() {
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

      {/* Content */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight">
              Why Use This Tool?
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto">
              Stop guessing. Start making data-driven content decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-gray-50 border-2 border-black/5 p-8 hover:border-[#FF4500]/20 hover:bg-white transition-all"
                >
                  <div className="w-12 h-12 bg-[#FF4500]/10 border-2 border-[#FF4500]/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#FF4500]" />
                  </div>
                  <h2 className="text-lg font-bold text-black mb-2">{benefit.title}</h2>
                  <p className="text-sm text-black/60 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-[#FF4500] text-white font-bold text-lg hover:bg-[#FF4500]/90 transition-colors"
            >
              Scan Your Domain Now
            </Link>
            <p className="mt-4 text-sm text-black/50">
              Free forever. No registration required.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
