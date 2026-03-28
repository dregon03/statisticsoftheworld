// Yahoo Finance FX chart API — supports currency pairs + DXY
const FX_SYMBOLS: Record<string, string> = {
  // G10 Majors
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'USDJPY': 'JPY=X',
  'USDCAD': 'CAD=X',
  'AUDUSD': 'AUDUSD=X',
  'NZDUSD': 'NZDUSD=X',
  'USDCHF': 'CHF=X',
  'USDSEK': 'SEK=X',
  'USDNOK': 'NOK=X',
  // Europe
  'USDDKK': 'DKK=X',
  'USDPLN': 'PLN=X',
  'USDCZK': 'CZK=X',
  'USDHUF': 'HUF=X',
  'USDRON': 'RON=X',
  'USDRUB': 'RUB=X',
  'USDISK': 'ISK=X',
  'USDTRY': 'TRY=X',
  'USDUAH': 'UAH=X',
  // Asia-Pacific
  'USDCNY': 'CNY=X',
  'USDHKD': 'HKD=X',
  'USDTWD': 'TWD=X',
  'USDKRW': 'KRW=X',
  'USDJPY2': 'JPY=X', // alias handled by USDJPY
  'USDSGD': 'SGD=X',
  'USDINR': 'INR=X',
  'USDPHP': 'PHP=X',
  'USDTHB': 'THB=X',
  'USDIDR': 'IDR=X',
  'USDMYR': 'MYR=X',
  'USDVND': 'VND=X',
  'USDPKR': 'PKR=X',
  'USDBDT': 'BDT=X',
  'USDLKR': 'LKR=X',
  // Americas
  'USDCAD2': 'CAD=X', // alias handled by USDCAD
  'USDBRL': 'BRL=X',
  'USDMXN': 'MXN=X',
  'USDARS': 'ARS=X',
  'USDCLP': 'CLP=X',
  'USDCOP': 'COP=X',
  'USDPEN': 'PEN=X',
  'USDUYU': 'UYU=X',
  // Middle East & Africa
  'USDZAR': 'ZAR=X',
  'USDAED': 'AED=X',
  'USDSAR': 'SAR=X',
  'USDILS': 'ILS=X',
  'USDEGP': 'EGP=X',
  'USDNGN': 'NGN=X',
  'USDKES': 'KES=X',
  'USDGHS': 'GHS=X',
  'USDMAD': 'MAD=X',
  'USDTND': 'TND=X',
  // Oceania
  'USDFJD': 'FJD=X',
  // Crypto
  'BTCUSD': 'BTC-USD',
  'ETHUSD': 'ETH-USD',
  'BNBUSD': 'BNB-USD',
  'XRPUSD': 'XRP-USD',
  'SOLUSD': 'SOL-USD',
  'ADAUSD': 'ADA-USD',
  'DOGEUSD': 'DOGE-USD',
  'AVAXUSD': 'AVAX-USD',
  'DOTUSD': 'DOT-USD',
  'LINKUSD': 'LINK-USD',
  'MATICUSD': 'MATIC-USD',
  'UNIUSD': 'UNI7083-USD',
  'ATOMUSD': 'ATOM-USD',
  'LTCUSD': 'LTC-USD',
  'BCHUSD': 'BCH-USD',
  'NEARUSD': 'NEAR-USD',
  'XLMUSD': 'XLM-USD',
  'ICPUSD': 'ICP-USD',
  'APTUSD': 'APT21794-USD',
  'SUIUSD': 'SUI20947-USD',
  // Index
  'DXY': 'DX-Y.NYB',
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

const FRED_API_KEY = process.env.FRED_API_KEY;

// Stooq.com symbols for deep historical FX data (verified)
const STOOQ_FX: Record<string, string> = {
  // G10 Majors
  'GBPUSD': 'gbpusd',   // from 1900
  'EURUSD': 'eurusd',   // from 1971 (synthetic pre-euro)
  'USDJPY': 'usdjpy',   // from 1971
  'USDCAD': 'usdcad',   // from 1971
  'USDCHF': 'usdchf',   // from 1971
  'AUDUSD': 'audusd',   // from 1971
  'NZDUSD': 'nzdusd',   // from 1971
  'USDSEK': 'usdsek',   // from 1971
  'USDNOK': 'usdnok',   // from 1971
  // Europe
  'USDPLN': 'usdpln',   // from 1984
  'USDCZK': 'usdczk',   // from 1995
  'USDHUF': 'usdhuf',   // from 1995
  'USDRON': 'usdron',   // from 1995
  'USDRUB': 'usdrub',   // from 1995
  'USDTRY': 'usdtry',   // from 1984
  // Asia-Pacific
  'USDCNY': 'usdcny',   // from 1984
  'USDHKD': 'usdhkd',   // from 1984
  'USDTWD': 'usdtwd',   // from 1984
  'USDKRW': 'usdkrw',   // from 1981
  'USDSGD': 'usdsgd',   // from 1981
  'USDINR': 'usdinr',   // from 1973
  'USDPHP': 'usdphp',   // from 1993
  'USDTHB': 'usdthb',   // from 1993
  'USDIDR': 'usdidr',   // from 1993
  'USDMYR': 'usdmyr',   // from 1990
  // Americas
  'USDBRL': 'usdbrl',   // from 1995
  'USDMXN': 'usdmxn',   // from 1990
  'USDARS': 'usdars',   // from 1996
  'USDCLP': 'usdclp',   // from 1993
  // Middle East & Africa
  'USDZAR': 'usdzar',   // from 1971
  'USDILS': 'usdils',   // from 1993
  'USDEGP': 'usdegp',   // from 1995
};

// Stooq CSV fetcher
async function fetchStooqFx(stooqSym: string): Promise<{ points: { date: string; value: number }[] } | null> {
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
      const date = cols[0];
      const close = parseFloat(cols[4]);
      if (!isNaN(close) && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        points.push({ date, value: Math.round(close * 10000) / 10000 });
      }
    }
    if (points.length < 10) return null;
    return { points };
  } catch {
    return null;
  }
}

