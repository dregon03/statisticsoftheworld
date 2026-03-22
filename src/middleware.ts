import { NextResponse, type NextRequest } from 'next/server';

// Simple in-memory rate limiter for /api/v1/ routes
// Free tier: 100 req/day per IP
// In production, replace with Supabase or Redis counter

const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const counters = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = counters.get(ip);

  if (!entry || now > entry.resetAt) {
    counters.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + WINDOW_MS };
  }

  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT - entry.count);
  return { allowed: entry.count <= RATE_LIMIT, remaining, resetAt: entry.resetAt };
}

export function middleware(request: NextRequest) {
  // Only rate-limit /api/v1/ routes
  if (!request.nextUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Check for API key in header — bypass rate limit for authenticated users
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    // TODO: Validate API key against Supabase table for paid tiers
    // For now, any key bypasses rate limiting
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Tier', 'authenticated');
    return response;
  }

  const { allowed, remaining, resetAt } = getRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Free tier allows ${RATE_LIMIT} requests per day. Add an X-API-Key header for higher limits.`,
        resetAt: new Date(resetAt).toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetAt).toISOString(),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Headers', 'X-API-Key');

  return response;
}

export const config = {
  matcher: '/api/v1/:path*',
};
