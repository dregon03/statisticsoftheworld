import { supabase } from '@/lib/supabase';

const IMF_INDICATORS = [
  { id: 'IMF.NGDP_RPCH', label: 'Real GDP Growth (%)', format: 'percent' },
  { id: 'IMF.PCPIPCH', label: 'Inflation, CPI (%)', format: 'percent' },
  { id: 'IMF.LUR', label: 'Unemployment Rate (%)', format: 'percent' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita (USD)', format: 'currency' },
  { id: 'IMF.NGDPD', label: 'GDP (Billions USD)', format: 'currency' },
  { id: 'IMF.GGXWDG_NGDP', label: 'Govt Debt (% of GDP)', format: 'percent' },
  { id: 'IMF.BCA_NGDPD', label: 'Current Account (% of GDP)', format: 'percent' },
  { id: 'IMF.GGXCNL_NGDP', label: 'Fiscal Balance (% of GDP)', format: 'percent' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indicatorId = searchParams.get('indicator') || 'IMF.NGDP_RPCH';
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  // Fetch forecast data for all countries for the selected indicator
  const { data, error } = await supabase
    .from('sotw_indicators_history')
    .select('country_id, year, value')
    .eq('id', indicatorId)
    .in('year', years)
    .not('value', 'is', null);

  if (error || !data) {
    return Response.json({ error: 'Failed to fetch forecasts' }, { status: 500 });
  }

  // Fetch country names
  const { data: countries } = await supabase
    .from('sotw_countries')
    .select('id, name, iso2, region');

  const countryMap = new Map((countries || []).map(c => [c.id, c]));

  // Group by country
  const byCountry: Record<string, Record<number, number>> = {};
  for (const row of data) {
    if (!byCountry[row.country_id]) byCountry[row.country_id] = {};
    byCountry[row.country_id][row.year] = row.value;
  }

  // Build response
  const rows = Object.entries(byCountry)
    .filter(([cid]) => countryMap.has(cid))
    .map(([cid, values]) => {
      const c = countryMap.get(cid)!;
      return {
        countryId: cid,
        country: c.name,
        iso2: c.iso2,
        region: c.region,
        values,
      };
    })
    .sort((a, b) => {
      const aVal = a.values[currentYear] ?? -Infinity;
      const bVal = b.values[currentYear] ?? -Infinity;
      return bVal - aVal;
    });

  return Response.json({
    indicator: IMF_INDICATORS.find(i => i.id === indicatorId) || { id: indicatorId, label: indicatorId },
    indicators: IMF_INDICATORS,
    years,
    countries: rows,
  });
}
