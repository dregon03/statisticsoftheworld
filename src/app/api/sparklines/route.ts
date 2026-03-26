import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indicator = searchParams.get('indicator');
  if (!indicator) {
    return Response.json({ error: 'Missing indicator param' }, { status: 400 });
  }

  // Get last 10 years of data for all countries
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;

  const { data, error } = await supabase
    .from('sotw_indicators_history')
    .select('country_id, year, value')
    .eq('id', indicator)
    .gte('year', startYear)
    .order('year', { ascending: true });

  if (error || !data) {
    return Response.json({ error: 'Failed to fetch sparkline data' }, { status: 500 });
  }

  // Group by country, return just the values array
  const result: Record<string, number[]> = {};
  for (const row of data) {
    if (row.value == null) continue;
    if (!result[row.country_id]) result[row.country_id] = [];
    result[row.country_id].push(row.value);
  }

  return Response.json(result);
}
