import type { Metadata } from 'next';
import { getCountries, getIndicatorForAllCountries, INDICATORS } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';
import HomeTable from '@/components/HomeTable';

export const metadata: Metadata = {
  title: 'Statistics of the World — GDP, Population & Economic Data for 218 Countries (2026)',
  description: 'Compare GDP, population, inflation, unemployment, and 440+ economic indicators for 218 countries. Interactive charts, historical data from IMF & World Bank. Free API.',
  alternates: {
    canonical: 'https://statisticsoftheworld.com',
  },
  openGraph: {
    title: 'Statistics of the World — Every Country, Every Indicator',
    description: '440+ indicators for 218 countries. GDP, population, stock markets, commodities, and more — interactive charts, live data, and free API.',
    url: 'https://statisticsoftheworld.com',
  },
};

async function getHomeData() {
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

  return { countries, stats };
}

export default async function Home() {
  const { countries, stats } = await getHomeData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Statistics of the World — Global Economic Data',
    description: 'Compare GDP, population, inflation, and 440+ indicators for 218 countries.',
    url: 'https://statisticsoftheworld.com',
    mainEntity: {
      '@type': 'Dataset',
      name: 'Global Economic Indicators',
      description: '440+ economic, demographic, health, education, and environmental indicators for 218 countries. Sources: IMF, World Bank, FRED.',
      creator: { '@type': 'Organization', name: 'Statistics of the World' },
      temporalCoverage: '1960/2026',
      spatialCoverage: { '@type': 'Place', name: 'World' },
      license: 'https://statisticsoftheworld.com/terms',
      isAccessibleForFree: true,
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://statisticsoftheworld.com/api-docs',
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
      ],
    },
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <HeroTabs countryCount={countries.length} indicatorCount={INDICATORS.length} />
      <HomeTable countries={countries} stats={stats} />
      <Footer />
    </main>
  );
}
