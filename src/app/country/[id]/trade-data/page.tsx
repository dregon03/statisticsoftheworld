import type { Metadata } from 'next';
import TradeDataContent from './TradeDataContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';
import { getCountry } from '@/lib/data';
import { getCountryFromSlug, getCleanCountryUrl } from '@/lib/country-slugs';

export const revalidate = 86400;

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

  return {
    title: `${country.name} Trade Data — Exports, Imports & Trade Partners`,
    description: `${country.name} international trade: top export and import products, major trading partners, trade balance, and trade flows. Data from UN COMTRADE.`,
    alternates: { canonical: `https://statisticsoftheworld.com${getCleanCountryUrl(id)}/trade-data` },
    openGraph: {
      title: `${country.name} Trade Data — Exports, Imports & Partners`,
      description: `${country.name} international trade flows, partners, and product breakdown.`,
      siteName: 'Statistics of the World',
    },
  };
}

async function getTradeData(countryId: string) {
  try {
    const res = await fetch(`${INTERNAL_BASE}/api/trade?country=${countryId}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function CountryTradePage({ params }: Props) {
  const { id } = await params;
  const data = await getTradeData(id);

  return <TradeDataContent initialData={data} />;
}
