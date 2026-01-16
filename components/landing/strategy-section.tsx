import { OUTRANK_URL } from '@/lib/outrank';

export function StrategySection() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tight">
            How to Adapt Your Strategy
          </h2>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            Three steps to protect your organic traffic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FF4500] text-white border-2 border-[#FF4500] text-xl font-black mb-4">
              1
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Scan Your Domain</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Use this tool to identify which keywords are affected. Know your exposure before you make changes.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FF4500] text-white border-2 border-[#FF4500] text-xl font-black mb-4">
              2
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Pivot Your Content</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Double down on safe keywords. Create unique, hard-to-summarize content. Target transactional queries.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FF4500] text-white border-2 border-[#FF4500] text-xl font-black mb-4">
              3
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Get Cited in AI Overviews</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Can't beat them? Join them. Tools like{' '}
              <a
                href={OUTRANK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4500] hover:underline font-bold"
                data-umami-event="cta_outrank"
                data-umami-event-location="insights_strategy"
              >
                Outrank
              </a>
              {' '}help you get cited as a source in AI Overviews.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
