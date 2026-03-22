import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indicatorId = searchParams.get('indicator');

  if (!indicatorId) {
    return Response.json({ error: 'Missing indicator param' }, { status: 400 });
  }

  // Fetch indicator data joined with country region
  const { data, error } = await supabase
    .from('sotw_indicators')
    .select('country_id, value, year, sotw_countries(region, income_level)')
    .eq('id', indicatorId)
    .not('value', 'is', null);

  if (error || !data) {
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  // IMF billions adjustment
  const imfBillions = new Set(['IMF.NGDPD', 'IMF.PPPGDP']);
  const adjust = (v: number) => imfBillions.has(indicatorId) ? v * 1e9 : v;

  // Aggregate by region
  const regionAgg: Record<string, { values: number[]; countries: number }> = {};
  const incomeAgg: Record<string, { values: number[]; countries: number }> = {};

  for (const row of data as any[]) {
    const region = row.sotw_countries?.region;
    const income = row.sotw_countries?.income_level;
    const value = adjust(row.value);

    if (region) {
      if (!regionAgg[region]) regionAgg[region] = { values: [], countries: 0 };
      regionAgg[region].values.push(value);
      regionAgg[region].countries++;
    }
    if (income) {
      if (!incomeAgg[income]) incomeAgg[income] = { values: [], countries: 0 };
      incomeAgg[income].values.push(value);
      incomeAgg[income].countries++;
    }
  }

  const aggregate = (agg: typeof regionAgg) =>
    Object.entries(agg).map(([name, { values, countries }]) => ({
      name,
      countries,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: median(values),
      sum: values.reduce((a, b) => a + b, 0),
      min: Math.min(...values),
      max: Math.max(...values),
    })).sort((a, b) => b.avg - a.avg);

  return Response.json({
    indicator: indicatorId,
    byRegion: aggregate(regionAgg),
    byIncome: aggregate(incomeAgg),
    totalCountries: data.length,
  });
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
