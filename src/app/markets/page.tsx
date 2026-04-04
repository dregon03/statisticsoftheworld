import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsContent from './MarketsContent';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

async function getQuotes() {
  try {
    const { data } = await supabase
      .from('sotw_quotes')
      .select('id, label, price, previous_close, change, change_pct, updated_at')
      .like('id', 'YF.IDX.%')
      .order('id');

    const { data: futures } = await supabase
      .from('sotw_quotes')
      .select('id, label, price, previous_close, change, change_pct, updated_at')
      .like('id', 'YF.FUT.%')
      .order('id');

    const all = [...(futures || []), ...(data || [])];
    const quotes = all.map((q: any) => ({
      id: q.id,
      label: q.label,
      price: q.price,
      previousClose: q.previous_close,
      change: q.change,
      changePct: q.change_pct,
    }));

    const updatedAt = all[0]?.updated_at || null;
    return { quotes, updatedAt };
  } catch {
    return { quotes: [], updatedAt: null };
  }
}

export default async function MarketsPage() {
  const { quotes, updatedAt } = await getQuotes();

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <MarketsContent initialQuotes={quotes} initialUpdatedAt={updatedAt} />
      <Footer />
    </main>
  );
}
