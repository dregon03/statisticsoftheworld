import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache 1 hour

export async function GET() {
  const { data, error } = await supabase
    .from('sotw_stock_profiles')
    .select('ticker, sector, industry, market_cap');

  if (error || !data) {
    return Response.json({ error: 'Failed to fetch stock profiles' }, { status: 500 });
  }

  // Return as a map for easy lookup
  const profiles: Record<string, { sector: string; industry: string; marketCap: number }> = {};
  for (const row of data) {
    profiles[row.ticker] = {
      sector: row.sector || 'Other',
      industry: row.industry || '',
      marketCap: row.market_cap || 0,
    };
  }

  return Response.json(profiles);
}
