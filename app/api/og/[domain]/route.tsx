import { ImageResponse } from 'next/og';
import { getDomain } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;

  // Fetch domain data
  const domainData = await getDomain(domain);

  // If domain not found, show a "not scanned yet" state
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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #EFF6FF, #E0E7FF)',
          padding: '80px',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: 40,
          }}
        >
          {domain}
        </div>

        {/* Stats */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: isScanned ? '#EA580C' : '#6B7280',
            marginBottom: 20,
          }}
        >
          {isScanned ? `${withAIO} / ${total}` : 'Not scanned yet'}
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: 40,
            color: '#6B7280',
          }}
        >
          {isScanned ? 'keywords affected by AI Overviews' : 'Check this domain for AI Overview impact'}
        </div>

        {/* Progress bar - only show if scanned */}
        {isScanned && (
          <div
            style={{
              width: '80%',
              height: 20,
              background: '#E5E7EB',
              borderRadius: 10,
              marginTop: 40,
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                background: '#EA580C',
                height: '100%',
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
