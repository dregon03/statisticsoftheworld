import ScatterContent from './ScatterContent';
import { getCountries, getIndicatorForAllCountries } from '@/lib/data';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 3600;

async function getScatterData() {
  try {
    const [countries, xData, yData, popData, corrRes] = await Promise.all([
      getCountries(),
      getIndicatorForAllCountries('IMF.NGDPDPC'),
      getIndicatorForAllCountries('SP.DYN.LE00.IN'),
      getIndicatorForAllCountries('SP.POP.TOTL'),
      fetch(`${INTERNAL_BASE}/api/correlations`, { next: { revalidate: 86400 } })
        .then(r => r.json()).catch(() => ({ correlations: [] })),
    ]);

    return {
      countries: countries.map((c: any) => ({ id: c.id, iso2: c.iso2, name: c.name, region: c.region })),
      xData: xData.map((d: any) => ({ countryId: d.countryId, country: d.country, value: d.value, year: String(d.year) })),
      yData: yData.map((d: any) => ({ countryId: d.countryId, country: d.country, value: d.value, year: String(d.year) })),
      popData: popData.map((d: any) => ({ countryId: d.countryId, country: d.country, value: d.value, year: String(d.year) })),
      correlations: corrRes.correlations || [],
    };
  } catch {
    return null;
  }
}

export default async function ScatterPage() {
  const data = await getScatterData();

  return (
    <ScatterContent
      initialCountries={data?.countries}
      initialXData={data?.xData}
      initialYData={data?.yData}
      initialPopData={data?.popData}
      initialCorrelations={data?.correlations}
    />
  );
}
