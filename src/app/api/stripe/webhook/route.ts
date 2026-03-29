import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/mailer';

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      return Response.json({ error: 'Missing stripe-signature header or webhook secret' }, { status: 400 });
    }
  } catch (err: any) {
    return Response.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
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

        const limit = TIER_LIMITS[tier] || 50000;
        const tierName = tier === 'business' ? 'Business' : 'Pro';
        let apiKeyForEmail = '';

        if (existing) {
          await supabase
            .from('sotw_api_keys')
            .update({
              tier,
              rate_limit: limit,
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
            })
            .eq('id', existing.id);

          // Get the existing key for the email
          const { data: keyRow } = await supabase
            .from('sotw_api_keys')
            .select('api_key')
            .eq('id', existing.id)
            .single();
          apiKeyForEmail = keyRow?.api_key || '';
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
              rate_limit: limit,
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
            });
          apiKeyForEmail = newKey;
        }

        // Send subscription confirmation email
        sendEmail(email, `Welcome to SOTW ${tierName}`, `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#0d1b2a;margin-bottom:4px">You're now on SOTW ${tierName}</h2>
            <p style="color:#64748b;font-size:15px">Your subscription is active. You now have <strong>${limit.toLocaleString()}</strong> API requests per day.</p>
            <div style="background:#f4f6f9;border:1px solid #d5dce6;border-radius:8px;padding:16px;margin:20px 0">
              <div style="color:#64748b;font-size:13px;margin-bottom:4px">Your API Key</div>
              <div style="font-family:monospace;font-size:14px;color:#0d1b2a;word-break:break-all">${apiKeyForEmail}</div>
            </div>
            <p style="color:#64748b;font-size:14px"><strong>What's included:</strong></p>
            <ul style="color:#64748b;font-size:14px;padding-left:20px">
              <li>${limit.toLocaleString()} requests per day</li>
              <li>Commercial use license</li>
              ${tier === 'business' ? '<li>Webhook notifications</li><li>Priority support (4hr response)</li><li>99.9% SLA</li>' : '<li>All endpoints + historical data</li><li>Email support (24hr response)</li>'}
            </ul>
            <div style="margin:24px 0">
              <a href="https://statisticsoftheworld.com/api-docs" style="display:inline-block;background:#0d1b2a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">View API Docs</a>
              <a href="https://statisticsoftheworld.com/pricing" style="display:inline-block;color:#0066cc;padding:10px 20px;text-decoration:none;font-size:14px">Manage Subscription</a>
            </div>
            <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0">
            <p style="color:#94a3b8;font-size:12px">Questions? Reply to this email or contact api@statisticsoftheworld.com</p>
          </div>
        `).catch(() => {});
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const subId = subscription.id;

      // Get email before downgrading
      const { data: cancelledKey } = await supabase
        .from('sotw_api_keys')
        .select('email')
        .eq('stripe_subscription_id', subId)
        .single();

      // Downgrade to free tier
      await supabase
        .from('sotw_api_keys')
        .update({ tier: 'free', rate_limit: 1000, stripe_subscription_id: null })
        .eq('stripe_subscription_id', subId);

      // Send cancellation email
      if (cancelledKey?.email) {
        sendEmail(cancelledKey.email, 'SOTW Subscription Cancelled', `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#0d1b2a;margin-bottom:4px">Subscription Cancelled</h2>
            <p style="color:#64748b;font-size:15px">Your SOTW subscription has been cancelled. Your API key has been downgraded to the free tier (1,000 requests/day).</p>
            <p style="color:#64748b;font-size:14px">Your API key still works — just with free-tier limits. You can resubscribe anytime at <a href="https://statisticsoftheworld.com/pricing" style="color:#0066cc">statisticsoftheworld.com/pricing</a>.</p>
            <hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0">
            <p style="color:#94a3b8;font-size:12px">We'd love to know why you cancelled. Reply to this email with any feedback.</p>
          </div>
        `).catch(() => {});
      }
      break;
    }
  }

  return Response.json({ received: true });
}
