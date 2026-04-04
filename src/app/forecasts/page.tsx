import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';
import ForecastsContent from './ForecastsContent';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

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

const DEFAULT_INDICATOR = 'IMF.NGDP_RPCH';

async function getForecastData(indicatorId: string) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  const { data } = await supabase
    .from('sotw_indicators_history')
    .select('country_id, year, value')
    .eq('id', indicatorId)
    .in('year', years)
    .not('value', 'is', null);

  const { data: countries } = await supabase
    .from('sotw_countries')
    .select('id, name, iso2, region');

  const countryMap = new Map((countries || []).map(c => [c.id, c]));

  const byCountry: Record<string, Record<number, number>> = {};
  for (const row of data || []) {
    if (!byCountry[row.country_id]) byCountry[row.country_id] = {};
    byCountry[row.country_id][row.year] = row.value;
  }

  const rows = Object.entries(byCountry)
    .filter(([cid]) => countryMap.has(cid))
    .map(([cid, values]) => {
      const c = countryMap.get(cid)!;
      return { countryId: cid, country: c.name, iso2: c.iso2, region: c.region, values };
    })
    .sort((a, b) => {
      const aVal = a.values[currentYear] ?? -Infinity;
      const bVal = b.values[currentYear] ?? -Infinity;
      return bVal - aVal;
    });

  return {
    indicator: IMF_INDICATORS.find(i => i.id === indicatorId) || { id: indicatorId, label: indicatorId, format: 'number' },
    indicators: IMF_INDICATORS,
    years,
    countries: rows,
  };
}

export default async function ForecastsPage() {
  const data = await getForecastData(DEFAULT_INDICATOR);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/forecasts" />
      <ForecastsContent
        initialIndicators={data.indicators}
        initialIndicator={data.indicator}
        initialYears={data.years}
        initialRows={data.countries}
        initialSelectedId={DEFAULT_INDICATOR}
      />
      <Footer />
    </main>
  );
}
