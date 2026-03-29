export const dynamic = 'force-dynamic';

interface QuoteResult {
  id: string;
  label: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
}

const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

async function fetchYahooPrice(ticker: string): Promise<QuoteResult | null> {
  // Yahoo uses - for multi-class tickers
  const yahooTicker = ticker.replace('BRK.B', 'BRK-B').replace('BF.B', 'BF-B');
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?range=1d&interval=1d`;

  for (const base of ['query1', 'query2']) {
    try {
      const res = await fetch(url.replace('query1', base), { headers: YAHOO_HEADERS });
      if (!res.ok) continue;
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta?.regularMarketPrice) continue;
      const price = meta.regularMarketPrice;
      const prev = meta.previousClose || meta.chartPreviousClose || price;
      return {
        id: `YF.STOCK.${ticker}`,
        label: ticker,
        price,
        previousClose: prev,
        change: price - prev,
        changePct: prev ? ((price - prev) / prev) * 100 : 0,
      };
    } catch { continue; }
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get('tickers') || '';
  const tickers = tickersParam.split(',').filter(t => t.length > 0 && t.length <= 10).slice(0, 300);

  if (tickers.length === 0) {
    return Response.json([]);
  }

  // Fetch in parallel batches of 20
  const results: QuoteResult[] = [];
  for (let i = 0; i < tickers.length; i += 20) {
    const batch = tickers.slice(i, i + 20);
    const batchResults = await Promise.all(batch.map(fetchYahooPrice));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return Response.json(results);
}
