// Yahoo Finance Index/Futures chart API
// For 'max' range: Stooq.com → FRED → Yahoo (deepest historical data first)

const FRED_API_KEY = process.env.FRED_API_KEY;

const INDEX_SYMBOLS: Record<string, string> = {
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
  'YF.FUT.SP500': 'ES=F', 'YF.FUT.NASDAQ': 'NQ=F',
  'YF.FUT.DOW': 'YM=F', 'YF.FUT.RUSSELL': 'RTY=F',
};

// Stooq.com symbols for deep historical data (monthly CSV, verified)
const STOOQ_SYMBOLS: Record<string, string> = {
  'YF.IDX.USA':    '^spx',   // S&P 500 from 1800
  'YF.FUT.SP500':  '^spx',
  'YF.FUT.DOW':    '^dji',   // Dow Jones from 1896
  'YF.IDX.JPN':    '^nkx',   // Nikkei from 1914
  'YF.IDX.GBR':    '^ukx',   // FTSE 100 from 1935
  'YF.IDX.DEU':    '^dax',   // DAX from 1960
  'YF.IDX.HKG':    '^hsi',   // Hang Seng from 1969
  'YF.IDX.CAN':    '^tsx',   // TSX from 1956
  'YF.IDX.SGP':    '^sti',   // STI from 1987
  'YF.IDX.NZL':    '^nz50',  // NZX 50 from 2001
  'YF.IDX.SAU':    '^tasi',  // Tadawul from 2001
};

// FRED fallback for series Stooq doesn't have
const FRED_SERIES: Record<string, { series: string; start: string }> = {
  'YF.FUT.NASDAQ': { series: 'NASDAQCOM',  start: '1971-02-05' },
  'YF.IDX.JPN':    { series: 'NIKKEI225',  start: '1949-05-16' },
};

const VALID_RANGES = ['1d', '5d', '1mo', '3mo', '6mo', 'ytd', '1y', '2y', '5y', '10y', 'max'] as const;

function intervalForRange(range: string): string {
  switch (range) {
    case '1d': return '2m';
    case '5d': return '15m';
    case '1mo': return '1d';
    case '3mo': return '1d';
    case '6mo': return '1d';
    case 'ytd': return '1d';
    case '1y': return '1d';
    case '2y': return '1wk';
    case '5y': return '1wk';
    case '10y': return '1wk';
    case 'max': return '1mo';
    default: return '1d';
  }
}

let cache: Record<string, { data: any; ts: number }> = {};
function cacheTtl(range: string): number {
  if (range === '1d') return 25_000;
  if (range === '5d') return 2 * 60_000;
  if (range === 'max' || range === '10y') return 6 * 60 * 60_000; // 6 hours for historical
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

// ── Stooq.com CSV fetcher ──────────────────────────────────────────
async function fetchStooqData(stooqSym: string): Promise<{ points: { date: string; value: number }[] } | null> {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSym)}&d1=18000101&d2=20270101&i=m`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2 || lines[1].startsWith('No data')) return null;

    const points: { date: string; value: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < 5) continue;
      const date = cols[0]; // YYYY-MM-DD
      const close = parseFloat(cols[4]);
      if (!isNaN(close) && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        points.push({ date, value: Math.round(close * 100) / 100 });
      }
    }

    if (points.length < 10) return null;
    return { points };
  } catch {
    return null;
  }
}

// ── FRED fetcher ───────────────────────────────────────────────────
async function fetchFredData(id: string): Promise<{ points: { date: string; value: number }[] } | null> {
  const fredInfo = FRED_SERIES[id];
  if (!fredInfo || !FRED_API_KEY) return null;

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${fredInfo.series}&observation_start=${fredInfo.start}&api_key=${FRED_API_KEY}&file_type=json&sort_order=asc`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const observations = json.observations || [];

    const points: { date: string; value: number }[] = [];
    for (const obs of observations) {
      const val = parseFloat(obs.value);
      if (!isNaN(val) && obs.value !== '.') {
        points.push({ date: obs.date, value: Math.round(val * 100) / 100 });
      }
    }

    if (points.length > 2000) {
      const sampled: typeof points = [];
      const step = Math.ceil(points.length / 2000);
      for (let i = 0; i < points.length; i += step) sampled.push(points[i]);
      if (sampled[sampled.length - 1] !== points[points.length - 1]) sampled.push(points[points.length - 1]);
      return { points: sampled };
    }

    return { points };
  } catch {
    return null;
  }
}

// ── Main handler ───────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const ticker = searchParams.get('ticker') || '';
  const range = searchParams.get('range') || '1y';

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

  // For 'max' range, try deep historical sources first
  if (range === 'max') {
    // 1. Try Stooq for indices (S&P from 1800, Dow from 1896)
    const stooqSym = id ? STOOQ_SYMBOLS[id] : null;
    if (stooqSym) {
      const stooqResult = await fetchStooqData(stooqSym);
      if (stooqResult && stooqResult.points.length > 0) {
        const result = { ...stooqResult, source: 'Stooq' };
        cache[cacheKey] = { data: result, ts: Date.now() };
        return Response.json(result);
      }
    }

    // 1b. Try Stooq for individual US stocks (e.g., AAPL → aapl.us)
    if (ticker && !ticker.includes('=') && !ticker.startsWith('^')) {
      const stockSym = ticker.toLowerCase().replace('.', '-') + '.us';
      const stooqResult = await fetchStooqData(stockSym);
      if (stooqResult && stooqResult.points.length > 0) {
        const result = { ...stooqResult, source: 'Stooq' };
        cache[cacheKey] = { data: result, ts: Date.now() };
        return Response.json(result);
      }
    }

    // 2. Try FRED (Nikkei from 1949, NASDAQ from 1971)
    if (id && FRED_SERIES[id]) {
      const fredResult = await fetchFredData(id);
      if (fredResult && fredResult.points.length > 0) {
        const result = { ...fredResult, source: 'FRED' };
        cache[cacheKey] = { data: result, ts: Date.now() };
        return Response.json(result);
      }
    }
  }

  // 3. Fall back to Yahoo Finance
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
