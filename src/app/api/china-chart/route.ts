// Sina Finance kline API for Chinese commodity futures charts
// Returns OHLC data for various time ranges

const SINA_SYMBOLS: Record<string, string> = {
  'SINA.COPPER': 'CU0',
  'SINA.ALUMINUM': 'AL0',
  'SINA.NICKEL': 'NI0',
  'SINA.ZINC': 'ZN0',
  'SINA.TIN': 'SN0',
  'SINA.LEAD': 'PB0',
  'SINA.REBAR': 'RB0',
  'SINA.STAINLESS': 'SS0',
  'SINA.IRON_ORE_CN': 'I0',
  'SINA.COKING_COAL': 'J0',
  'SINA.RUBBER': 'RU0',
  'SINA.PALM_OIL': 'P0',
  'SINA.METHANOL': 'MA0',
  'SINA.UREA': 'UR0',
  'SINA.SODA_ASH': 'SA0',
  'SINA.GLASS': 'FG0',
};

// Sina kline API: different endpoints for intraday vs daily
// Daily: https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_X=/InnerFuturesNewService.getDailyKLine?symbol=CU0
// Intraday (5min): https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_X=/InnerFuturesNewService.getFewMinLine?symbol=CU0&type=5

const VALID_RANGES = ['1d', '5d', '1mo', '3mo', '6mo', 'ytd', '1y', '2y', '5y', '10y', 'max'] as const;

let cache: Record<string, { data: any; ts: number }> = {};
function cacheTtl(range: string): number {
  if (range === '1d') return 25_000; // 25s — ensures every 30s poll gets fresh data
  if (range === '5d') return 2 * 60_000;
  return 5 * 60_000;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';
  const range = searchParams.get('range') || '1y';

  const sinaSym = SINA_SYMBOLS[id];
  if (!sinaSym) {
    return Response.json({ error: 'Unknown commodity' }, { status: 400 });
  }
  if (!VALID_RANGES.includes(range as any)) {
    return Response.json({ error: 'Invalid range' }, { status: 400 });
  }

  const cacheKey = `china_${id}_${range}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < cacheTtl(range)) {
    return Response.json(cached.data);
  }

  try {
    let result;
    if (range === '1d') {
      result = await fetchIntraday(sinaSym, 5); // 5-min candles
    } else if (range === '5d') {
      result = await fetchIntraday(sinaSym, 15); // 15-min candles, more data
    } else {
      result = await fetchDaily(sinaSym, range);
    }

    cache[cacheKey] = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}

async function fetchIntraday(symbol: string, minutes: number) {
  // Sina intraday kline API
  const url = `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_data=/InnerFuturesNewService.getFewMinLine?symbol=${symbol}&type=${minutes}`;

  const res = await fetch(url, {
    headers: {
      'Referer': 'https://finance.sina.com.cn',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const text = await res.text();
  // Response is JSONP: var _data=([{...}, ...])
  // Response format: /*<script>...</script>*/\nvar _data=([...])
  const jsonStr = text.replace(/^[\s\S]*?var\s+\w+=\(/, '').replace(/\);?\s*$/, '');
  const data = JSON.parse(jsonStr);

  const points: { date: string; value: number }[] = [];
  for (const item of data) {
    const close = parseFloat(item.c || item.close);
    if (!close || isNaN(close)) continue;
    // item.d = "2026-03-26 10:05:00"
    const dateStr = item.d || item.date || '';
    const timePart = dateStr.split(' ')[1] || '';
    const datePart = dateStr.split(' ')[0] || '';
    const d = new Date(dateStr);
    points.push({
      date: d.toLocaleString('en-US', { timeZone: 'Asia/Shanghai', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      value: Math.round(close * 100) / 100,
    });
  }

  // Get previous close from first point's open or use meta
  const prevClose = data.length > 0 ? parseFloat(data[0].o || data[0].open) : null;
  const lastPrice = points.length > 0 ? points[points.length - 1].value : null;
  const change = (lastPrice != null && prevClose != null) ? lastPrice - prevClose : null;
  const changePct = (change != null && prevClose) ? (change / prevClose) * 100 : null;

  return {
    points,
    regularMarketPrice: lastPrice,
    previousClose: prevClose,
    regularMarketChange: change != null ? Math.round(change * 100) / 100 : null,
    regularMarketChangePercent: changePct != null ? Math.round(changePct * 100) / 100 : null,
    currency: 'CNY',
  };
}

async function fetchDaily(symbol: string, range: string) {
  const url = `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_data=/InnerFuturesNewService.getDailyKLine?symbol=${symbol}`;

  const res = await fetch(url, {
    headers: {
      'Referer': 'https://finance.sina.com.cn',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const text = await res.text();
  // Response format: /*<script>...</script>*/\nvar _data=([...])
  const jsonStr = text.replace(/^[\s\S]*?var\s+\w+=\(/, '').replace(/\);?\s*$/, '');
  const data: any[] = JSON.parse(jsonStr);

  // Filter by range
  const now = new Date();
  let cutoff: Date;
  switch (range) {
    case '1mo': cutoff = new Date(now.getTime() - 30 * 86400000); break;
    case '3mo': cutoff = new Date(now.getTime() - 90 * 86400000); break;
    case '6mo': cutoff = new Date(now.getTime() - 180 * 86400000); break;
    case '1y': cutoff = new Date(now.getTime() - 365 * 86400000); break;
    case '5y': cutoff = new Date(now.getTime() - 5 * 365 * 86400000); break;
    case 'max': cutoff = new Date(0); break;
    default: cutoff = new Date(now.getTime() - 365 * 86400000);
  }

  const points: { date: string; value: number }[] = [];
  for (const item of data) {
    const dateStr = item.d || item.date || '';
    const close = parseFloat(item.c || item.close);
    if (!close || isNaN(close)) continue;
    const d = new Date(dateStr);
    if (d < cutoff) continue;
    points.push({
      date: dateStr.slice(0, 10), // YYYY-MM-DD
      value: Math.round(close * 100) / 100,
    });
  }

  const lastPrice = points.length > 0 ? points[points.length - 1].value : null;
  const firstPrice = points.length > 0 ? points[0].value : null;
  const prevClose = points.length > 1 ? points[points.length - 2].value : firstPrice;
  const change = (lastPrice != null && prevClose != null) ? lastPrice - prevClose : null;
  const changePct = (change != null && prevClose) ? (change / prevClose) * 100 : null;

  return {
    points,
    regularMarketPrice: lastPrice,
    previousClose: prevClose,
    regularMarketChange: change != null ? Math.round(change * 100) / 100 : null,
    regularMarketChangePercent: changePct != null ? Math.round(changePct * 100) / 100 : null,
    currency: 'CNY',
  };
}
