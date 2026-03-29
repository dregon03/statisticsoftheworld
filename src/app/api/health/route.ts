import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {};
  const errors: string[] = [];

  // Check Supabase connection
  try {
    const { error } = await supabase.from('sotw_api_keys').select('id').limit(1);
    checks.supabase = error ? 'error' : 'ok';
    if (error) errors.push(`Supabase: ${error.message}`);
  } catch (e: any) {
    checks.supabase = 'error';
    errors.push(`Supabase: ${e.message}`);
  }

  // Check Stripe key is configured
  checks.stripe = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'ok' : 'error';
  if (checks.stripe === 'error') errors.push('Stripe: live key not configured');

  // Check webhook secret
  checks.webhook = process.env.STRIPE_WEBHOOK_SECRET ? 'ok' : 'error';
  if (checks.webhook === 'error') errors.push('Webhook: secret not configured');

  const healthy = errors.length === 0;

  return Response.json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    ...(errors.length > 0 && { errors }),
  }, { status: healthy ? 200 : 503 });
}
