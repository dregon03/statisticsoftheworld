import { supabase } from '@/lib/supabase';
import { INDICATORS, formatValue } from '@/lib/data';

interface TrendingInsight {
  title: string;
  description: string;
  countries: { id: string; name: string; iso2: string; value: number; year: string }[];
  indicatorId: string;
  indicatorLabel: string;
  type: 'highest' | 'lowest' | 'fastest' | 'slowest';
}

const QUERIES = [
  { id: 'IMF.NGDP_RPCH', title: 'Fastest Growing Economies', type: 'highest' as const, limit: 10 },
  { id: 'IMF.NGDP_RPCH', title: 'Slowest Growing Economies', type: 'lowest' as const, limit: 10 },
  { id: 'IMF.PCPIPCH', title: 'Highest Inflation', type: 'highest' as const, limit: 10 },
  { id: 'IMF.PCPIPCH', title: 'Lowest Inflation', type: 'lowest' as const, limit: 10 },
  { id: 'IMF.LUR', title: 'Highest Unemployment', type: 'highest' as const, limit: 10 },
  { id: 'IMF.LUR', title: 'Lowest Unemployment', type: 'lowest' as const, limit: 10 },
  { id: 'IMF.NGDPDPC', title: 'Richest Countries (GDP per Capita)', type: 'highest' as const, limit: 10 },
  { id: 'IMF.GGXWDG_NGDP', title: 'Most Indebted (Govt Debt/GDP)', type: 'highest' as const, limit: 10 },
  { id: 'SP.DYN.LE00.IN', title: 'Highest Life Expectancy', type: 'highest' as const, limit: 10 },
  { id: 'SP.DYN.LE00.IN', title: 'Lowest Life Expectancy', type: 'lowest' as const, limit: 10 },
  { id: 'SI.POV.GINI', title: 'Most Unequal (Gini Index)', type: 'highest' as const, limit: 10 },
  { id: 'EN.ATM.CO2E.PC', title: 'Highest CO2 Emissions per Capita', type: 'highest' as const, limit: 10 },
];

export const revalidate = 3600; // 1 hour

export async function GET() {
  const insights: TrendingInsight[] = [];

  for (const q of QUERIES) {
    const ind = INDICATORS.find(i => i.id === q.id);
    if (!ind) continue;

    const ascending = q.type === 'lowest';

    const { data } = await supabase
      .from('sotw_indicators')
      .select('country_id, value, year, sotw_countries(name, iso2)')
      .eq('id', q.id)
      .not('value', 'is', null)
      .order('value', { ascending })
      .limit(q.limit);

    if (!data || data.length === 0) continue;

    insights.push({
      title: q.title,
      description: `${q.title} based on latest available data.`,
      countries: data.map((r: any) => ({
        id: r.country_id,
        name: r.sotw_countries?.name || r.country_id,
        iso2: r.sotw_countries?.iso2 || '',
        value: r.value,
        year: String(r.year),
      })),
      indicatorId: q.id,
      indicatorLabel: ind.label,
      type: q.type,
    });
  }

  return Response.json({ insights });
}
