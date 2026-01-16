/**
 * Default OG Image - Used for home page and pages without domain-specific images
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #EFF6FF, #E0E7FF)',
          padding: '80px',
        }}
      >
        {/* Main Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 30,
            textAlign: 'center',
          }}
        >
          Check AI Overviews
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: '#6B7280',
            marginBottom: 50,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          See which of your keywords trigger Google&apos;s AI Overviews
        </div>

        {/* Visual indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#EA580C',
            }}
          />
          <div
            style={{
              fontSize: 28,
              color: '#EA580C',
              fontWeight: 600,
            }}
          >
            AIO - At Risk
          </div>
          <div style={{ width: 40 }} />
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#22C55E',
            }}
          />
          <div
            style={{
              fontSize: 28,
              color: '#22C55E',
              fontWeight: 600,
            }}
          >
            Safe
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 24,
            color: '#9CA3AF',
            marginTop: 60,
          }}
        >
          checkaioverviews.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
