import { getCountries, getIndicatorForAllCountries, INDICATORS } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';
import CountriesGrid from '@/components/CountriesGrid';

async function getCountriesData() {
  const [
    countries,
    gdpData, popData, gdpCapData, lifeExpData,
    inflationData, unemploymentData, gdpGrowthData,
  ] = await Promise.all([
    getCountries(),
    getIndicatorForAllCountries('IMF.NGDPD'),
    getIndicatorForAllCountries('SP.POP.TOTL'),
    getIndicatorForAllCountries('IMF.NGDPDPC'),
    getIndicatorForAllCountries('SP.DYN.LE00.IN'),
    getIndicatorForAllCountries('IMF.PCPIPCH'),
    getIndicatorForAllCountries('SL.UEM.TOTL.ZS'),
    getIndicatorForAllCountries('IMF.NGDP_RPCH'),
  ]);

  type Stats = {
    gdp?: number; population?: number; gdpPerCapita?: number; lifeExpectancy?: number;
    inflation?: number; unemployment?: number; gdpGrowth?: number;
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
  assign(gdpGrowthData, 'gdpGrowth');

  const sorted = countries.sort((a, b) => a.name.localeCompare(b.name));
  return { countries: sorted, stats };
}

export default async function CountriesPage() {
  const { countries, stats } = await getCountriesData();

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/countries" countryCount={countries.length} indicatorCount={INDICATORS.length} />
      <CountriesGrid countries={countries} stats={stats} />
      <Footer />
    </main>
  );
}
