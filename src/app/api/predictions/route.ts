const GAMMA_API = 'https://gamma-api.polymarket.com';

// Curated search queries for markets relevant to global economics/geopolitics
const SEARCH_QUERIES = [
  // Central banks & monetary policy
  'Fed rate', 'Federal Reserve', 'interest rate',
  'Bank of Canada', 'ECB rate', 'Bank of Japan',
  // Recession & GDP
  'recession', 'GDP',
  // Inflation
  'inflation', 'CPI',
  // Elections & politics (global)
  'presidential election', 'prime minister', 'parliament',
  // Geopolitics
  'Russia Ukraine', 'ceasefire', 'China Taiwan',
  'NATO', 'sanctions', 'tariff',
  // Trade & markets
  'oil price', 'Bitcoin', 'S&P 500', 'stock market',
  // Global events
  'WHO', 'UN', 'G7', 'BRICS',
];

// Categories for grouping markets
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Central Banks & Rates': ['fed', 'federal reserve', 'interest rate', 'rate cut', 'rate hike', 'bank of canada', 'ecb', 'bank of japan', 'bank of england', 'central bank', 'monetary policy'],
  'Recession & Growth': ['recession', 'gdp', 'economic growth', 'economy', 'depression'],
  'Inflation & Prices': ['inflation', 'cpi', 'consumer price', 'deflation', 'oil price', 'gas price'],
  'Elections & Politics': ['election', 'president', 'prime minister', 'parliament', 'governor', 'senate', 'congress', 'vote', 'nominee', 'inauguration'],
  'Geopolitics & Conflict': ['russia', 'ukraine', 'china', 'taiwan', 'ceasefire', 'nato', 'war', 'invasion', 'military', 'sanctions', 'troops', 'missile'],
  'Trade & Tariffs': ['tariff', 'trade', 'export', 'import', 'customs', 'wto', 'nafta', 'usmca'],
  'Crypto & Markets': ['bitcoin', 'ethereum', 'crypto', 's&p', 'stock market', 'dow', 'nasdaq', 'treasury'],
  'Global Events': ['who', 'united nations', 'g7', 'g20', 'brics', 'imf', 'world bank', 'climate', 'pandemic'],
};

function categorize(question: string): string {
  const q = question.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) return category;
  }
  return 'Other';
}

interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string;
  outcomes: string;
  volume: string;
  volume24hr: string;
  liquidity: string;
  endDate: string;
  image: string;
  active: boolean;
  closed: boolean;
  groupItemTitle?: string;
}

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

// Cache: 15 minutes
let cache: { data: PredictionMarket[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000;

async function fetchPolymarketMarkets(): Promise<PredictionMarket[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  const allMarkets = new Map<string, PredictionMarket>();

  // Fetch top active markets by volume (includes many relevant ones)
  const topMarketsPromise = fetch(
    `${GAMMA_API}/markets?active=true&closed=false&limit=100&order=volume&ascending=false`
  ).then(r => r.json()).catch(() => []);

  // Fetch top events by volume
  const topEventsPromise = fetch(
    `${GAMMA_API}/events?active=true&closed=false&limit=50&order=volume&ascending=false`
  ).then(r => r.json()).catch(() => []);

  const [topMarkets, topEvents] = await Promise.all([topMarketsPromise, topEventsPromise]);

  // Process direct markets
  const marketsList: PolymarketMarket[] = Array.isArray(topMarkets) ? topMarkets : [];
  for (const m of marketsList) {
    const parsed = parseMarket(m);
    if (parsed && parsed.liquidity >= 1000) {
      allMarkets.set(parsed.id, parsed);
    }
  }

  // Process events (extract their nested markets)
  const eventsList = Array.isArray(topEvents) ? topEvents : [];
  for (const event of eventsList) {
    if (!event.markets) continue;
    for (const m of event.markets) {
      const parsed = parseMarket(m);
      if (parsed && parsed.liquidity >= 1000) {
        allMarkets.set(parsed.id, parsed);
      }
    }
  }

  // Keyword-based search for economics/geopolitics markets
  const searchPromises = SEARCH_QUERIES.slice(0, 15).map(q =>
    fetch(`${GAMMA_API}/markets?active=true&closed=false&limit=10&order=liquidity&ascending=false&tag_slug=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .catch(() => [])
  );

  const searchResults = await Promise.all(searchPromises);
  for (const markets of searchResults) {
    if (!Array.isArray(markets)) continue;
    for (const m of markets) {
      const parsed = parseMarket(m);
      if (parsed && parsed.liquidity >= 500) {
        allMarkets.set(parsed.id, parsed);
      }
    }
  }

  // Filter to relevant categories only (exclude pure sports, weather, entertainment)
  const relevantCategories = new Set([
    'Central Banks & Rates', 'Recession & Growth', 'Inflation & Prices',
    'Elections & Politics', 'Geopolitics & Conflict', 'Trade & Tariffs',
    'Crypto & Markets', 'Global Events',
  ]);

  const results = Array.from(allMarkets.values())
    .filter(m => relevantCategories.has(m.category))
    .sort((a, b) => b.volume - a.volume);

  cache = { data: results, ts: Date.now() };
  return results;
}

function parseMarket(m: PolymarketMarket): PredictionMarket | null {
  if (!m || !m.question || m.closed) return null;

  let outcomePrices: number[] = [];
  try {
    const raw = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
    outcomePrices = (raw || []).map(Number);
  } catch { return null; }

  let outcomes: string[] = [];
  try {
    outcomes = typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : (m.outcomes || ['Yes', 'No']);
  } catch {
    outcomes = ['Yes', 'No'];
  }

  const volume = parseFloat(m.volume) || 0;
  const liquidity = parseFloat(m.liquidity) || 0;

  // Primary probability (first outcome, usually "Yes")
  const probability = outcomePrices[0] || 0;

  return {
    id: String(m.id || m.slug),
    question: m.question,
    slug: m.slug || '',
    probability,
    outcomes,
    outcomePrices,
    volume,
    volume24hr: parseFloat(m.volume24hr) || 0,
    liquidity,
    endDate: m.endDate || '',
    category: categorize(m.question),
    url: `https://polymarket.com/event/${m.slug}`,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const q = searchParams.get('q')?.toLowerCase();

  try {
    let markets = await fetchPolymarketMarkets();

    if (category) {
      markets = markets.filter(m => m.category === category);
    }

    if (q) {
      markets = markets.filter(m => m.question.toLowerCase().includes(q));
    }

    const limited = markets.slice(0, limit);

    // Group by category for the frontend
    const byCategory: Record<string, PredictionMarket[]> = {};
    for (const m of limited) {
      if (!byCategory[m.category]) byCategory[m.category] = [];
      byCategory[m.category].push(m);
    }

    return Response.json({
      count: limited.length,
      total: markets.length,
      updatedAt: cache?.ts ? new Date(cache.ts).toISOString() : null,
      source: 'Polymarket (polymarket.com)',
      categories: Object.keys(byCategory),
      markets: limited,
      byCategory,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Polymarket API error:', error);
    return Response.json({ error: 'Failed to fetch prediction markets' }, { status: 502 });
  }
}
