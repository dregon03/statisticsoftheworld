const SOTW_TO_YAHOO: Record<string, string> = {
  // Precious Metals
  'YF.GOLD': 'GC=F', 'YF.SILVER': 'SI=F', 'YF.PLATINUM': 'PL=F', 'YF.PALLADIUM': 'PA=F',
  // Industrial Metals
  'YF.COPPER': 'HG=F', 'YF.ALUMINUM': 'ALI=F', 'AV.ALUMINUM': 'ALI=F',
  'YF.STEEL': 'HRC=F', 'YF.IRON_ORE': 'TIO=F',
  // LME Proxy ETCs
  'YF.NICKEL_ETC': 'NICK.L', 'YF.ZINC_ETC': 'ZINC.L',
  // Energy
  'YF.CRUDE_OIL': 'CL=F', 'YF.BRENT': 'BZ=F', 'YF.NATGAS': 'NG=F',
  'YF.GASOLINE': 'RB=F', 'YF.HEATING_OIL': 'HO=F',
  // Grains
  'YF.WHEAT': 'ZW=F', 'YF.WHEAT_KC': 'KE=F', 'YF.CORN': 'ZC=F',
  'YF.SOYBEANS': 'ZS=F', 'YF.SOYBEAN_MEAL': 'ZM=F', 'YF.SOYBEAN_OIL': 'ZL=F',
  'YF.OATS': 'ZO=F', 'YF.RICE': 'ZR=F',
  // Softs
  'YF.COFFEE': 'KC=F', 'YF.COCOA': 'CC=F', 'YF.SUGAR': 'SB=F',
  'YF.COTTON': 'CT=F', 'YF.OJ': 'OJ=F', 'YF.LUMBER': 'LBR=F',
  // Livestock
  'YF.LIVE_CATTLE': 'LE=F', 'YF.LEAN_HOGS': 'HE=F', 'YF.FEEDER_CATTLE': 'GF=F',
  // Dairy
  'YF.MILK': 'DC=F', 'YF.BUTTER': 'CB=F', 'YF.CHEESE': 'CSC=F',
};

const VALID_RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y', 'max'] as const;

// Pick interval based on range to keep data points reasonable
function intervalForRange(range: string): string {
  switch (range) {
    case '1d': return '2m';   // 2-minute candles for intraday
    case '5d': return '15m';  // 15-minute candles for 5 days
    case '1mo': return '1d';
    case '3mo': return '1d';
    case '6mo': return '1d';
    case '1y': return '1d';
    case '5y': return '1wk';
    case 'max': return '1mo';
    default: return '1d';
  }
}

let cache: Record<string, { data: any; ts: number }> = {};
// Short cache for intraday, longer for historical
function cacheTtl(range: string): number {
  if (range === '1d') return 25 * 1000;       // 25s — ensures every 30s poll gets fresh data
  if (range === '5d') return 2 * 60 * 1000;   // 2 minutes for 5-day
  return 2 * 60 * 1000;                       // 2 minutes for all others
}

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
  if (cached && Date.now() - cached.ts < cacheTtl(range)) {
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
      const result = parseYahooChart(json2, range);
      cache[cacheKey] = { data: result, ts: Date.now() };
      return Response.json(result);
    }

    const json = await res.json();
    const result = parseYahooChart(json, range);
    cache[cacheKey] = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}

// Get YYYY-MM-DD in a specific timezone
function dateInTz(date: Date, tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    return parts; // en-CA gives YYYY-MM-DD format
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function parseYahooChart(json: any, range: string = '1y') {
  const result = json?.chart?.result?.[0];
  if (!result) return { points: [] };

  const timestamps: number[] = result.timestamp || [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
  const currency = result.meta?.currency || 'USD';
  const tz = result.meta?.exchangeTimezoneName || 'America/New_York';
  const isIntraday = range === '1d' || range === '5d';

  const points: { date: string; value: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close != null && !isNaN(close)) {
      const d = new Date(timestamps[i] * 1000);
      points.push({
        date: isIntraday
          ? d.toLocaleString('en-US', { timeZone: tz, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : dateInTz(d, tz),
        value: Math.round(close * 100) / 100,
      });
    }
  }

  // For 1d charts, prepend previousClose so the chart starts from yesterday's close
  // This ensures the chart direction matches the daily change %
  if (range === '1d' && points.length > 0) {
    const prevClose = result.meta?.chartPreviousClose ?? result.meta?.previousClose;
    if (prevClose != null && !isNaN(prevClose)) {
      const firstTimestamp = timestamps[0];
      if (firstTimestamp) {
        const prevDate = new Date((firstTimestamp - 60) * 1000);
        points.unshift({
          date: prevDate.toLocaleString('en-US', { timeZone: tz, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          value: Math.round(prevClose * 100) / 100,
        });
      }
    }
  }

  // For daily+ charts, append today's live price from meta if it's newer than last point
  if (!isIntraday && result.meta?.regularMarketPrice) {
    const livePrice = Math.round(result.meta.regularMarketPrice * 100) / 100;
    const todayStr = dateInTz(new Date(), tz);
    const lastPoint = points[points.length - 1];

    if (lastPoint && lastPoint.date < todayStr) {
      // Last candle is from a previous day — append today's live price
      points.push({ date: todayStr, value: livePrice });
    } else if (lastPoint && lastPoint.date === todayStr) {
      // Today's candle exists but may be stale — update with live price
      lastPoint.value = livePrice;
    }
  }

  const meta = result.meta || {};
  const mktPrice = meta.regularMarketPrice ?? null;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const mktChange = (mktPrice != null && prevClose != null) ? mktPrice - prevClose : null;
  const mktChangePct = (mktChange != null && prevClose) ? (mktChange / prevClose) * 100 : null;

  return {
    points,
    currency,
    regularMarketPrice: mktPrice,
    regularMarketChange: mktChange != null ? Math.round(mktChange * 100) / 100 : null,
    regularMarketChangePercent: mktChangePct != null ? Math.round(mktChangePct * 100) / 100 : null,
    previousClose: prevClose,
    regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
  };
}
