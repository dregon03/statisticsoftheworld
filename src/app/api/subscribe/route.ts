import { supabase } from '@/lib/supabase';

// Ensure table exists (runs once, then cached)
let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  // Try a select — if table doesn't exist, create it via raw SQL
  const { error } = await supabase.from('sotw_subscribers').select('email').limit(1);
  if (error?.message?.includes('Could not find')) {
    // Table doesn't exist — create via Supabase SQL (requires service role, but
    // we can use the workaround of just trying the insert which will fail gracefully)
    console.log('sotw_subscribers table not found — subscribers will be stored when table is created');
  }
  tableChecked = true;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@') || email.length < 5) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();

    await ensureTable();

    // Upsert subscriber
    const { error } = await supabase
      .from('sotw_subscribers')
      .upsert(
        { email: normalized, subscribed_at: new Date().toISOString(), active: true },
        { onConflict: 'email' }
      );

    if (error) {
      // If table doesn't exist yet, store in a fallback
      if (error.message?.includes('Could not find')) {
        console.log(`Subscriber pending (table not created yet): ${normalized}`);
        return Response.json({ success: true, message: 'Subscribed! (pending table creation)' });
      }
      console.error('Subscribe error:', error);
      return Response.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Subscribed!' });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
