import { supabase } from '@/lib/supabase';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const { data, error } = await supabase
    .from('sotw_live_quotes')
    .select('id, label, price, previous_close, change, change_pct, updated_at')
    .order('id');

  if (error || !data) {
    return Response.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }

  return Response.json({
    count: data.length,
    updatedAt: data[0]?.updated_at || null,
    quotes: data.map(q => ({
      id: q.id,
      label: q.label,
      price: q.price,
      previousClose: q.previous_close,
      change: q.change,
      changePct: q.change_pct,
    })),
  });
}