// FRED series for currencies — back to 1971 (post-Bretton Woods)
const FRED_FX: Record<string, { series: string; start: string }> = {
  'EURUSD': { series: 'DEXUSEU',  start: '1999-01-04' },
  'GBPUSD': { series: 'DEXUSUK',  start: '1971-01-04' },
  'USDJPY': { series: 'DEXJPUS',  start: '1971-01-04' },
  'USDCAD': { series: 'DEXCAUS',  start: '1971-01-04' },
  'USDCHF': { series: 'DEXSZUS',  start: '1971-01-04' },
  'AUDUSD': { series: 'DEXUSAL',  start: '1971-01-04' },
  'USDCNY': { series: 'DEXCHUS',  start: '1981-01-02' },
  'USDKRW': { series: 'DEXKOUS',  start: '1981-04-13' },
  'USDMXN': { series: 'DEXMXUS',  start: '1993-11-08' },
  'USDBRL': { series: 'DEXBZUS',  start: '1995-01-02' },
  'USDINR': { series: 'DEXINUS',  start: '1973-01-02' },
  'USDSGD': { series: 'DEXSIUS',  start: '1981-01-02' },
  'USDZAR': { series: 'DEXSFUS',  start: '1971-01-04' },
  'USDHKD': { series: 'DEXHKUS',  start: '1981-01-02' },
  'USDTWD': { series: 'DEXTAUS',  start: '1983-10-03' },
  'NZDUSD': { series: 'DEXUSNZ',  start: '1971-01-04' },
  'USDSEK': { series: 'DEXSDUS',  start: '1971-01-04' },
  'USDNOK': { series: 'DEXNOUS',  start: '1971-01-04' },
  'USDDKK': { series: 'DEXDNUS',  start: '1971-01-04' },
  'USDTHB': { series: 'DEXTHUS',  start: '1981-01-02' },
  'USDMYR': { series: 'DEXMAUS',  start: '1971-01-04' },
};

let cache: Record<string, { data: any; ts: number }> = {};
function cacheTtl(range: string): number {
  if (range === '1d') return 25_000;
  if (range === '5d') return 2 * 60_000;
  if (range === 'max' || range === '10y') return 60 * 60_000;
  return 5 * 60_000;
}

async function fetchFredFx(pair: string): Promise<{ points: { date: string; value: number }[] } | null> {
  const fredInfo = FRED_FX[pair];
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
        points.push({ date: obs.date, value: Math.round(val * 10000) / 10000 });
      }
    }

    if (points.length > 2000) {
      const sampled: typeof points = [];
      const step = Math.ceil(points.length / 2000);
      for (let i = 0; i < points.length; i += step) {
        sampled.push(points[i]);
      }
      if (sampled[sampled.length - 1] !== points[points.length - 1]) {
        sampled.push(points[points.length - 1]);
      }
      return { points: sampled };
    }

    return { points };
  } catch {
    return null;
  }
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
  const pair = (searchParams.get('pair') || '').toUpperCase();
  const range = searchParams.get('range') || '1y';

  const yahooSymbol = FX_SYMBOLS[pair];
  if (!yahooSymbol) {
    return Response.json({ error: 'Unknown pair' }, { status: 400 });
  }
  if (!VALID_RANGES.includes(range as any)) {
    return Response.json({ error: 'Invalid range' }, { status: 400 });
  }

  const cacheKey = `fx_${pair}_${range}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < cacheTtl(range)) {
    return Response.json(cached.data);
  }

  // For 'max' range, try deep historical sources first
  if (range === 'max') {
    // 1. Try Stooq (GBP/USD from 1900, most pairs from 1971)
    const stooqSym = STOOQ_FX[pair];
    if (stooqSym) {
      const stooqResult = await fetchStooqFx(stooqSym);
      if (stooqResult && stooqResult.points.length > 0) {
        const result = { ...stooqResult, source: 'Stooq' };
        cache[cacheKey] = { data: result, ts: Date.now() };
        return Response.json(result);
      }
    }

    // 2. Try FRED
    if (FRED_FX[pair]) {
      const fredResult = await fetchFredFx(pair);
      if (fredResult && fredResult.points.length > 0) {
        const result = { ...fredResult, source: 'FRED' };
        cache[cacheKey] = { data: result, ts: Date.now() };
        return Response.json(result);
      }
    }
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
        value: Math.round(close * 10000) / 10000,
      });
    }
  }

  // For 1d charts, prepend previousClose so chart direction matches daily change %
  if (range === '1d' && points.length > 0) {
    const prevClose = result.meta?.chartPreviousClose ?? result.meta?.previousClose;
    if (prevClose != null && !isNaN(prevClose)) {
      const firstTimestamp = timestamps[0];
      if (firstTimestamp) {
        const prevDate = new Date((firstTimestamp - 60) * 1000);
        points.unshift({
          date: prevDate.toLocaleString('en-US', { timeZone: tz, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          value: Math.round(prevClose * 10000) / 10000,
        });
      }
    }
  }

  // Append live price for daily+ charts
  if (!isIntraday && result.meta?.regularMarketPrice) {
    const livePrice = Math.round(result.meta.regularMarketPrice * 10000) / 10000;
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
    regularMarketChange: mktChange != null ? Math.round(mktChange * 10000) / 10000 : null,
    regularMarketChangePercent: mktChangePct != null ? Math.round(mktChangePct * 100) / 100 : null,
    regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
  };
}
