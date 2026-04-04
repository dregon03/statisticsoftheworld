import PredictionsContent from './PredictionsContent';
import { supabase } from '@/lib/supabase';

export const revalidate = 300;

async function getPredictions() {
  try {
    const { data: dbMarkets } = await supabase
      .from('sotw_predictions')
      .select('*')
      .eq('active', true)
      .gt('probability', 0.03)
      .lt('probability', 0.97)
      .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`)
      .order('volume', { ascending: false })
      .limit(500);

    if (!dbMarkets || dbMarkets.length === 0) return null;

    const markets = dbMarkets.map((m: any) => ({
      id: m.market_id,
      question: m.question,
      slug: m.slug || '',
      probability: m.probability || 0,
      outcomes: typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : (m.outcomes || ['Yes', 'No']),
      outcomePrices: typeof m.outcome_prices === 'string' ? JSON.parse(m.outcome_prices) : (m.outcome_prices || []),
      volume: m.volume || 0,
      volume24hr: m.volume_24h || 0,
      liquidity: m.liquidity || 0,
      endDate: m.end_date || '',
      category: m.category || 'Other',
      url: m.url || `https://polymarket.com/event/${m.slug}`,
    }));

    // Deduplicate by URL
    const byUrl = new Map<string, typeof markets[0]>();
    for (const m of markets) {
      const existing = byUrl.get(m.url);
      if (!existing || m.probability > existing.probability) byUrl.set(m.url, m);
    }
    const deduped = Array.from(byUrl.values()).sort((a, b) => b.volume - a.volume);

    const byCategory: Record<string, typeof markets> = {};
    for (const m of deduped) {
      if (!byCategory[m.category]) byCategory[m.category] = [];
      byCategory[m.category].push(m);
    }

    return { markets: deduped, byCategory, updatedAt: dbMarkets[0]?.updated_at || null };
  } catch {
    return null;
  }
}

export default async function PredictionsPage() {
  const data = await getPredictions();

  return (
    <PredictionsContent
      initialMarkets={data?.markets}
      initialByCategory={data?.byCategory}
      initialUpdatedAt={data?.updatedAt}
    />
  );
}
