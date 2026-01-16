import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-2 border-black/10 p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-5 tracking-tight">
            Want to Get Cited in AI Overviews?
          </h2>
          <p className="text-lg text-black/60 mb-8 max-w-2xl mx-auto">
            If your keywords are heavily affected, the next step is to get your content cited as a source in AI Overviews. That's where traffic is going.
          </p>

          <a
            href="https://outrank.so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF4500] text-white font-black text-sm uppercase tracking-wider hover:bg-[#FF4500]/90 transition-all border-2 border-[#FF4500]"
            data-umami-event="cta_outrank"
            data-umami-event-location="homepage"
          >
            Try Outrank
            <ArrowRight className="w-5 h-5" />
          </a>

          <div className="mt-6 text-sm text-black/50">
            Track which AI Overviews cite your content and optimize to appear more
          </div>
        </div>
      </div>
    </section>
  );
}
