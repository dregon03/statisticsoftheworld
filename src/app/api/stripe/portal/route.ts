import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    // Look up Stripe customer ID from our database
    const { data: keyData } = await supabase
      .from('sotw_api_keys')
      .select('stripe_customer_id')
      .eq('email', email)
      .eq('active', true)
      .not('stripe_customer_id', 'is', null)
      .single();

    if (!keyData?.stripe_customer_id) {
      return Response.json({ error: 'No active subscription found for this email' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: keyData.stripe_customer_id,
      return_url: `${request.headers.get('origin') || 'https://statisticsoftheworld.com'}/pricing`,
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Portal session failed' }, { status: 500 });
  }
}
