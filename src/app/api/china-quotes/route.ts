// Direct Sina Finance API for Chinese commodity futures
// No DB dependency — fetches live from hq.sinajs.cn

const SYMBOLS: Record<string, { id: string; label: string }> = {
  CU0: { id: 'SINA.COPPER', label: 'Copper (SHFE)' },
  AL0: { id: 'SINA.ALUMINUM', label: 'Aluminum (SHFE)' },
  NI0: { id: 'SINA.NICKEL', label: 'Nickel (SHFE)' },
  ZN0: { id: 'SINA.ZINC', label: 'Zinc (SHFE)' },
  SN0: { id: 'SINA.TIN', label: 'Tin (SHFE)' },
  PB0: { id: 'SINA.LEAD', label: 'Lead (SHFE)' },
  RB0: { id: 'SINA.REBAR', label: 'Rebar Steel (SHFE)' },
  SS0: { id: 'SINA.STAINLESS', label: 'Stainless Steel (SHFE)' },
  I0: { id: 'SINA.IRON_ORE_CN', label: 'Iron Ore (DCE)' },
  J0: { id: 'SINA.COKING_COAL', label: 'Coking Coal (DCE)' },
  RU0: { id: 'SINA.RUBBER', label: 'Rubber (SHFE)' },
  P0: { id: 'SINA.PALM_OIL', label: 'Palm Oil (DCE)' },
  MA0: { id: 'SINA.METHANOL', label: 'Methanol (ZCE)' },
  UR0: { id: 'SINA.UREA', label: 'Urea (ZCE)' },
  SA0: { id: 'SINA.SODA_ASH', label: 'Soda Ash (ZCE)' },
  FG0: { id: 'SINA.GLASS', label: 'Glass (ZCE)' },
};

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 25_000; // 25s — ensures every 30s poll gets fresh data

export const dynamic = 'force-dynamic';

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return Response.json(cache.data);
  }

  const symList = Object.keys(SYMBOLS).map(s => `nf_${s}`).join(',');
  const url = `https://hq.sinajs.cn/rn=${Date.now()}&list=${symList}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!res.ok) {
      return Response.json({ error: 'Sina Finance unavailable' }, { status: 502 });
    }

    // Sina returns GBK-encoded text
    const buf = await res.arrayBuffer();
    const raw = new TextDecoder('gbk').decode(buf);

    const quotes: Record<string, {
      id: string;
      label: string;
      price: number;
      previousClose: number;
      change: number;
      changePct: number;
    }> = {};

    for (const line of raw.split('\n')) {
      if (!line.includes('=')) continue;
      const symPart = line.split('=')[0]?.replace('var hq_str_nf_', '').trim();
      const dataPart = line.split('"')[1] || '';
      const fields = dataPart.split(',');

      if (!symPart || !SYMBOLS[symPart] || fields.length < 9) continue;

      const { id, label } = SYMBOLS[symPart];
      const price = parseFloat(fields[6]);
      const prevClose = parseFloat(fields[8]);

      if (!price || price <= 0) continue;

      const change = prevClose > 0 ? price - prevClose : 0;
      const changePct = prevClose > 0 ? ((price / prevClose) - 1) * 100 : 0;

      quotes[id] = {
        id,
        label,
        price: Math.round(price * 100) / 100,
        previousClose: Math.round(prevClose * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePct: Math.round(changePct * 100) / 100,
      };
    }

    const result = { quotes, updatedAt: new Date().toISOString() };
    cache = { data: result, ts: Date.now() };
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Failed to fetch China quotes' }, { status: 500 });
  }
}
