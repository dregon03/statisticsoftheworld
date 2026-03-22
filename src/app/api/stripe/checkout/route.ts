import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  business: process.env.STRIPE_BUSINESS_PRICE_ID,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, email, apiKey } = body;

    const priceId = PRICE_MAP[tier];
    if (!priceId) {
      return Response.json({ error: 'Invalid tier. Use "pro" or "business".' }, { status: 400 });
    }

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get('origin') || 'https://statisticsoftheworld.com'}/pricing?success=true&tier=${tier}`,
      cancel_url: `${request.headers.get('origin') || 'https://statisticsoftheworld.com'}/pricing?canceled=true`,
      metadata: {
        tier,
        api_key: apiKey || '',
        email,
      },
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
