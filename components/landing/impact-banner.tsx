import type { ImpactStats } from '@/lib/stats';

interface ImpactBannerProps {
  impactStats: ImpactStats;
  totalDomains: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function ImpactBanner({ impactStats, totalDomains }: ImpactBannerProps) {
  const { totalSearchVolume, aioPercent } = impactStats;

  if (totalSearchVolume === 0) {
    return null;
  }

  return (
    <div className="bg-[#FF4500]/5 border-y border-[#FF4500]/20 py-5 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main stat line */}
        <p className="text-base md:text-lg text-black/80 leading-relaxed">
          We've analyzed{' '}
          <span className="font-black text-[#FF4500]">
            {formatNumber(totalSearchVolume)}
          </span>
          {' '}monthly searches across{' '}
          <span className="font-black text-black">
            {totalDomains} domains
          </span>
          .{' '}
          <span className="font-black text-[#FF4500]">
            {aioPercent}%
          </span>
          {' '}of that traffic is affected by AI Overviews.
        </p>

        {/* CTA line */}
        <p className="mt-1.5 text-sm text-black/50">
          Is your website one of them?{' '}
          <span className="text-[#FF4500] font-medium">Check your domain above</span>{' '}
          to find out.
        </p>
      </div>
    </div>
  );
}
