import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const country = searchParams.get('country') || 'USA';

  if (!id) {
    // Return list of available monthly indicators
    const { data } = await supabase
      .from('sotw_monthly_data')
      .select('id, frequency')
      .limit(1000);

    if (!data) return Response.json({ indicators: [] });

    const unique = new Map<string, string>();
    for (const row of data) {
      if (!unique.has(row.id)) unique.set(row.id, row.frequency);
    }

    return Response.json({
      indicators: Array.from(unique.entries()).map(([id, freq]) => ({ id, frequency: freq })),
    });
  }

  // Fetch monthly/quarterly data for specific indicator + country
  const { data, error } = await supabase
    .from('sotw_monthly_data')
    .select('period, value, frequency')
    .eq('id', id)
    .eq('country_id', country)
    .order('period', { ascending: true });

  if (error || !data) {
    return Response.json({ points: [] });
  }

  return Response.json({
    id,
    country,
    frequency: data[0]?.frequency || 'M',
    points: data.map(d => ({ period: d.period, value: d.value })),
  });
}
