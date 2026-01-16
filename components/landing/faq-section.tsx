import { faqs } from '@/lib/landing-data';

export function FAQSection() {
  return (
    <section className="relative py-20 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-1 bg-white border-2 border-black/10">
          {faqs.map((faq, i) => (
            <details key={i} className="group border-b border-black/10 last:border-b-0">
              <summary className="w-full px-8 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-bold text-base pr-4">{faq.q}</span>
                <span className="text-xl font-black text-[#FF4500] shrink-0 group-open:hidden">
                  +
                </span>
                <span className="text-xl font-black text-[#FF4500] shrink-0 hidden group-open:inline">
                  −
                </span>
              </summary>
              <div className="px-8 pb-5 text-sm text-black/70 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
