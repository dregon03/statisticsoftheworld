import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import TradeContent from './TradeContent';
import { BASE_URL } from '@/lib/sitemap';

export const revalidate = 86400; // 1 day

async function getTradeData() {
  try {
    const res = await fetch(`${BASE_URL}/api/trade?country=USA`, { next: { revalidate: 86400 } });
    if (!res.ok) return { data: null, countries: ['USA'] };
    const data = await res.json();
    return { data, countries: data.availableCountries || ['USA'] };
  } catch {
    return { data: null, countries: ['USA'] };
  }
}

export default async function TradePage() {
  const { data, countries } = await getTradeData();

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <TradeContent initialData={data} initialCountries={countries} />
      <Footer />
    </main>
  );
}
