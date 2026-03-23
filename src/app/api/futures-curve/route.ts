/**
 * Futures Curve API — fetches settlement prices for multiple
 * expiry months of a commodity from Yahoo Finance.
 *
 * Usage: GET /api/futures-curve?commodity=crude-oil
 */

// CME/NYMEX/COMEX futures contract month codes
// F=Jan G=Feb H=Mar J=Apr K=May M=Jun N=Jul Q=Aug U=Sep V=Oct X=Nov Z=Dec
const MONTH_CODES = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface FuturesContract {
  symbol: string;
  month: string;
  year: number;
  label: string;
  price: number | null;
}

// Commodity → Yahoo Finance symbol root + exchange
const COMMODITY_MAP: Record<string, { root: string; exchange: string; label: string }> = {
  'crude-oil': { root: 'CL', exchange: 'NYM', label: 'WTI Crude Oil' },
  'brent': { root: 'BZ', exchange: 'NYM', label: 'Brent Crude' },
  'natural-gas': { root: 'NG', exchange: 'NYM', label: 'Natural Gas' },
  'gold': { root: 'GC', exchange: 'CMX', label: 'Gold' },
  'silver': { root: 'SI', exchange: 'CMX', label: 'Silver' },
  'platinum': { root: 'PL', exchange: 'NYM', label: 'Platinum' },
  'copper': { root: 'HG', exchange: 'CMX', label: 'Copper' },
  'wheat': { root: 'ZW', exchange: 'CBT', label: 'Wheat' },
  'corn': { root: 'ZC', exchange: 'CBT', label: 'Corn' },
  'soybeans': { root: 'ZS', exchange: 'CBT', label: 'Soybeans' },
  'coffee': { root: 'KC', exchange: 'NYB', label: 'Coffee' },
  'cotton': { root: 'CT', exchange: 'NYB', label: 'Cotton' },
  'sugar': { root: 'SB', exchange: 'NYB', label: 'Sugar' },
  'cocoa': { root: 'CC', exchange: 'NYB', label: 'Cocoa' },
};

// Also map SOTW indicator IDs to commodity slugs
const ID_TO_SLUG: Record<string, string> = {
  'YF.CRUDE_OIL': 'crude-oil',
  'YF.BRENT': 'brent',
  'YF.NATGAS': 'natural-gas',
  'YF.GOLD': 'gold',
  'YF.SILVER': 'silver',
  'YF.PLATINUM': 'platinum',
  'YF.COPPER': 'copper',
  'YF.WHEAT': 'wheat',
  'YF.CORN': 'corn',
  'YF.SOYBEANS': 'soybeans',
  'YF.COFFEE': 'coffee',
  'YF.COTTON': 'cotton',
  'YF.SUGAR': 'sugar',
  'YF.COCOA': 'cocoa',
};

// Cache: 1 hour
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000;

async function fetchContractPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let commodity = searchParams.get('commodity') || '';
  const indicatorId = searchParams.get('id') || '';

  // Map indicator ID to commodity slug
  if (!commodity && indicatorId) {
    commodity = ID_TO_SLUG[indicatorId] || '';
  }

  if (!commodity || !COMMODITY_MAP[commodity]) {
    return Response.json({
      error: 'Unknown commodity',
      available: Object.keys(COMMODITY_MAP),
      hint: 'Use ?commodity=crude-oil or ?id=YF.CRUDE_OIL',
    }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(commodity);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Response.json(cached.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  }

  const { root, exchange, label } = COMMODITY_MAP[commodity];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear() % 100; // 2-digit year

  // Build symbols for next 8 contract months
  const contracts: { symbol: string; month: string; year: number; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const monthIdx = (currentMonth + i) % 12;
    const yearOffset = Math.floor((currentMonth + i) / 12);
    const yr = currentYear + yearOffset;
    const monthCode = MONTH_CODES[monthIdx];
    const symbol = `${root}${monthCode}${yr}.${exchange}`;
    contracts.push({
      symbol,
      month: MONTH_NAMES[monthIdx],
      year: 2000 + yr,
      label: `${MONTH_NAMES[monthIdx]} ${2000 + yr}`,
    });
  }

  // Fetch all contract prices in parallel
  const prices = await Promise.all(
    contracts.map(c => fetchContractPrice(c.symbol))
  );

  const curve: FuturesContract[] = contracts
    .map((c, i) => ({ ...c, price: prices[i] }))
    .filter(c => c.price !== null);

  // Determine market structure
  let structure: 'backwardation' | 'contango' | 'flat' = 'flat';
  let structureDescription = '';
  if (curve.length >= 2) {
    const front = curve[0].price!;
    const back = curve[curve.length - 1].price!;
    const diff = ((back - front) / front) * 100;
    if (diff < -2) {
      structure = 'backwardation';
      structureDescription = `Markets expect ${label} prices to decline ${Math.abs(diff).toFixed(1)}% over the next ${curve.length} months.`;
    } else if (diff > 2) {
      structure = 'contango';
      structureDescription = `Markets expect ${label} prices to rise ${diff.toFixed(1)}% over the next ${curve.length} months.`;
    } else {
      structure = 'flat';
      structureDescription = `Markets expect ${label} prices to remain roughly stable.`;
    }
  }

  const result = {
    commodity,
    label,
    contracts: curve.map(c => ({
      label: c.label,
      price: c.price,
      changeFromFront: curve[0].price
        ? (((c.price! - curve[0].price!) / curve[0].price!) * 100)
        : 0,
    })),
    structure,
    structureDescription,
    source: 'CME Group via Yahoo Finance',
    updatedAt: new Date().toISOString(),
  };

  cache.set(commodity, { data: result, ts: Date.now() });

  return Response.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  });
}
