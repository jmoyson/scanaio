import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Top Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-60 z-50" />

      <div className="relative text-center max-w-md">
        <div className="mb-6">
          <div className="text-8xl font-black text-black/10">404</div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tight">
          Page not found
        </h1>

        <p className="text-base text-black/60 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF4500] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#FF4500]/90 transition-all button-press"
          >
            <Search className="w-4 h-4" />
            Scan a Domain
          </a>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black/5 text-black font-bold text-sm uppercase tracking-wider hover:bg-black/10 transition-all button-press"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </a>
        </div>
      </div>
    </main>
  );
}
