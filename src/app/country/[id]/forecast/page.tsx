import ForecastContent from './ForecastContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

async function getForecastData(countryId: string) {
  try {
    const res = await fetch(`${INTERNAL_BASE}/api/forecasts?indicator=IMF.NGDP_RPCH`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const row = (data.countries || []).find((c: any) => c.countryId === countryId);
    return {
      indicators: data.indicators,
      years: data.years,
      countryData: row || null,
      countryName: row?.country || '',
      iso2: row?.iso2 || '',
    };
  } catch {
    return null;
  }
}

export default async function CountryForecastPage({ params }: Props) {
  const { id } = await params;
  const data = await getForecastData(id);

  return (
    <ForecastContent
      initialIndicators={data?.indicators}
      initialYears={data?.years}
      initialCountryData={data?.countryData}
      initialCountryName={data?.countryName}
      initialIso2={data?.iso2}
    />
  );
}
