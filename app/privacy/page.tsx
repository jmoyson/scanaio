import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Privacy Policy - CheckAIOverviews',
  description: 'Privacy policy for CheckAIOverviews.com',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Top Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-60 z-50" />

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        {/* Back Link */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-black mb-8 tracking-tight">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none text-black/70">
          <p className="text-sm text-black/40 mb-8">Last updated: January 2026</p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">What we collect</h2>
          <p>
            When you use CheckAIOverviews, we collect the domain names you submit for analysis.
            We do not collect personal information, email addresses, or require any account registration.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">How we use your data</h2>
          <p>
            Domain names submitted are used solely to fetch keyword data from third-party SEO APIs.
            Results are cached for 24 hours to improve performance and reduce API costs.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Data storage</h2>
          <p>
            Scan results are stored in our database for caching purposes. We do not sell or share
            your data with third parties beyond what's necessary to provide the service.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Cookies</h2>
          <p>
            We do not use tracking cookies. We may use essential cookies for basic functionality.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Contact</h2>
          <p>
            For privacy-related questions, contact us on{' '}
            <a href="https://x.com/jeremymoyson" className="text-[#FF4500] hover:underline" target="_blank" rel="noopener noreferrer">
              X (Twitter)
            </a>.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
