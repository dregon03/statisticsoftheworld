import { supabase } from '@/lib/supabase';

const GAMMA_API = 'https://gamma-api.polymarket.com';

interface PredictionMarket {
  id: string;
  question: string;
  slug: string;
  probability: number;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string;
  category: string;
  url: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const q = searchParams.get('q')?.toLowerCase();

  try {
    // Try Supabase first (populated by ETL)
    let query = supabase
      .from('sotw_predictions')
      .select('*')
      .eq('active', true)
      .order('volume', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (q) {
      query = query.ilike('question', `%${q}%`);
    }

    query = query.limit(limit);

    const { data: dbMarkets, error } = await query;

    if (!error && dbMarkets && dbMarkets.length > 0) {
      // Serve from Supabase
      const markets: PredictionMarket[] = dbMarkets.map(m => ({
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

      const byCategory: Record<string, PredictionMarket[]> = {};
      for (const m of markets) {
        if (!byCategory[m.category]) byCategory[m.category] = [];
        byCategory[m.category].push(m);
      }

      // Get total count
      const { count: totalCount } = await supabase
        .from('sotw_predictions')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      return Response.json({
        count: markets.length,
        total: totalCount || markets.length,
        updatedAt: dbMarkets[0]?.updated_at || null,
        source: 'Polymarket (polymarket.com)',
        dataSource: 'supabase',
        categories: Object.keys(byCategory),
        markets,
        byCategory,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Fallback: fetch live from Polymarket if DB is empty
    return await fetchLiveFallback(category, q, limit);
  } catch (error) {
    console.error('Predictions API error:', error);
    // Fallback to live
    return await fetchLiveFallback(category, q, limit);
  }
}

// ── Live fallback (used when DB is empty or errors) ─────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Central Banks & Rates': ['fed ', 'federal reserve', 'interest rate', 'rate cut', 'rate hike', 'fomc'],
  'Recession & Growth': ['recession', 'gdp', 'economic growth'],
  'Inflation & Prices': ['inflation', 'cpi', 'consumer price', 'gas price'],
  'Elections & Politics': ['election', 'president', 'prime minister', 'parliament', 'governor', 'senate', 'nominee', 'democratic', 'republican'],
  'Geopolitics & Conflict': ['russia', 'ukraine', 'china', 'taiwan', 'ceasefire', 'nato', 'sanctions', 'israel', 'iran', 'gaza'],
  'Trade & Tariffs': ['tariff', 'trade war', 'sanctions'],
  'Crypto & Markets': ['bitcoin', 'btc', 'ethereum', 'crypto', 's&p', 'stock market', 'nasdaq', 'tesla', 'nvidia', 'google dip'],
  'Global Events': ['who ', 'g7', 'g20', 'brics', 'imf ', 'climate', 'pope'],
  'Currency & FX': ['usd', 'exchange rate', 'dollar', 'peso'],
  'Oil & Energy': ['oil', 'crude', 'opec', 'natural gas', 'energy'],
};

const EXCLUDE = ['nba', 'nfl', 'mlb', 'nhl', 'mls', 'ufc', 'pga', 'atp', 'wta', 'epl', 'serie a', 'bundesliga', 'goalscorer', 'rebounds', 'temperature', 'weather', 'eurovision', 'top 10 at', 'top 20 at', 'o/u ', 'match winner', 'set 1 winner'];

function categorizeLive(question: string): string | null {
  const q = question.toLowerCase();
  if (EXCLUDE.some(kw => q.includes(kw))) return null;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) return cat;
  }
  return null;
}

async function fetchLiveFallback(category: string | null, q: string | null | undefined, limit: number) {
  const allMarkets = new Map<string, PredictionMarket>();

  // Fetch 500 markets by volume
  const promises = [];
  for (let offset = 0; offset < 500; offset += 100) {
    promises.push(
      fetch(`${GAMMA_API}/markets?active=true&closed=false&limit=100&offset=${offset}&order=volume&ascending=false`)
        .then(r => r.json()).catch(() => [])
    );
  }
  // 300 by liquidity
  for (let offset = 0; offset < 300; offset += 100) {
    promises.push(
      fetch(`${GAMMA_API}/markets?active=true&closed=false&limit=100&offset=${offset}&order=liquidity&ascending=false`)
        .then(r => r.json()).catch(() => [])
    );
  }

  const pages = await Promise.all(promises);
  for (const page of pages) {
    if (!Array.isArray(page)) continue;
    for (const m of page) {
      if (!m?.question || m.closed) continue;
      const cat = categorizeLive(m.question);
      if (!cat) continue;

      let outcomePrices: number[] = [];
      let outcomes: string[] = ['Yes', 'No'];
      try {
        outcomePrices = JSON.parse(typeof m.outcomePrices === 'string' ? m.outcomePrices : JSON.stringify(m.outcomePrices || [])).map(Number);
        outcomes = JSON.parse(typeof m.outcomes === 'string' ? m.outcomes : JSON.stringify(m.outcomes || ['Yes', 'No']));
      } catch {}

      const liquidity = parseFloat(m.liquidity) || 0;
      if (liquidity < 100) continue;

      const parsed: PredictionMarket = {
        id: String(m.id || m.slug),
        question: m.question,
        slug: m.slug || '',
        probability: outcomePrices[0] || 0,
        outcomes,
        outcomePrices,
        volume: parseFloat(m.volume) || 0,
        volume24hr: parseFloat(m.volume24hr) || 0,
        liquidity,
        endDate: m.endDate || '',
        category: cat,
        url: `https://polymarket.com/event/${m.slug}`,
      };
      allMarkets.set(parsed.id, parsed);
    }
  }

  let markets = Array.from(allMarkets.values()).sort((a, b) => b.volume - a.volume);
  if (category) markets = markets.filter(m => m.category === category);
  if (q) markets = markets.filter(m => m.question.toLowerCase().includes(q));
  const limited = markets.slice(0, limit);

  const byCategory: Record<string, PredictionMarket[]> = {};
  for (const m of limited) {
    if (!byCategory[m.category]) byCategory[m.category] = [];
    byCategory[m.category].push(m);
  }

  return Response.json({
    count: limited.length,
    total: markets.length,
    updatedAt: new Date().toISOString(),
    source: 'Polymarket (polymarket.com)',
    dataSource: 'live',
    categories: Object.keys(byCategory),
    markets: limited,
    byCategory,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
  });
}
