import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Generate a new API key
function generateApiKey(): string {
  return 'sotw_' + crypto.randomBytes(24).toString('hex');
}

// POST: Create a new API key (free tier)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Check if email already has a key
    const { data: existing } = await supabase
      .from('sotw_api_keys')
      .select('api_key, tier, rate_limit, created_at')
      .eq('email', email)
      .eq('active', true)
      .single();

    if (existing) {
      return Response.json({
        message: 'API key already exists for this email',
        apiKey: existing.api_key,
        tier: existing.tier,
        rateLimit: existing.rate_limit,
      });
    }

    // Create new key
    const apiKey = generateApiKey();
    const { error } = await supabase
      .from('sotw_api_keys')
      .insert({
        api_key: apiKey,
        email,
        name: name || null,
        tier: 'free',
        rate_limit: 1000,
      });

    if (error) {
      return Response.json({ error: 'Failed to create API key' }, { status: 500 });
    }

    return Response.json({
      message: 'API key created',
      apiKey,
      tier: 'free',
      rateLimit: 1000,
    });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// GET: Look up API key by email
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const apiKey = searchParams.get('key');

  if (apiKey) {
    // Look up by key
    const { data } = await supabase
      .from('sotw_api_keys')
      .select('email, tier, rate_limit, requests_today, requests_total, created_at, active')
      .eq('api_key', apiKey)
      .single();

    if (!data) {
      return Response.json({ error: 'API key not found' }, { status: 404 });
    }

    return Response.json({
      email: data.email,
      tier: data.tier,
      rateLimit: data.rate_limit,
      requestsToday: data.requests_today,
      requestsTotal: data.requests_total,
      active: data.active,
      createdAt: data.created_at,
    });
  }

  if (email) {
    const { data } = await supabase
      .from('sotw_api_keys')
      .select('api_key, tier, rate_limit, requests_today, requests_total, created_at')
      .eq('email', email)
      .eq('active', true);

    return Response.json({ keys: data || [] });
  }

  return Response.json({ error: 'Provide email or key parameter' }, { status: 400 });
}
