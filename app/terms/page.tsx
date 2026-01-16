import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Terms of Service - CheckAIOverviews',
  description: 'Terms of service for CheckAIOverviews.com',
};

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none text-black/70">
          <p className="text-sm text-black/40 mb-8">Last updated: January 2026</p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Service Description</h2>
          <p>
            CheckAIOverviews is a free tool that analyzes which of your domain's ranking keywords
            trigger Google's AI Overviews. The service is provided "as is" without warranty.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Acceptable Use</h2>
          <p>
            You agree to use this service only for legitimate purposes. Automated bulk scanning,
            abuse of the API, or any activity that disrupts the service is prohibited.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Data Accuracy</h2>
          <p>
            We strive to provide accurate data but cannot guarantee the completeness or accuracy
            of the results. SEO data changes frequently and results should be used for informational
            purposes only.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Limitation of Liability</h2>
          <p>
            CheckAIOverviews and its creators are not liable for any damages arising from the use
            of this service. Use the information provided at your own risk.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the service constitutes
            acceptance of the updated terms.
          </p>

          <h2 className="text-xl font-bold text-black mt-8 mb-4">Contact</h2>
          <p>
            For questions about these terms, contact us on{' '}
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
