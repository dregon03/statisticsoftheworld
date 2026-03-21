import { getCountries, getIndicatorForAllCountries } from '@/lib/data';

export async function GET() {
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
