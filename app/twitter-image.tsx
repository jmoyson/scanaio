import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ScanAIO - See which keywords Google AI is stealing';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              marginBottom: 40,
            }}
          >
            <span style={{ color: '#111827' }}>Scan</span>
            <span style={{ color: '#FF4500' }}>AIO</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 40,
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.3,
              marginBottom: 48,
            }}
          >
            See which of your keywords
          </div>
          <div
            style={{
              fontSize: 40,
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.3,
              marginBottom: 48,
            }}
          >
            Google&apos;s AI is stealing
          </div>

          {/* Value props */}
          <div
            style={{
              display: 'flex',
              gap: 60,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 28,
                color: '#6B7280',
              }}
            >
              <span style={{ color: '#FF4500', fontWeight: 700 }}>✓</span>
              <span>Free</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 28,
                color: '#6B7280',
              }}
            >
              <span style={{ color: '#FF4500', fontWeight: 700 }}>✓</span>
              <span>30 seconds</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 28,
                color: '#6B7280',
              }}
            >
              <span style={{ color: '#FF4500', fontWeight: 700 }}>✓</span>
              <span>No signup</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '28px 80px',
            borderTop: '1px solid #E5E7EB',
            background: '#FAFAFA',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#9CA3AF',
              fontWeight: 500,
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
