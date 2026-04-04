import TradeDataContent from './TradeDataContent';
import { INTERNAL_BASE } from '@/lib/internal-fetch';

export const revalidate = 86400;

type Props = { params: Promise<{ id: string }> };

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
