import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@') || email.length < 5) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    // Upsert subscriber
    const { error } = await supabase
      .from('sotw_subscribers')
      .upsert(
        { email: normalized, subscribed_at: new Date().toISOString(), active: true },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Subscribe error:', error);
      return Response.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Subscribed!' });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
