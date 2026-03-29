import { supabase } from '@/lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export const revalidate = 3600; // Cache 1 hour

export async function GET() {
  // 1. Try DB first
  const profiles: Record<string, { sector: string; industry: string; marketCap: number }> = {};

  const { data } = await supabase
    .from('sotw_stock_profiles')
    .select('ticker, sector, industry, market_cap');

  if (data) {
    for (const row of data) {
      if (row.sector || row.market_cap) {
        profiles[row.ticker] = {
          sector: row.sector || 'Other',
          industry: row.industry || '',
          marketCap: row.market_cap || 0,
        };
      }
    }
  }

  // 2. If DB has fewer than 400 profiles, merge with static fallback
  if (Object.keys(profiles).length < 400) {
    try {
      const staticPath = join(process.cwd(), 'public', 'data', 'stock_profiles.json');
      const staticData = JSON.parse(readFileSync(staticPath, 'utf-8'));
      for (const [ticker, profile] of Object.entries(staticData)) {
        if (!profiles[ticker]) {
          profiles[ticker] = profile as { sector: string; industry: string; marketCap: number };
        }
      }
    } catch {
      // Static file not available — use DB only
    }
  }

  return Response.json(profiles);
}
