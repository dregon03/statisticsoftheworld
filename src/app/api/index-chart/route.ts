// Yahoo Finance Index/Futures chart API
const INDEX_SYMBOLS: Record<string, string> = {
  // Indices
  'YF.IDX.USA': '^GSPC', 'YF.IDX.CAN': '^GSPTSE', 'YF.IDX.BRA': '^BVSP',
  'YF.IDX.MEX': '^MXX', 'YF.IDX.ARG': '^MERV',
  'YF.IDX.GBR': '^FTSE', 'YF.IDX.DEU': '^GDAXI', 'YF.IDX.FRA': '^FCHI',
  'YF.IDX.NLD': '^AEX', 'YF.IDX.ESP': '^IBEX', 'YF.IDX.ITA': 'FTSEMIB.MI',
  'YF.IDX.CHE': '^SSMI',
  'YF.IDX.JPN': '^N225', 'YF.IDX.HKG': '^HSI', 'YF.IDX.CHN': '000001.SS',
  'YF.IDX.KOR': '^KS11', 'YF.IDX.IND': '^BSESN', 'YF.IDX.AUS': '^AXJO',
  'YF.IDX.NZL': '^NZ50', 'YF.IDX.SGP': '^STI', 'YF.IDX.IDN': '^JKSE',
  'YF.IDX.MYS': '^KLSE', 'YF.IDX.ISR': '^TA125.TA', 'YF.IDX.SAU': '^TASI.SR',
  'YF.IDX.ZAF': '^J203.JO',
  // Futures
  'YF.FUT.SP500': 'ES=F', 'YF.FUT.NASDAQ': 'NQ=F',
  'YF.FUT.DOW': 'YM=F', 'YF.FUT.RUSSELL': 'RTY=F',
  // Stocks (use ticker directly)
};

const VALID_RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'] as const;

function intervalForRange(range: string): string {
  switch (range) {
    case '1d': return '2m';
    case '5d': return '15m';
    default: return range === '5y' ? '1wk' : '1d';
  }
}

let cache: Record<string, { data: any; ts: number }> = {};
function cacheTtl(range: string): number {
  if (range === '1d') return 60_000;
  if (range === '5d') return 2 * 60_000;
  return 5 * 60_000;
}

function dateInTz(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const ticker = searchParams.get('ticker') || '';
  const range = searchParams.get('range') || '1y';

  // Support both SOTW IDs and raw Yahoo tickers (for stocks)
  const yahooSymbol = id ? INDEX_SYMBOLS[id] : ticker;
  if (!yahooSymbol) {
    return Response.json({ error: 'Unknown index' }, { status: 400 });
  }
  if (!VALID_RANGES.includes(range as any)) {
    return Response.json({ error: 'Invalid range' }, { status: 400 });
  }

  const cacheKey = `idx_${yahooSymbol}_${range}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < cacheTtl(range)) {
    return Response.json(cached.data);
  }

  const interval = intervalForRange(range);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}`;

  try {
    let res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      res = await fetch(url.replace('query1', 'query2'), { headers: { 'User-Agent': 'Mozilla/5.0' } });
    }
    if (!res.ok) {
      return Response.json({ error: 'Yahoo Finance unavailable' }, { status: 502 });
    }

    const json = await res.json();
    const result = parseChart(json, range);
    cache[cacheKey] = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}

function parseChart(json: any, range: string) {
  const result = json?.chart?.result?.[0];
  if (!result) return { points: [] };

  const timestamps: number[] = result.timestamp || [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
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

  if (!isIntraday && result.meta?.regularMarketPrice) {
    const livePrice = Math.round(result.meta.regularMarketPrice * 100) / 100;
    const todayStr = dateInTz(new Date(), tz);
    const lastPoint = points[points.length - 1];
    if (lastPoint && lastPoint.date < todayStr) {
      points.push({ date: todayStr, value: livePrice });
    } else if (lastPoint && lastPoint.date === todayStr) {
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
    regularMarketPrice: mktPrice,
    previousClose: prevClose,
    regularMarketChange: mktChange != null ? Math.round(mktChange * 100) / 100 : null,
    regularMarketChangePercent: mktChangePct != null ? Math.round(mktChangePct * 100) / 100 : null,
    regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
  };
}
