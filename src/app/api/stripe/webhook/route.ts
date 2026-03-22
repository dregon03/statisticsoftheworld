import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const TIER_LIMITS: Record<string, number> = {
  pro: 50000,
  business: 500000,
};

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  // In production, verify webhook signature with STRIPE_WEBHOOK_SECRET
  // For now, parse the event directly (test mode)
  let event: Stripe.Event;
  try {
    event = JSON.parse(body) as Stripe.Event;
  } catch {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tier = session.metadata?.tier || 'pro';
      const email = session.metadata?.email || session.customer_email || '';
      const apiKeyFromMeta = session.metadata?.api_key;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

      if (email) {
        // Upgrade existing API key or create new one
        const { data: existing } = await supabase
          .from('sotw_api_keys')
          .select('id')
          .eq('email', email)
          .eq('active', true)
          .single();

        if (existing) {
          await supabase
            .from('sotw_api_keys')
            .update({
              tier,
              rate_limit: TIER_LIMITS[tier] || 50000,
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
            })
            .eq('id', existing.id);
        } else {
          // Create new key with paid tier
          const crypto = await import('crypto');
          const newKey = 'sotw_' + crypto.randomBytes(24).toString('hex');
          await supabase
            .from('sotw_api_keys')
            .insert({
              api_key: newKey,
              email,
              tier,
              rate_limit: TIER_LIMITS[tier] || 50000,
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
            });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const subId = subscription.id;

      // Downgrade to free tier
      await supabase
        .from('sotw_api_keys')
        .update({ tier: 'free', rate_limit: 1000, stripe_subscription_id: null })
        .eq('stripe_subscription_id', subId);
      break;
    }
  }

  return Response.json({ received: true });
}
