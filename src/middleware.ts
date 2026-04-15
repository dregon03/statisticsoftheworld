import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate limits per tier
const TIER_LIMITS: Record<string, number> = {
  anonymous: 1000,      // No key, per IP
  free: 1000,           // Free API key
  pro: 50000,           // $49/mo
  business: 500000,     // $500/mo
  enterprise: 10000000, // Custom / unlimited
};

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory counter for anonymous (IP-based) rate limiting
const ipCounters = new Map<string, { count: number; resetAt: number }>();

function getIpRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const limit = TIER_LIMITS.anonymous;
  const entry = ipCounters.get(ip);

  if (!entry || now > entry.resetAt) {
    ipCounters.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetAt: now + WINDOW_MS };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
}

export async function middleware(request: NextRequest) {
  // Only rate-limit /api/v1/ routes
  if (!request.nextUrl.pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  // CORS headers for all API responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const apiKey = request.headers.get('x-api-key');

  if (apiKey) {
    // Validate API key against Supabase
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: keyData } = await supabase
        .from('sotw_api_keys')
        .select('id, tier, rate_limit, requests_today, reset_at, active')
        .eq('api_key', apiKey)
        .single();

      if (!keyData || !keyData.active) {
        return NextResponse.json(
          { error: 'Invalid or inactive API key' },
          { status: 401, headers: corsHeaders }
        );
      }

      // Check if daily counter needs reset
      const now = new Date();
      const resetAt = keyData.reset_at ? new Date(keyData.reset_at) : now;
      const needsReset = now > resetAt;

      const currentCount = needsReset ? 0 : (keyData.requests_today || 0);
      const limit = keyData.rate_limit || TIER_LIMITS[keyData.tier] || 1000;

      if (currentCount >= limit) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            tier: keyData.tier,
            limit,
            message: `Your ${keyData.tier} plan allows ${limit.toLocaleString()} requests/day. Upgrade at statisticsoftheworld.com/pricing`,
            resetAt: resetAt.toISOString(),
          },
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetAt.toISOString(),
              'Retry-After': String(Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
            },
          }
        );
      }

      // Increment counter (fire and forget — don't block the response)
      supabase
        .from('sotw_api_keys')
        .update({
          requests_today: needsReset ? 1 : currentCount + 1,
          requests_total: (keyData as any).requests_total ? (keyData as any).requests_total + 1 : 1,
          reset_at: needsReset ? new Date(now.getTime() + WINDOW_MS).toISOString() : resetAt.toISOString(),
          last_request_at: now.toISOString(),
        })
        .eq('id', keyData.id)
        .then(() => {});

      const response = NextResponse.next();
      const remaining = limit - currentCount - 1;
      response.headers.set('X-RateLimit-Limit', String(limit));
      response.headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining)));
      response.headers.set('X-RateLimit-Reset', resetAt.toISOString());
      response.headers.set('X-RateLimit-Tier', keyData.tier);
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;

    } catch {
      // If DB check fails, allow request but log
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Tier', 'error-fallback');
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }
  }

  // Anonymous (IP-based) rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const { allowed, remaining, resetAt } = getIpRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        tier: 'anonymous',
        limit: TIER_LIMITS.anonymous,
        message: `Free tier: ${TIER_LIMITS.anonymous.toLocaleString()} requests/day. Need more? Upgrade at statisticsoftheworld.com/pricing`,
        resetAt: new Date(resetAt).toISOString(),
      },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'X-RateLimit-Limit': String(TIER_LIMITS.anonymous),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetAt).toISOString(),
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(TIER_LIMITS.anonymous));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());
  response.headers.set('X-RateLimit-Tier', 'anonymous');
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));

  return response;
}

export const config = {
  matcher: '/api/v1/:path*',
};
