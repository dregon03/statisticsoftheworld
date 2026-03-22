import { getCountries, getIndicatorForAllCountries, getAllIndicatorsForCountry } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Single country mode: return all indicators for one country
  if (id) {
    const indicators = await getAllIndicatorsForCountry(id);
    return Response.json({ indicators });
  }

  // List mode: return all countries with summary stats
  const [countries, gdpData, popData, gdpCapData, lifeExpData] = await Promise.all([
    getCountries(),
    getIndicatorForAllCountries('IMF.NGDPD'),
    getIndicatorForAllCountries('SP.POP.TOTL'),
    getIndicatorForAllCountries('IMF.NGDPDPC'),
    getIndicatorForAllCountries('SP.DYN.LE00.IN'),
  ]);

  // Build stats map
  const stats: Record<string, { gdp?: number; population?: number; gdpPerCapita?: number; lifeExpectancy?: number }> = {};
  for (const d of gdpData) { if (!stats[d.countryId]) stats[d.countryId] = {}; stats[d.countryId].gdp = d.value ?? undefined; }
  for (const d of popData) { if (!stats[d.countryId]) stats[d.countryId] = {}; stats[d.countryId].population = d.value ?? undefined; }
  for (const d of gdpCapData) { if (!stats[d.countryId]) stats[d.countryId] = {}; stats[d.countryId].gdpPerCapita = d.value ?? undefined; }
  for (const d of lifeExpData) { if (!stats[d.countryId]) stats[d.countryId] = {}; stats[d.countryId].lifeExpectancy = d.value ?? undefined; }

  return Response.json({ countries, stats });
}
