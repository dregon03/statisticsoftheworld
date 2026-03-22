const SOTW_TO_YAHOO: Record<string, string> = {
  'YF.GOLD': 'GC=F',
  'YF.SILVER': 'SI=F',
  'YF.CRUDE_OIL': 'CL=F',
  'YF.BRENT': 'BZ=F',
  'YF.NATGAS': 'NG=F',
  'YF.COPPER': 'HG=F',
  'YF.PLATINUM': 'PL=F',
  'YF.PALLADIUM': 'PA=F',
  'YF.WHEAT': 'ZW=F',
  'YF.CORN': 'ZC=F',
  'YF.SOYBEANS': 'ZS=F',
  'YF.COFFEE': 'KC=F',
  'YF.COTTON': 'CT=F',
  'YF.SUGAR': 'SB=F',
  'YF.COCOA': 'CC=F',
  'AV.ALUMINUM': 'ALI=F',
};

const VALID_RANGES = ['1mo', '3mo', '6mo', '1y', '5y'] as const;

// Pick interval based on range to keep data points reasonable
function intervalForRange(range: string): string {
  switch (range) {
    case '1mo': return '1d';
    case '3mo': return '1d';
    case '6mo': return '1d';
    case '1y': return '1d';
    case '5y': return '1wk';
    default: return '1d';
  }
}

let cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 min

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const range = searchParams.get('range') || '1y';

  const yahooSymbol = SOTW_TO_YAHOO[id];
  if (!yahooSymbol) {
    return Response.json({ error: 'Unknown commodity' }, { status: 400 });
  }
  if (!VALID_RANGES.includes(range as any)) {
    return Response.json({ error: 'Invalid range' }, { status: 400 });
  }

  const cacheKey = `${id}_${range}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Response.json(cached.data);
  }

  const interval = intervalForRange(range);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      // Fallback: try query2
      const res2 = await fetch(url.replace('query1', 'query2'), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!res2.ok) {
        return Response.json({ error: 'Yahoo Finance unavailable' }, { status: 502 });
      }
      const json2 = await res2.json();
      const result = parseYahooChart(json2);
      cache[cacheKey] = { data: result, ts: Date.now() };
      return Response.json(result);
    }

    const json = await res.json();
    const result = parseYahooChart(json);
    cache[cacheKey] = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}

function parseYahooChart(json: any) {
  const result = json?.chart?.result?.[0];
  if (!result) return { points: [] };

  const timestamps: number[] = result.timestamp || [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
  const currency = result.meta?.currency || 'USD';

  const points: { date: string; value: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close != null && !isNaN(close)) {
      const d = new Date(timestamps[i] * 1000);
      points.push({
        date: d.toISOString().slice(0, 10),
        value: Math.round(close * 100) / 100,
      });
    }
  }

  return { points, currency };
}
