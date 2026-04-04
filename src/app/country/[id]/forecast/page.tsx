import type { Metadata } from 'next';
import ForecastContent from './ForecastContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';
import { getCountry } from '@/lib/data';
import { getCountryFromSlug, getCleanCountryUrl, isIso3 } from '@/lib/country-slugs';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

function resolveId(rawId: string): string {
  const fromSlug = getCountryFromSlug(rawId);
  return fromSlug || rawId;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = resolveId(rawId);
  const country = await getCountry(id);
  if (!country) return { title: 'Not Found' };

  const year = new Date().getFullYear();
  return {
    title: `${country.name} Economic Forecast ${year}–${year + 4} — GDP Growth, Inflation & More`,
    description: `${country.name} economic forecast: GDP growth, inflation, unemployment, and government debt projections for ${year}–${year + 4}. IMF World Economic Outlook data with interactive charts.`,
    alternates: { canonical: `https://statisticsoftheworld.com${getCleanCountryUrl(id)}/forecast` },
    openGraph: {
      title: `${country.name} Economic Forecast ${year}–${year + 4}`,
      description: `IMF projections for ${country.name}: GDP growth, inflation, unemployment. Interactive charts.`,
      siteName: 'Statistics of the World',
    },
  };
}

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
