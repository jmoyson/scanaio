import { ImageResponse } from 'next/og';
import { getDomain } from '@/lib/db';

export const runtime = 'edge';

export const alt = 'AI Overview Impact Report';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // Fetch domain data
  const domainData = await getDomain(domain);

  const isScanned = domainData !== null;
  const withAIO = domainData?.keywords_with_aio || 0;
  const total = domainData?.keywords_analyzed || 0;
  const percentage = total > 0 ? Math.round((withAIO / total) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: '100%',
            height: 8,
            background: '#FF4500',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '40px 80px',
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 20,
            }}
          >
            AI Overview Impact Report
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#111827',
              marginBottom: 40,
              letterSpacing: '-0.02em',
            }}
          >
            {domain}
          </div>

          {/* Stats */}
          {isScanned ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  color: '#FF4500',
                  letterSpacing: '-0.04em',
                }}
              >
                {withAIO}
              </span>
              <span
                style={{
                  fontSize: 60,
                  fontWeight: 300,
                  color: '#D1D5DB',
                  margin: '0 16px',
                }}
              >
                /
              </span>
              <span
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  color: '#111827',
                  letterSpacing: '-0.04em',
                }}
              >
                {total}
              </span>
            </div>
          ) : (
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#9CA3AF',
                marginBottom: 20,
              }}
            >
              Not scanned yet
            </div>
          )}

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              color: '#6B7280',
              fontWeight: 400,
            }}
          >
            {isScanned
              ? 'keywords affected by AI Overviews'
              : 'Check this domain for AI Overview impact'}
          </div>

          {/* Progress bar */}
          {isScanned && (
            <div
              style={{
                width: '60%',
                height: 14,
                background: '#F3F4F6',
                marginTop: 40,
                display: 'flex',
                borderRadius: 7,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  background: '#FF4500',
                  height: '100%',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 80px',
            borderTop: '1px solid #E5E7EB',
            background: '#FAFAFA',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: '#111827' }}>Scan</span>
            <span style={{ color: '#FF4500' }}>AIO</span>
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#9CA3AF',
            }}
          >
            scanaio.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
