/**
 * FRED Historical Data API
 *
 * Returns long-range historical data from the Federal Reserve (FRED).
 * Covers indices, commodities, currencies, interest rates — many back to 1900s.
 *
 * Usage: /api/fred-history?series=SP500&start=1928-01-01
 *   or:  /api/fred-history?id=YF.IDX.USA  (maps SOTW IDs to FRED series)
 */

const FRED_API_KEY = process.env.FRED_API_KEY;

// ── SOTW ID → FRED Series mapping ──────────────────────────────────

// Stock Indices (verified dates)
const INDEX_SERIES: Record<string, { series: string; label: string; start: string; unit: string }> = {
  'YF.IDX.USA':   { series: 'SP500',      label: 'S&P 500',           start: '2016-03-28', unit: 'pts' },
  'YF.FUT.SP500': { series: 'SP500',      label: 'S&P 500',           start: '2016-03-28', unit: 'pts' },
  'YF.FUT.DOW':   { series: 'DJIA',       label: 'Dow Jones',         start: '2016-03-28', unit: 'pts' },
  'YF.FUT.NASDAQ':{ series: 'NASDAQCOM',  label: 'NASDAQ Composite',  start: '1971-02-05', unit: 'pts' },
  'YF.IDX.JPN':   { series: 'NIKKEI225',  label: 'Nikkei 225',        start: '1949-05-16', unit: 'pts' },
};

// Commodities (verified dates — World Bank monthly from 1992, daily energy from 1946+)
const COMMODITY_SERIES: Record<string, { series: string; label: string; start: string; unit: string }> = {
  // Energy
  'YF.CRUDE_OIL': { series: 'WTISPLC',          label: 'WTI Crude Oil (Spot)',     start: '1946-01-01', unit: '$/bbl' },
  'YF.BRENT':     { series: 'DCOILBRENTEU',     label: 'Brent Crude Oil',          start: '1987-05-20', unit: '$/bbl' },
  'YF.NATGAS':    { series: 'DHHNGSP',          label: 'Natural Gas (Henry Hub)',   start: '1997-01-07', unit: '$/MMBtu' },
  // Industrial Metals (monthly, World Bank)
  'YF.COPPER':    { series: 'PCOPPUSDM',        label: 'Copper',                   start: '1992-01-01', unit: '$/mt' },
  'YF.ALUMINUM':  { series: 'PALUMUSDM',        label: 'Aluminum',                 start: '1992-01-01', unit: '$/mt' },
  // Grains & Softs (monthly, World Bank)
  'YF.WHEAT':     { series: 'PWHEAMTUSDM',      label: 'Wheat',                    start: '1992-01-01', unit: '$/mt' },
  'YF.CORN':      { series: 'PMAIZMTUSDM',      label: 'Corn (Maize)',             start: '1992-01-01', unit: '$/mt' },
  'YF.COFFEE':    { series: 'PCOFFOTMUSDM',     label: 'Coffee',                   start: '1992-01-01', unit: '¢/lb' },
  'YF.COCOA':     { series: 'PCOCOUSDM',        label: 'Cocoa',                    start: '1992-01-01', unit: '$/mt' },
  'YF.SUGAR':     { series: 'PSUGAISAUSDM',     label: 'Sugar',                    start: '1992-01-01', unit: '¢/lb' },
  'YF.COTTON':    { series: 'PCOTTINDUSDM',     label: 'Cotton',                   start: '1992-01-01', unit: '¢/lb' },
};

// Currencies (USD-based pairs)
const CURRENCY_SERIES: Record<string, { series: string; label: string; start: string; unit: string }> = {
  'EUR/USD': { series: 'DEXUSEU',  label: 'EUR/USD', start: '1999-01-04', unit: 'rate' },
  'GBP/USD': { series: 'DEXUSUK',  label: 'GBP/USD', start: '1971-01-04', unit: 'rate' },
  'USD/JPY': { series: 'DEXJPUS',  label: 'USD/JPY', start: '1971-01-04', unit: 'rate' },
  'USD/CAD': { series: 'DEXCAUS',  label: 'USD/CAD', start: '1971-01-04', unit: 'rate' },
  'USD/CHF': { series: 'DEXSZUS',  label: 'USD/CHF', start: '1971-01-04', unit: 'rate' },
  'AUD/USD': { series: 'DEXUSAL',  label: 'AUD/USD', start: '1971-01-04', unit: 'rate' },
  'USD/CNY': { series: 'DEXCHUS',  label: 'USD/CNY', start: '1981-01-02', unit: 'rate' },
  'USD/KRW': { series: 'DEXKOUS',  label: 'USD/KRW', start: '1981-04-13', unit: 'rate' },
  'USD/MXN': { series: 'DEXMXUS',  label: 'USD/MXN', start: '1993-11-08', unit: 'rate' },
  'USD/BRL': { series: 'DEXBZUS',  label: 'USD/BRL', start: '1995-01-02', unit: 'rate' },
  'USD/INR': { series: 'DEXINUS',  label: 'USD/INR', start: '1973-01-02', unit: 'rate' },
  'USD/SGD': { series: 'DEXSIUS',  label: 'USD/SGD', start: '1981-01-02', unit: 'rate' },
  'USD/ZAR': { series: 'DEXSFUS',  label: 'USD/ZAR', start: '1971-01-04', unit: 'rate' },
};

