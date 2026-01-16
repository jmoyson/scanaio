import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import type { Stats, IntentStat } from '@/lib/stats';

interface InsightsSectionProps {
  stats: Stats | null;
}

// Detailed info for each intent type with examples
const intentInfo: Record<string, { examples: string; recommendation: string }> = {
  informational: {
    examples: '"how to...", "what is...", "why does..."',
    recommendation: 'Users seeking answers get them directly from AI. Focus on unique insights AI can\'t summarize.',
  },
  commercial: {
    examples: '"best...", "X vs Y", "top 10...", "review"',
    recommendation: 'Comparison content is increasingly summarized. Add original testing and proprietary data.',
  },
  transactional: {
    examples: '"buy...", "pricing", "download", "sign up"',
    recommendation: 'Users need to click through to complete actions. These keywords remain valuable.',
  },
  navigational: {
    examples: '"[brand] login", "[company] support"',
    recommendation: 'Users want a specific site. Your brand keywords are generally protected.',
  },
};

// Get color based on position (high risk = orange, safer = neutral/green)
function getIntentColor(percent: number, isHighRisk: boolean): string {
  if (isHighRisk) {
    // Orange shades for high risk section
    if (percent >= 60) return 'border-[#FF4500] text-[#FF4500]';
    return 'border-[#FF4500]/70 text-[#FF4500]/80';
  }
  // Neutral/green for safer section
  if (percent <= 35) return 'border-green-500 text-green-600';
  return 'border-black/40 text-black/70';
}

export function InsightsSection({ stats }: InsightsSectionProps) {
  const intentStats = stats?.intentStats;
  const hasIntentData = intentStats && intentStats.intents.length > 0;

  // Split intents evenly: top 2 most affected on left, rest on right
  // Intents are already sorted by affectedPercent descending
  const allIntents = intentStats?.intents || [];
  const highRiskIntents = allIntents.slice(0, 2); // Top 2 most affected
  const saferIntents = allIntents.slice(2);       // Rest (lower affected)

  return (
    <section className="relative py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tight">
            AI Overview Impact by Search Intent
          </h2>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            {hasIntentData ? (
              <>Real data from {intentStats.totalKeywords.toLocaleString()} keywords across {stats.totalDomains} domains</>
            ) : (
              <>Patterns discovered from analyzing keywords across domains</>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* High Risk Intents */}
          <div className="bg-white border-2 border-[#FF4500] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#FF4500]/10 border-2 border-[#FF4500] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-black text-black">Most Affected</h3>
            </div>

            <div className="space-y-5">
              {hasIntentData && highRiskIntents.length > 0 ? (
                highRiskIntents.map((intent) => {
                  const info = intentInfo[intent.intent] || { examples: '', recommendation: '' };
                  const colors = getIntentColor(intent.affectedPercent, true);
                  const borderColor = colors.split(' ')[0];
                  const textColor = colors.split(' ')[1];

                  return (
                    <div key={intent.intent} className={`border-l-4 ${borderColor} pl-4`}>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <div className="font-bold text-base text-black">
                          {intent.label}
                        </div>
                        <div className={`text-2xl font-black ${textColor}`}>
                          {intent.affectedPercent}%
                        </div>
                      </div>
                      <div className="text-xs text-black/40 mb-2 font-mono">
                        {info.examples}
                      </div>
                      <p className="text-sm text-black/60">
                        {info.recommendation}
                      </p>
                    </div>
                  );
                })
              ) : (
                // Fallback to static content if no data
                <>
                  <div className="border-l-4 border-[#FF4500] pl-4">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="font-bold text-base text-black">Informational</div>
                      <div className="text-2xl font-black text-[#FF4500]">~75%</div>
                    </div>
                    <div className="text-xs text-black/40 mb-2 font-mono">"how to...", "what is..."</div>
                    <p className="text-sm text-black/60">
                      Users seeking answers get them directly from AI.
                    </p>
                  </div>
                  <div className="border-l-4 border-[#FF4500]/60 pl-4">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="font-bold text-base text-black">Commercial</div>
                      <div className="text-2xl font-black text-[#FF4500]/80">~60%</div>
                    </div>
                    <div className="text-xs text-black/40 mb-2 font-mono">"best...", "X vs Y", "review"</div>
                    <p className="text-sm text-black/60">
                      Comparison content is increasingly summarized by AI.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Safer Intents */}
          <div className="bg-white border-2 border-black/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-black/5 border-2 border-black/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black text-black">Safer Zones</h3>
            </div>

            <div className="space-y-5">
              {hasIntentData && saferIntents.length > 0 ? (
                saferIntents.map((intent) => {
                  const info = intentInfo[intent.intent] || { examples: '', recommendation: '' };
                  const colors = getIntentColor(intent.affectedPercent, false);
                  const borderColor = colors.split(' ')[0];
                  const textColor = colors.split(' ')[1];

                  return (
                    <div key={intent.intent} className={`border-l-4 ${borderColor} pl-4`}>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <div className="font-bold text-base text-black">
                          {intent.label}
                        </div>
                        <div className={`text-2xl font-black ${textColor}`}>
                          {intent.affectedPercent}%
                        </div>
                      </div>
                      <div className="text-xs text-black/40 mb-2 font-mono">
                        {info.examples}
                      </div>
                      <p className="text-sm text-black/60">
                        {info.recommendation}
                      </p>
                    </div>
                  );
                })
              ) : (
                // Fallback to static content if no data
                <>
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="font-bold text-base text-black">Transactional</div>
                      <div className="text-2xl font-black text-green-600">~30%</div>
                    </div>
                    <div className="text-xs text-black/40 mb-2 font-mono">"buy...", "pricing", "download"</div>
                    <p className="text-sm text-black/60">
                      Users need to click through to complete actions.
                    </p>
                  </div>
                  <div className="border-l-4 border-black/20 pl-4">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="font-bold text-base text-black">Navigational</div>
                      <div className="text-2xl font-black text-black/80">~25%</div>
                    </div>
                    <div className="text-xs text-black/40 mb-2 font-mono">"[brand] login", "[company] support"</div>
                    <p className="text-sm text-black/60">
                      Users want a specific site. Brand keywords are protected.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-black/50 max-w-3xl mx-auto">
            <strong>Key Takeaway:</strong> Even top-ranking keywords lose 40-60% of clicks when AI Overviews appear. Focus on keywords where users still need to visit your site.
          </p>
        </div>
      </div>
    </section>
  );
}
