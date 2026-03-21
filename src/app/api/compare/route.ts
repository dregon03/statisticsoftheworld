import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('countries')?.split(',') || [];
  if (ids.length < 2) {
    return Response.json({ error: 'Need at least 2 countries' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sotw_indicators')
    .select('id, country_id, value, year')
    .in('country_id', ids);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Group by indicator → country
  const result: Record<string, Record<string, { value: number | null; year: string }>> = {};
  for (const row of data || []) {
    if (!result[row.id]) result[row.id] = {};
    result[row.id][row.country_id] = { value: row.value, year: String(row.year) };
  }

  return Response.json(result);
}
