import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const COMTRADE_KEY = process.env.COMTRADE_API_KEY || '';
const V2_BASE = 'https://comtradeapi.un.org/data/v1/get/C/A/HS';

// ISO3 → COMTRADE numeric reporter code
const COUNTRY_CODES: Record<string, number> = {
  USA: 842, CAN: 124, GBR: 826, DEU: 276, FRA: 250, JPN: 392, CHN: 156,
  IND: 356, BRA: 76, MEX: 484, KOR: 410, AUS: 36, ITA: 380, ESP: 724,
  NLD: 528, CHE: 756, SWE: 752, NOR: 578, DNK: 208, FIN: 246,
  AUT: 40, BEL: 56, PRT: 620, IRL: 372, POL: 616, RUS: 643,
  ZAF: 710, TUR: 792, ISR: 376, SAU: 682, ARE: 784,
  SGP: 702, IDN: 360, THA: 764, MYS: 458, PHL: 608, VNM: 704,
  NZL: 554, ARG: 32, CHL: 152, COL: 170, PER: 604,
  EGY: 818, NGA: 566, KEN: 404, MAR: 504, GHA: 288,
  HKG: 344, TWN: 490, PAK: 586, BGD: 50, LKA: 144,
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchFromCache(countryId: string) {
  const { data } = await supabase
    .from('sotw_trade_cache')
    .select('data, updated_at')
    .eq('country_id', countryId)
    .single();
  return data;
}

async function fetchLiveV2(reporterCode: number, cmdCode: string): Promise<any[]> {
  if (!COMTRADE_KEY) return [];
  const url = `${V2_BASE}?reporterCode=${reporterCode}&period=2024,2023&flowCode=X,M&cmdCode=${cmdCode}&includeDesc=true&subscription-key=${COMTRADE_KEY}`;
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'SOTW/2.0' } });
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch {
    return [];
  }
}

function processRecords(records: any[]) {
  if (!records.length) return null;

  const years = new Set(records.map((r: any) => r.refYear || r.period));
  const year = Math.max(...Array.from(years).map(Number));
  const latest = records.filter((r: any) => (r.refYear || r.period) === year);

  const exports = latest.filter((r: any) => r.flowCode === 'X');
  const imports = latest.filter((r: any) => r.flowCode === 'M');

  let totalExports = exports.filter((r: any) => r.partnerCode === 0).reduce((s: number, r: any) => s + (r.primaryValue || 0), 0);
  let totalImports = imports.filter((r: any) => r.partnerCode === 0).reduce((s: number, r: any) => s + (r.primaryValue || 0), 0);
  if (!totalExports) totalExports = exports.filter((r: any) => r.partnerCode !== 0).reduce((s: number, r: any) => s + (r.primaryValue || 0), 0);
  if (!totalImports) totalImports = imports.filter((r: any) => r.partnerCode !== 0).reduce((s: number, r: any) => s + (r.primaryValue || 0), 0);

  const topPartners = (flow: any[]) => flow
    .filter((r: any) => r.partnerCode !== 0 && r.primaryValue)
    .sort((a: any, b: any) => (b.primaryValue || 0) - (a.primaryValue || 0))
    .slice(0, 15)
    .map((r: any) => ({ name: r.partnerDesc || `Partner ${r.partnerCode}`, iso: r.partnerISO || '', value: r.primaryValue || 0 }));

  return { year, totalExports, totalImports, tradeBalance: totalExports - totalImports, topExportPartners: topPartners(exports), topImportPartners: topPartners(imports) };
}

function processCommodities(records: any[]) {
  if (!records.length) return { topExportCommodities: [], topImportCommodities: [] };

  const years = new Set(records.map((r: any) => r.refYear || r.period));
  const year = Math.max(...Array.from(years).map(Number));
  const latest = records.filter((r: any) => (r.refYear || r.period) === year);

  const topCmds = (flow: any[]) => flow
    .filter((r: any) => r.primaryValue)
    .sort((a: any, b: any) => (b.primaryValue || 0) - (a.primaryValue || 0))
    .slice(0, 15)
    .map((r: any) => ({ code: r.cmdCode || '', name: (r.cmdDesc || '').split(';')[0].trim().slice(0, 60), value: r.primaryValue || 0 }));

  return {
    topExportCommodities: topCmds(latest.filter((r: any) => r.flowCode === 'X')),
    topImportCommodities: topCmds(latest.filter((r: any) => r.flowCode === 'M')),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('country') || 'USA';

  const reporterCode = COUNTRY_CODES[countryId];
  if (!reporterCode) {
    return NextResponse.json({ error: `Country ${countryId} not supported for trade data` }, { status: 400 });
  }

  // 1. Try Supabase cache first
  try {
    const cached = await fetchFromCache(countryId);
    if (cached?.data) {
      return NextResponse.json({
        countryId,
        ...cached.data,
        source: 'UN COMTRADE (cached)',
        availableCountries: Object.keys(COUNTRY_CODES).sort(),
      });
    }
  } catch { /* fall through to live */ }

  // 2. Fall back to live COMTRADE v2 API
  const [partnerRecords, commodityRecords] = await Promise.all([
    fetchLiveV2(reporterCode, 'TOTAL'),
    fetchLiveV2(reporterCode, 'AG2'),
  ]);

  const tradeData = processRecords(partnerRecords);
  const commodities = processCommodities(commodityRecords);

  if (!tradeData) {
    return NextResponse.json({ error: 'No trade data available', countryId }, { status: 404 });
  }

  return NextResponse.json({
    countryId,
    ...tradeData,
    ...commodities,
    source: 'UN COMTRADE',
    availableCountries: Object.keys(COUNTRY_CODES).sort(),
  });
}
