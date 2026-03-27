import { getCountries, getIndicatorForAllCountries, getAllIndicatorsForCountry } from '@/lib/data';

// Cache the full countries+stats response — data changes at most daily via ETL
let listCache: { data: any; ts: number } | null = null;
const LIST_CACHE_TTL = 30 * 60_000; // 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Single country mode: return all indicators for one country
  if (id) {
    const indicators = await getAllIndicatorsForCountry(id);
    return Response.json({ indicators });
  }

  // Return cached if fresh
  if (listCache && Date.now() - listCache.ts < LIST_CACHE_TTL) {
    return Response.json(listCache.data);
  }

  // List mode: return all countries with summary stats
  const [
    countries,
    gdpData, popData, gdpCapData, lifeExpData,
    inflationData, unemploymentData, debtData, gdpGrowthData,
    tradeData, fdiData,
  ] = await Promise.all([
    getCountries(),
    getIndicatorForAllCountries('IMF.NGDPD'),
    getIndicatorForAllCountries('SP.POP.TOTL'),
    getIndicatorForAllCountries('IMF.NGDPDPC'),
    getIndicatorForAllCountries('SP.DYN.LE00.IN'),
    getIndicatorForAllCountries('IMF.PCPIPCH'),
    getIndicatorForAllCountries('SL.UEM.TOTL.ZS'),
    getIndicatorForAllCountries('IMF.GGXWDG_NGDP'),
    getIndicatorForAllCountries('IMF.NGDP_RPCH'),
    getIndicatorForAllCountries('NE.TRD.GNFS.ZS'),
    getIndicatorForAllCountries('BX.KLT.DINV.WD.GD.ZS'),
  ]);

  // Build stats map
  type Stats = {
    gdp?: number; population?: number; gdpPerCapita?: number; lifeExpectancy?: number;
    inflation?: number; unemployment?: number; debtToGdp?: number; gdpGrowth?: number;
    tradeOpenness?: number; fdi?: number;
  };
  const stats: Record<string, Stats> = {};
  const assign = (data: any[], key: keyof Stats) => {
    for (const d of data) {
      if (!stats[d.countryId]) stats[d.countryId] = {};
      (stats[d.countryId] as any)[key] = d.value ?? undefined;
    }
  };
  assign(gdpData, 'gdp');
  assign(popData, 'population');
  assign(gdpCapData, 'gdpPerCapita');
  assign(lifeExpData, 'lifeExpectancy');
  assign(inflationData, 'inflation');
  assign(unemploymentData, 'unemployment');
  assign(debtData, 'debtToGdp');
  assign(gdpGrowthData, 'gdpGrowth');
  assign(tradeData, 'tradeOpenness');
  assign(fdiData, 'fdi');

  const result = { countries, stats };
  listCache = { data: result, ts: Date.now() };
  return Response.json(result);
}
