// Yahoo Finance Commodity chart API — with FRED fallback for long-range historical data

const FRED_API_KEY = process.env.FRED_API_KEY;

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

// Static historical data files (pre-downloaded, stored in /public/data/history/)
// Sources: World Bank Pink Sheet (1960+), datahub.io, FRED, IMF
const STATIC_COMMODITY: Record<string, string> = {
  // Precious Metals
  'YF.GOLD':         'gold',       // from 1833 (datahub/Shiller)
  'YF.SILVER':       'silver',     // from 1960 (World Bank)
  'YF.PLATINUM':     'platinum',   // from 1960 (World Bank)
  'YF.PALLADIUM':    'platinum',   // proxy — palladium data limited
  // Energy
  'YF.CRUDE_OIL':    'wti',        // from 1982 (World Bank)
  'YF.BRENT':        'brent',      // from 1960 (World Bank)
  'YF.NATGAS':       'natgas',     // from 1960 (World Bank)
  'YF.GASOLINE':     'wti',        // proxy — tracks crude
  'YF.HEATING_OIL':  'wti',        // proxy — tracks crude
  // Industrial Metals
  'YF.COPPER':       'copper',     // from 1960 (World Bank)
  'YF.ALUMINUM':     'aluminum',   // from 1960 (World Bank)
  'AV.ALUMINUM':     'aluminum',
  'YF.STEEL':        'iron_ore',   // proxy
  'YF.IRON_ORE':     'iron_ore',   // from 1990 (IMF)
  'YF.NICKEL_ETC':   'nickel',     // from 1960 (World Bank)
  'YF.ZINC_ETC':     'zinc',       // from 1960 (World Bank)
  // Grains
  'YF.WHEAT':        'wheat',      // from 1960 (World Bank)
  'YF.WHEAT_KC':     'wheat',
  'YF.CORN':         'corn',       // from 1960 (World Bank)
  'YF.SOYBEANS':     'soybeans',   // from 1960 (World Bank)
  'YF.SOYBEAN_MEAL': 'soybean_meal', // from 1960 (World Bank)
  'YF.SOYBEAN_OIL':  'soybean_oil',  // from 1960 (World Bank)
  'YF.OATS':         'barley',     // proxy — similar grain
  'YF.RICE':         'rice',       // from 1991 (IMF)
  // Softs
  'YF.COFFEE':       'coffee_arabica', // from 1960 (World Bank)
  'YF.COCOA':        'cocoa',      // from 1960 (World Bank)
  'YF.SUGAR':        'sugar',      // from 1990 (IMF)
  'YF.COTTON':       'cotton',     // from 1960 (World Bank)
  'YF.OJ':           'orange',     // from 1960 (World Bank)
  'YF.LUMBER':       'logs',       // from 1970 (World Bank)
  // Livestock
  'YF.LIVE_CATTLE':  'beef',       // from 2003 (IMF)
  'YF.LEAN_HOGS':    'pork',       // from 1992 (IMF)
  'YF.FEEDER_CATTLE':'beef',       // proxy
};

// FRED series for commodities
const FRED_COMMODITY: Record<string, { series: string; start: string }> = {
  'YF.CRUDE_OIL': { series: 'WTISPLC',          start: '1946-01-01' },
  'YF.BRENT':     { series: 'DCOILBRENTEU',     start: '1987-05-20' },
  'YF.NATGAS':    { series: 'DHHNGSP',          start: '1997-01-07' },
  'YF.COPPER':    { series: 'PCOPPUSDM',        start: '1992-01-01' },
  'YF.ALUMINUM':  { series: 'PALUMUSDM',        start: '1992-01-01' },
  'AV.ALUMINUM':  { series: 'PALUMUSDM',        start: '1992-01-01' },
  'YF.WHEAT':     { series: 'PWHEAMTUSDM',      start: '1992-01-01' },
  'YF.CORN':      { series: 'PMAIZMTUSDM',      start: '1992-01-01' },
  'YF.COFFEE':    { series: 'PCOFFOTMUSDM',     start: '1992-01-01' },
  'YF.COCOA':     { series: 'PCOCOUSDM',        start: '1992-01-01' },
  'YF.SUGAR':     { series: 'PSUGAISAUSDM',     start: '1992-01-01' },
  'YF.COTTON':    { series: 'PCOTTINDUSDM',     start: '1992-01-01' },
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
  if (range === '1d') return 25 * 1000;
  if (range === '5d') return 2 * 60 * 1000;
  if (range === 'max' || range === '10y') return 60 * 60 * 1000;
  return 2 * 60 * 1000;
}

// Static file loader (pre-downloaded historical data)
import { readFileSync } from 'fs';
import { join } from 'path';

function loadStaticHistory(filename: string): { points: { date: string; value: number }[] } | null {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'history', `${filename}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (Array.isArray(data) && data.length > 10) return { points: data };
    return null;
  } catch {
    return null;
  }
}

function dateInTz(date: Date, tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    return parts;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

async function fetchFredData(id: string): Promise<{ points: { date: string; value: number }[] } | null> {
  const fredInfo = FRED_COMMODITY[id];
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

  // For 'max' range, try deep historical sources first
  if (range === 'max') {
    // 1. Try static pre-downloaded data (most reliable)
    const staticFile = STATIC_COMMODITY[id];
    if (staticFile) {
      const staticResult = loadStaticHistory(staticFile);
      if (staticResult && staticResult.points.length > 0) {
        const result = { ...staticResult, source: 'Historical' };
        cache[cacheKey] = { data: result, ts: Date.now() };
        return Response.json(result);
      }
    }

    // 2. Try FRED as fallback
    if (FRED_COMMODITY[id]) {
      const fredResult = await fetchFredData(id);
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
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
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
    currency,
    regularMarketPrice: mktPrice,
    regularMarketChange: mktChange != null ? Math.round(mktChange * 100) / 100 : null,
    regularMarketChangePercent: mktChangePct != null ? Math.round(mktChangePct * 100) / 100 : null,
    previousClose: prevClose,
    regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
  };
}
