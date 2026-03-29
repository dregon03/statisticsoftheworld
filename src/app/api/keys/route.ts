import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mailer';
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

    // Send welcome email (fire and forget)
    sendEmail(email, 'Your SOTW API Key', `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0d1b2a;margin-bottom:4px">Welcome to Statistics of the World</h2>
        <p style="color:#64748b;font-size:15px">Your free API key is ready. 1,000 requests per day.</p>
        <div style="background:#f4f6f9;border:1px solid #d5dce6;border-radius:8px;padding:16px;margin:20px 0">
          <div style="color:#64748b;font-size:13px;margin-bottom:4px">Your API Key</div>
          <div style="font-family:monospace;font-size:14px;color:#0d1b2a;word-break:break-all">${apiKey}</div>
        </div>
        <p style="color:#64748b;font-size:14px"><strong>Quick start:</strong></p>
        <pre style="background:#0d1b2a;color:#e2e8f0;padding:12px;border-radius:8px;font-size:13px;overflow-x:auto">curl -H "X-API-Key: ${apiKey}" \\
  https://statisticsoftheworld.com/api/v1/countries</pre>
        <p style="color:#64748b;font-size:14px;margin-top:20px">
          <a href="https://statisticsoftheworld.com/api-docs" style="color:#0066cc">API Documentation</a> &middot;
          <a href="https://statisticsoftheworld.com/pricing" style="color:#0066cc">Upgrade for higher limits</a>
        </p>
        <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px">Keep this key confidential. If compromised, generate a new one at statisticsoftheworld.com/pricing</p>
      </div>
    `).catch(() => {}); // Don't fail the response if email fails

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

    // Mask API keys — only show prefix + last 4 chars
    const maskedKeys = (data || []).map(k => ({
      ...k,
      api_key: k.api_key ? `${k.api_key.slice(0, 5)}...${k.api_key.slice(-4)}` : '',
    }));

    return Response.json({ keys: maskedKeys });
  }

  return Response.json({ error: 'Provide email or key parameter' }, { status: 400 });
}
