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

const VALID_RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'] as const;

function intervalForRange(range: string): string {
  switch (range) {
    case '1d': return '2m';
    case '5d': return '15m';
    case '1mo': return '1d';
    case '3mo': return '1d';
    case '6mo': return '1d';
    case '1y': return '1d';
    case '5y': return '1wk';
    default: return '1d';
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
