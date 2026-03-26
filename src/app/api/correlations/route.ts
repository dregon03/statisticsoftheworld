import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache 1 hour

export async function GET() {
  const { data, error } = await supabase
    .from('sotw_correlations')
    .select('indicator_x, indicator_y, label_x, label_y, r_value, r_squared, n_countries')
    .order('r_squared', { ascending: false });

  if (error || !data) {
    return Response.json({ correlations: [] });
  }

  return Response.json({
    correlations: data.map(row => ({
      x: row.indicator_x,
      y: row.indicator_y,
      labelX: row.label_x,
      labelY: row.label_y,
      r: row.r_value,
      rSquared: row.r_squared,
      n: row.n_countries,
    })),
  });
}
