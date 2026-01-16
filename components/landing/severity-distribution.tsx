import type { SeverityDistribution } from '@/lib/stats';

interface SeverityDistributionSectionProps {
  distribution: SeverityDistribution;
}

// Brand-consistent tier colors (shades of orange to gray)
const tierColors: Record<string, string> = {
  critical: '#FF4500',  // Brand orange - most severe
  high: '#FF6B35',      // Lighter orange
  medium: '#FFB088',    // Light orange/peach
  low: '#E5E5E5',       // Light gray - safest
};

// Tier descriptions
const tierDescriptions: Record<string, string> = {
  critical: '>75% keywords affected',
  high: '50-75% affected',
  medium: '25-50% affected',
  low: '<25% affected',
};

export function SeverityDistributionSection({ distribution }: SeverityDistributionSectionProps) {
  const { tiers, totalDomains } = distribution;

  if (totalDomains === 0) {
    return null;
  }

  // Filter tiers with actual domains
  const activeTiers = tiers.filter(t => t.count > 0);

  return (
    <section className="relative py-16 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3 tracking-tight">
            How Exposed Are Websites?
          </h2>
          <p className="text-base text-black/60">
            Distribution of <span className="font-bold">{totalDomains}</span> scanned domains by risk level
          </p>
        </div>

        {/* Main stacked bar */}
        <div className="bg-white border border-black/10 p-6 md:p-8">
          {/* Stacked bar */}
          <div className="relative h-10 md:h-12 flex rounded overflow-hidden border border-black/10">
            {activeTiers.map((tier) => (
              <div
                key={tier.name}
                className="relative flex items-center justify-center transition-all"
                style={{
                  width: `${tier.percent}%`,
                  backgroundColor: tierColors[tier.name],
                  minWidth: tier.count > 0 ? '48px' : '0',
                }}
              >
                <span
                  className="font-bold text-sm md:text-base"
                  style={{ color: tier.name === 'low' ? '#666' : 'white' }}
                >
                  {tier.count}
                </span>
              </div>
            ))}
          </div>

          {/* Legend - horizontal row */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {tiers.map((tier) => (
              <div key={tier.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: tierColors[tier.name] }}
                />
                <span className="text-sm text-black/70">
                  <span className="font-medium">{tier.label}</span>
                  <span className="text-black/40 ml-1">({tierDescriptions[tier.name]})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <p className="mt-6 text-center text-sm text-black/50">
          Where does your domain fall? <span className="font-medium text-[#FF4500]">Scan it to find out.</span>
        </p>
      </div>
    </section>
  );
}
