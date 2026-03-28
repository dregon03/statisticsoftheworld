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

// Static historical data files (pre-downloaded, stored in /public/data/history/)
const STATIC_HISTORY: Record<string, string> = {
  // US
  'YF.IDX.USA':    'sp500',       // from 1871
  'YF.FUT.SP500':  'sp500',
  'YF.FUT.DOW':    'djia',        // from 1992
  'YF.FUT.NASDAQ': 'nasdaq',      // from 1971
  'YF.FUT.RUSSELL': 'russell2000', // from 1987
  // Americas
  'YF.IDX.CAN':    'tsx',         // from 1984
  'YF.IDX.BRA':    'bovespa',     // from 1993
  'YF.IDX.MEX':    'ipc_mexico',  // from 1991
  'YF.IDX.ARG':    'merval',      // from 1996
  // Europe
  'YF.IDX.GBR':    'ftse100',     // from 1984
  'YF.IDX.DEU':    'dax',         // from 1987
  'YF.IDX.FRA':    'cac40',       // from 1990
  'YF.IDX.ESP':    'ibex35',      // from 1993
  'YF.IDX.ITA':    'ftse_mib',    // from 1997
  'YF.IDX.CHE':    'smi',         // from 1990
  'YF.IDX.NLD':    'aex',         // from 1992
  // Asia-Pacific
  'YF.IDX.JPN':    'nikkei',      // from 1949
  'YF.IDX.HKG':    'hang_seng',   // from 1986
  'YF.IDX.CHN':    'shanghai',    // from 1997
  'YF.IDX.KOR':    'kospi',       // from 1996
  'YF.IDX.IND':    'sensex',      // from 1997
  'YF.IDX.AUS':    'asx200',      // from 1992
  'YF.IDX.NZL':    'nzx50',       // from 2003
  'YF.IDX.SGP':    'sti',         // from 1987
  'YF.IDX.IDN':    'jakarta',     // from 1990
  'YF.IDX.MYS':    'klci',        // from 1993
  // Middle East & Africa
  'YF.IDX.ISR':    'ta125',       // from 1992
  'YF.IDX.SAU':    'tadawul',     // from 1998
  'YF.IDX.ZAF':    'jse',         // from 2012
};

// FRED fallback for indices not in static files
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

// ── Static file loader (pre-downloaded historical data) ────────────
import { readFileSync } from 'fs';
import { join } from 'path';

function loadStaticHistory(filename: string): { points: { date: string; value: number }[] } | null {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'history', `${filename}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (Array.isArray(data) && data.length > 10) {
      return { points: data };
    }
    return null;
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
    // 1. Try static pre-downloaded data (most reliable, no external API)
    const staticFile = id ? STATIC_HISTORY[id] : null;
    if (staticFile) {
      const staticResult = loadStaticHistory(staticFile);
      if (staticResult && staticResult.points.length > 0) {
        const result = { ...staticResult, source: 'Historical' };
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