// Interest Rates & Macro (verified dates)
const MACRO_SERIES: Record<string, { series: string; label: string; start: string; unit: string }> = {
  'US10Y':     { series: 'DGS10',     label: '10-Year Treasury Yield',   start: '1962-01-02', unit: '%' },
  'US2Y':      { series: 'DGS2',      label: '2-Year Treasury Yield',    start: '1976-06-01', unit: '%' },
  'US30Y':     { series: 'DGS30',     label: '30-Year Treasury Yield',   start: '1977-02-15', unit: '%' },
  'FEDFUNDS':  { series: 'FEDFUNDS',  label: 'Federal Funds Rate',       start: '1954-07-01', unit: '%' },
  'CPI':       { series: 'CPIAUCSL',  label: 'Consumer Price Index',     start: '1947-01-01', unit: 'index' },
  'UNRATE':    { series: 'UNRATE',    label: 'Unemployment Rate',        start: '1948-01-01', unit: '%' },
  'WPRIME':    { series: 'WPRIME',    label: 'Bank Prime Loan Rate',     start: '1955-08-10', unit: '%' },
  'VIX':       { series: 'VIXCLS',    label: 'CBOE VIX',                 start: '1990-01-02', unit: 'index' },
  'DXY':       { series: 'DTWEXBGS',  label: 'US Dollar Index (Broad)',  start: '2006-01-02', unit: 'index' },
};

// Combined lookup
const ALL_SERIES: Record<string, { series: string; label: string; start: string; unit: string }> = {
  ...INDEX_SERIES,
  ...COMMODITY_SERIES,
  ...CURRENCY_SERIES,
  ...MACRO_SERIES,
};

// ── Cache (static historical data — long TTL) ──────────────────────

let cache: Record<string, { data: any; ts: number }> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour for historical data

// ── API Handler ────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!FRED_API_KEY) {
    return Response.json({ error: 'FRED_API_KEY not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const rawSeries = searchParams.get('series') || '';
  const startOverride = searchParams.get('start') || '';

  // Resolve to FRED series
  let fredSeries: string;
  let meta: { label: string; start: string; unit: string };

  if (id && ALL_SERIES[id]) {
    fredSeries = ALL_SERIES[id].series;
    meta = ALL_SERIES[id];
  } else if (rawSeries) {
    fredSeries = rawSeries;
    meta = { label: rawSeries, start: '1900-01-01', unit: '' };
  } else {
    // Return available series catalog
    return Response.json({
      indices: Object.entries(INDEX_SERIES).map(([id, s]) => ({ id, ...s })),
      commodities: Object.entries(COMMODITY_SERIES).map(([id, s]) => ({ id, ...s })),
      currencies: Object.entries(CURRENCY_SERIES).map(([id, s]) => ({ id, ...s })),
      macro: Object.entries(MACRO_SERIES).map(([id, s]) => ({ id, ...s })),
    });
  }

  const start = startOverride || meta.start;
  const cacheKey = `fred_${fredSeries}_${start}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return Response.json(cached.data);
  }

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${fredSeries}&observation_start=${start}&api_key=${FRED_API_KEY}&file_type=json&sort_order=asc`;
    const res = await fetch(url);
    if (!res.ok) {
      return Response.json({ error: `FRED API error: ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const observations = json.observations || [];

    const points: { date: string; value: number }[] = [];
    for (const obs of observations) {
      const val = parseFloat(obs.value);
      if (!isNaN(val) && obs.value !== '.') {
        points.push({ date: obs.date, value: val });
      }
    }

    const result = {
      series: fredSeries,
      label: meta.label,
      unit: meta.unit,
      start: points[0]?.date || start,
      end: points[points.length - 1]?.date || '',
      count: points.length,
      points,
    };

    cache[cacheKey] = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: 'Failed to fetch FRED data' }, { status: 500 });
  }
}
