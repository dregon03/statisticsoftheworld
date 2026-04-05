import type { Metadata } from 'next';
import Link from 'next/link';
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
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Statistics of the World — Global Economic Data',
        description: 'Compare GDP, population, inflation, and 440+ indicators for 218 countries.',
        url: 'https://statisticsoftheworld.com',
      },
      {
        '@type': 'Dataset',
        name: 'Global Economic Indicators — 440+ Metrics for 218 Countries',
        description: '440+ economic, demographic, health, education, and environmental indicators for 218 countries covering 1960–2026. Updated weekly with data from IMF World Economic Outlook, World Bank World Development Indicators, WHO Global Health Observatory, FRED, and United Nations.',
        url: 'https://statisticsoftheworld.com',
        creator: [
          { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' },
          { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' },
          { '@type': 'Organization', name: 'WHO', url: 'https://www.who.int' },
          { '@type': 'Organization', name: 'FRED', url: 'https://fred.stlouisfed.org' },
          { '@type': 'Organization', name: 'United Nations', url: 'https://www.un.org' },
        ],
        provider: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        temporalCoverage: '1960/2026',
        spatialCoverage: { '@type': 'Place', name: 'World' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: 'https://statisticsoftheworld.com/api/v2/country/USA',
        },
        keywords: ['GDP', 'population', 'inflation', 'unemployment', 'economic data', 'country statistics', 'IMF', 'World Bank', 'macroeconomics'],
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What economic data does Statistics of the World provide?',
            acceptedAnswer: { '@type': 'Answer', text: `Statistics of the World provides ${INDICATORS.length}+ economic, demographic, health, and environmental indicators for ${countries.length} countries. Data is sourced from the IMF World Economic Outlook, World Bank World Development Indicators, WHO Global Health Observatory, FRED, and United Nations. All data is free to access with no login required.` },
          },
          {
            '@type': 'Question',
            name: 'How often is the data updated?',
            acceptedAnswer: { '@type': 'Answer', text: 'Macroeconomic data from the IMF and World Bank is updated weekly as new releases become available. Financial market data (stock indices, commodities, currencies) is updated daily during trading hours. The IMF World Economic Outlook is published biannually in April and October with comprehensive revisions.' },
          },
          {
            '@type': 'Question',
            name: 'Is there a free API for economic data?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. Statistics of the World offers a free REST API that returns JSON data for all countries and indicators. No authentication is required for up to 100 requests per day. Free API keys are available for higher rate limits (1,000 requests/day). Documentation is available at statisticsoftheworld.com/api-docs.' },
          },
          {
            '@type': 'Question',
            name: 'Where does the GDP data come from?',
            acceptedAnswer: { '@type': 'Answer', text: 'GDP data comes from the IMF World Economic Outlook (WEO), which is the most authoritative source for cross-country GDP comparisons. The IMF collects data from national statistical agencies worldwide and publishes harmonized estimates and projections. World Bank GDP data (from the World Development Indicators) is also available as a complementary source.' },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        ],
      },
    ],
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

      {/* SEO content section — crawlable text for Google */}
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-6">Global Economic Data — Free Access to 440+ Indicators</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-[#0d1b2a]">Comprehensive Country Statistics</h3>
            <p className="text-[15px] text-[#374151] leading-[1.8]">
              Statistics of the World aggregates economic, demographic, health, education, and environmental data for {countries.length} countries from the world&apos;s most authoritative sources: the IMF World Economic Outlook, World Bank World Development Indicators, WHO Global Health Observatory, FRED (Federal Reserve Economic Data), and United Nations. Our database covers {INDICATORS.length}+ indicators with historical data going back to 1960 for many series.
            </p>
            <p className="text-[15px] text-[#374151] leading-[1.8]">
              Every data point is sourced directly from official international organizations — we do not estimate, interpolate, or generate data. When the IMF publishes new GDP projections or the World Bank updates its development indicators, our database reflects those changes within days. All data is free to access, free to use with attribution, and available through our public API.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-[#0d1b2a]">How to Use This Platform</h3>
            <p className="text-[15px] text-[#374151] leading-[1.8]">
              Start by selecting a country to see its full economic profile — GDP, population, inflation, unemployment, government debt, life expectancy, and hundreds more indicators with interactive charts and historical trends. Use the rankings pages to compare countries on any indicator: which country has the highest GDP, the lowest unemployment, or the most CO₂ emissions per capita.
            </p>
            <p className="text-[15px] text-[#374151] leading-[1.8]">
              The comparison tool lets you put two countries side by side across all major indicators. For developers and researchers, our free API provides programmatic access to all data in JSON format — no authentication required for basic usage, with higher rate limits available through free API keys.
            </p>
          </div>
        </div>

        {/* Quick links to top ranking pages */}
        <div className="mb-10">
          <h3 className="text-[18px] font-semibold text-[#0d1b2a] mb-4">Popular Rankings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { href: '/ranking/gdp', label: 'GDP by Country' },
              { href: '/ranking/gdp-per-capita', label: 'GDP per Capita' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth Rate' },
              { href: '/ranking/population', label: 'Population' },
              { href: '/ranking/inflation-rate', label: 'Inflation Rate' },
              { href: '/ranking/unemployment-rate', label: 'Unemployment' },
              { href: '/ranking/life-expectancy', label: 'Life Expectancy' },
              { href: '/ranking/government-debt', label: 'Government Debt' },
              { href: '/ranking/co2-emissions', label: 'CO₂ Emissions' },
              { href: '/ranking/homicide-rate', label: 'Homicide Rate' },
            ].map(r => (
              <Link key={r.href} href={r.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Data sources section */}
        <div className="mb-10">
          <h3 className="text-[18px] font-semibold text-[#0d1b2a] mb-4">Our Data Sources</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'IMF World Economic Outlook', desc: 'GDP, inflation, unemployment, government debt, and current account data for 193 countries. Updated biannually.', url: 'https://www.imf.org/en/Publications/WEO' },
              { name: 'World Bank WDI', desc: '300+ development indicators covering health, education, environment, infrastructure, trade, and governance.', url: 'https://data.worldbank.org' },
              { name: 'WHO Global Health Observatory', desc: 'Health indicators including life expectancy, mortality rates, disease prevalence, and healthcare spending.', url: 'https://www.who.int/data/gho' },
              { name: 'FRED (Federal Reserve)', desc: 'US economic data including interest rates, bond yields, money supply, and Treasury securities.', url: 'https://fred.stlouisfed.org' },
              { name: 'United Nations', desc: 'Population data, demographic projections, trade statistics, and development indicators.', url: 'https://data.un.org' },
              { name: 'Yahoo Finance', desc: 'Real-time stock market indices, commodity prices, currency exchange rates, and cryptocurrency data.', url: 'https://finance.yahoo.com' },
            ].map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="border border-[#d5dce6] rounded-lg p-4 hover:border-[#b0bdd0] hover:bg-white transition block">
                <div className="text-[14px] font-semibold text-[#0d1b2a] mb-1">{s.name} ↗</div>
                <div className="text-[13px] text-[#64748b] leading-relaxed">{s.desc}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Economy overviews — new landing pages */}
        <div className="mb-10">
          <h3 className="text-[18px] font-semibold text-[#0d1b2a] mb-4">Economy Overviews</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/world-economy', label: 'World Economy 2026' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/india-economy', label: 'India Economy' },
              { href: '/japan-economy', label: 'Japan Economy' },
              { href: '/germany-economy', label: 'Germany Economy' },
              { href: '/uk-economy', label: 'UK Economy' },
              { href: '/france-economy', label: 'France Economy' },
              { href: '/brazil-economy', label: 'Brazil Economy' },
              { href: '/south-korea-economy', label: 'South Korea Economy' },
              { href: '/italy-economy', label: 'Italy Economy' },
              { href: '/mexico-economy', label: 'Mexico Economy' },
              { href: '/indonesia-economy', label: 'Indonesia Economy' },
              { href: '/saudi-arabia-economy', label: 'Saudi Arabia Economy' },
              { href: '/nigeria-economy', label: 'Nigeria Economy' },
              { href: '/g7-economy', label: 'G7 Economy' },
              { href: '/g20-economy', label: 'G20 Economy' },
              { href: '/brics-economy', label: 'BRICS Economy' },
              { href: '/eu-economy', label: 'EU Economy' },
              { href: '/asean-economy', label: 'ASEAN Economy' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' },
              { href: '/gdp-growth-by-country', label: 'GDP Growth' },
              { href: '/inflation-by-country', label: 'Inflation by Country' },
              { href: '/unemployment-by-country', label: 'Unemployment' },
              { href: '/population-by-country', label: 'Population' },
              { href: '/debt-by-country', label: 'Debt by Country' },
              { href: '/life-expectancy-by-country', label: 'Life Expectancy' },
              { href: '/co2-emissions-by-country', label: 'CO2 Emissions' },
              { href: '/military-spending-by-country', label: 'Military Spending' },
              { href: '/corruption-by-country', label: 'Corruption Index' },
              { href: '/world-population', label: 'World Population' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Popular comparisons */}
        <div>
          <h3 className="text-[18px] font-semibold text-[#0d1b2a] mb-4">Popular Country Comparisons</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-china', label: 'US vs China' },
              { href: '/compare/united-states-vs-japan', label: 'US vs Japan' },
              { href: '/compare/china-vs-india', label: 'China vs India' },
              { href: '/compare/germany-vs-france', label: 'Germany vs France' },
              { href: '/compare/united-states-vs-india', label: 'US vs India' },
              { href: '/compare/japan-vs-south-korea', label: 'Japan vs S. Korea' },
              { href: '/compare/united-kingdom-vs-france', label: 'UK vs France' },
              { href: '/compare/brazil-vs-mexico', label: 'Brazil vs Mexico' },
            ].map(c => (
              <Link key={c.href} href={c.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
