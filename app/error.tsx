'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error);
  }, [error]);

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
          <AlertTriangle className="w-16 h-16 text-[#FF4500] mx-auto" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tight">
          Something went wrong
        </h1>

        <p className="text-base text-black/60 mb-8">
          We encountered an unexpected error. Please try again or return to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF4500] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#FF4500]/90 transition-all button-press"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider hover:bg-black/80 transition-all button-press"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
