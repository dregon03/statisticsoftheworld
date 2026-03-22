import { NextResponse } from 'next/server';

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

interface CacheEntry {
  data: any;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

async function fetchComtrade(reporterCode: number, flowCode: string, cmdLevel: string): Promise<any[]> {
  const cacheKey = `${reporterCode}-${flowCode}-${cmdLevel}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.data;
  }

  // cmdLevel: 'TOTAL' for partners, 'AG2' for HS 2-digit commodities
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterCode}&period=2023&flowCode=${flowCode}&cmdCode=${cmdLevel}&includeDesc=true`;

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'SOTW/1.0' },
    });
    if (!resp.ok) return [];

    const json = await resp.json();
    const data = json.data || [];
    cache.set(cacheKey, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return cached?.data || [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('country') || 'USA';

  const reporterCode = COUNTRY_CODES[countryId];
  if (!reporterCode) {
    return NextResponse.json({ error: `Country ${countryId} not supported for trade data` }, { status: 400 });
  }

  // Fetch exports and imports in parallel
  const [exportPartners, importPartners, exportCommodities, importCommodities] = await Promise.all([
    fetchComtrade(reporterCode, 'X', 'TOTAL'),
    fetchComtrade(reporterCode, 'M', 'TOTAL'),
    fetchComtrade(reporterCode, 'X', 'AG2'),
    fetchComtrade(reporterCode, 'M', 'AG2'),
  ]);

  // Process partners
  const processPartners = (data: any[]) =>
    data
      .filter((r: any) => r.partnerCode !== 0)
      .sort((a: any, b: any) => (b.primaryValue || 0) - (a.primaryValue || 0))
      .slice(0, 15)
      .map((r: any) => ({
        name: r.partnerDesc || `Partner ${r.partnerCode}`,
        iso: r.partnerISO || '',
        value: r.primaryValue || 0,
      }));

  // Process commodities
  const processCommodities = (data: any[]) =>
    data
      .sort((a: any, b: any) => (b.primaryValue || 0) - (a.primaryValue || 0))
      .slice(0, 15)
      .map((r: any) => ({
        code: r.cmdCode || '',
        name: (r.cmdDesc || '').split(';')[0].trim(), // Shorten long descriptions
        value: r.primaryValue || 0,
      }));

  // Total exports/imports
  const totalExports = exportPartners.find((r: any) => r.partnerCode === 0)?.primaryValue ||
    exportPartners.reduce((sum: number, r: any) => sum + (r.primaryValue || 0), 0);
  const totalImports = importPartners.find((r: any) => r.partnerCode === 0)?.primaryValue ||
    importPartners.reduce((sum: number, r: any) => sum + (r.primaryValue || 0), 0);

  return NextResponse.json({
    countryId,
    year: 2023,
    totalExports,
    totalImports,
    tradeBalance: totalExports - totalImports,
    topExportPartners: processPartners(exportPartners),
    topImportPartners: processPartners(importPartners),
    topExportCommodities: processCommodities(exportCommodities),
    topImportCommodities: processCommodities(importCommodities),
    source: 'UN COMTRADE',
    availableCountries: Object.keys(COUNTRY_CODES).sort(),
  });
}
