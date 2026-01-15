import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (resets on server restart - fine for MVP)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getRateLimitKey(req: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'anonymous';
  return `ratelimit:${ip}`;
}

export function proxy(request: NextRequest) {
  // Only rate limit /api/check endpoint
  if (!request.nextUrl.pathname.startsWith('/api/check')) {
    return NextResponse.next();
  }

  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimit.get(key);

  // Clean up expired entries (simple garbage collection)
  if (record && now > record.resetTime) {
    rateLimit.delete(key);
  }

  const current = rateLimit.get(key);

  if (!current) {
    // First request in window
    rateLimit.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (current.count >= RATE_LIMIT) {
    // Rate limit exceeded
    return NextResponse.json(
      {
        error: 'Rate Limit Exceeded',
        message: `Too many requests. Please try again in ${Math.ceil((current.resetTime - now) / 1000 / 60)} minutes.`,
      },
      { status: 429 }
    );
  }

  // Increment counter
  current.count += 1;
  rateLimit.set(key, current);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/check',
};
