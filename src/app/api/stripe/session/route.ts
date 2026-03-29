import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

// GET: Verify a Stripe checkout session and return the associated API key
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return Response.json({ error: 'session_id required' }, { status: 400 });
  }

  try {
    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Session not paid' }, { status: 400 });
    }

    const email = session.metadata?.email || session.customer_email || '';
    const tier = session.metadata?.tier || 'pro';

    if (!email) {
      return Response.json({ error: 'No email associated with session' }, { status: 400 });
    }

    // Look up the API key for this email
    const { data: keyData } = await supabase
      .from('sotw_api_keys')
      .select('api_key, tier, rate_limit')
      .eq('email', email)
      .eq('active', true)
      .single();

    if (!keyData) {
      return Response.json({ error: 'API key not found — it may still be processing. Try refreshing in a few seconds.' }, { status: 404 });
    }

    return Response.json({
      email,
      tier: keyData.tier,
      apiKey: keyData.api_key,
      rateLimit: keyData.rate_limit,
    });
  } catch (error: any) {
    if (error.type === 'StripeInvalidRequestError') {
      return Response.json({ error: 'Invalid session ID' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
