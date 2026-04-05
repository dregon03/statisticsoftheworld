import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'World Economy 2026 — Global GDP, Growth, Inflation & Key Statistics',
  description: 'The world economy in 2026: $110+ trillion GDP, 8.3 billion people, and the data that defines the year. GDP rankings, growth rates, inflation, unemployment, and debt across 218 countries. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/world-economy' },
  openGraph: {
    title: 'World Economy 2026 — Global GDP, Growth & Key Statistics',
    description: 'The global economy in numbers: GDP, growth, inflation, unemployment for 218 countries.',
    siteName: 'Statistics of the World',
  },
};

export default async function WorldEconomyPage() {
  const [gdpData, growthData, inflData, unempData, popData, debtData, lifeData] = await Promise.all([
    getIndicatorForAllCountries('IMF.NGDPD'),
    getIndicatorForAllCountries('IMF.NGDP_RPCH'),
    getIndicatorForAllCountries('IMF.PCPIPCH'),
    getIndicatorForAllCountries('IMF.LUR'),
    getIndicatorForAllCountries('SP.POP.TOTL'),
    getIndicatorForAllCountries('IMF.GGXWDG_NGDP'),
    getIndicatorForAllCountries('SP.DYN.LE00.IN'),
  ]);

  const worldGdp = gdpData.reduce((s, d) => s + (d.value || 0), 0);
  const worldPop = popData.reduce((s, d) => s + (d.value || 0), 0);
  const avgGrowth = growthData.length > 0 ? growthData.reduce((s, d) => s + (d.value || 0), 0) / growthData.length : 0;
  const avgInfl = inflData.length > 0 ? inflData.reduce((s, d) => s + (d.value || 0), 0) / inflData.length : 0;
  const year = gdpData[0]?.year || 2026;

  const top10Gdp = gdpData.slice(0, 10);
  const top10Growth = growthData.slice(0, 10);
  const top5Infl = inflData.slice(0, 5);
  const top5Debt = debtData.slice(0, 5);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `World Economy ${year} — Global GDP, Growth & Key Statistics`,
        description: `Overview of the global economy in ${year}: $${(worldGdp / 1e12).toFixed(0)}T GDP, ${(worldPop / 1e9).toFixed(1)}B people.`,
        datePublished: `${year}-01-01`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is the world GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The world GDP in ${year} is approximately $${(worldGdp / 1e12).toFixed(0)} trillion (nominal USD), according to IMF World Economic Outlook data. The United States is the largest economy at ${formatValue(top10Gdp[0]?.value, 'currency')}, followed by China at ${formatValue(top10Gdp[1]?.value, 'currency')}.` } },
          { '@type': 'Question', name: `What is the world population in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The world population in ${year} is approximately ${(worldPop / 1e9).toFixed(2)} billion people. India is the most populous country, followed by China.` } },
          { '@type': 'Question', name: `Which country has the highest GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${top10Gdp[0]?.country} has the highest GDP at ${formatValue(top10Gdp[0]?.value, 'currency')} in ${year}, followed by ${top10Gdp[1]?.country} (${formatValue(top10Gdp[1]?.value, 'currency')}) and ${top10Gdp[2]?.country} (${formatValue(top10Gdp[2]?.value, 'currency')}). Source: IMF World Economic Outlook.` } },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">World Economy</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The World Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          A data-driven overview of the global economy · Source: IMF World Economic Outlook & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">World GDP</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">${(worldGdp / 1e12).toFixed(0)}T</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">World Population</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{(worldPop / 1e9).toFixed(2)}B</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Avg GDP Growth</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avgGrowth.toFixed(1)}%</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Avg Inflation</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avgInfl.toFixed(1)}%</div>
          </div>
        </div>

        {/* Editorial */}
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The global economy in {year} is worth over ${(worldGdp / 1e12).toFixed(0)} trillion in nominal GDP, supporting a population of {(worldPop / 1e9).toFixed(2)} billion people across 218 countries. Economic output remains heavily concentrated: the United States ({formatValue(top10Gdp[0]?.value, 'currency')}) and China ({formatValue(top10Gdp[1]?.value, 'currency')}) together account for over 40% of world GDP. The top 10 economies produce roughly two-thirds of all global output, while the remaining 200+ countries share the rest.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Global growth averages approximately {avgGrowth.toFixed(1)}%, though this masks enormous variation. Advanced economies typically grow at 1–3%, while emerging markets in South and Southeast Asia post growth rates of 5–7%. Inflation has moderated from the post-pandemic highs of 2022–2023 but remains above central bank targets in many countries, averaging {avgInfl.toFixed(1)}% across all economies. The divergence between fast-growing emerging markets and slower advanced economies continues to reshape the global economic landscape.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            All data on this page is sourced from the IMF World Economic Outlook and World Bank World Development Indicators — the two most authoritative sources for international economic statistics. Data is updated as new releases become available, typically biannually for IMF data and annually for World Bank indicators.
          </p>
        </div>

        {/* Top 10 GDP */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Top 10 Economies by GDP ({year})</h2>
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Top 10 countries by GDP in {year}. Source: IMF World Economic Outlook.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP (USD)</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {top10Gdp.map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/country/${d.countryId}`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-[#64748b]">{((d.value || 0) / worldGdp * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right">
            <Link href="/ranking/gdp" className="text-[13px] text-[#0066cc] hover:underline">View all 218 countries →</Link>
          </div>
        </div>

        {/* Fastest growing */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Fastest Growing Economies ({year})</h2>
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {top10Growth.map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/country/${d.countryId}`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px] text-green-600">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right">
            <Link href="/ranking/gdp-growth" className="text-[13px] text-[#0066cc] hover:underline">View all growth rates →</Link>
          </div>
        </div>

        {/* Explore more */}
        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Explore the Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/largest-economies', label: 'Largest Economies' },
              { href: '/richest-countries', label: 'Richest Countries' },
              { href: '/poorest-countries', label: 'Poorest Countries' },
              { href: '/most-populous-countries', label: 'Most Populous' },
              { href: '/safest-countries', label: 'Safest Countries' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' },
              { href: '/gdp-growth-by-country', label: 'GDP Growth' },
              { href: '/inflation-by-country', label: 'Inflation Rates' },
              { href: '/unemployment-by-country', label: 'Unemployment' },
              { href: '/population-by-country', label: 'Population' },
              { href: '/debt-by-country', label: 'Govt Debt' },
              { href: '/life-expectancy-by-country', label: 'Life Expectancy' },
              { href: '/co2-emissions-by-country', label: 'CO2 Emissions' },
              { href: '/corruption-by-country', label: 'Corruption Index' },
              { href: '/military-spending-by-country', label: 'Military Spending' },
              { href: '/g7-economy', label: 'G7 Economy' },
              { href: '/g20-economy', label: 'G20 Economy' },
              { href: '/brics-economy', label: 'BRICS Economy' },
              { href: '/eu-economy', label: 'EU Economy' },
              { href: '/asean-economy', label: 'ASEAN Economy' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/india-economy', label: 'India Economy' },
              { href: '/world-population', label: 'World Population' },
              { href: '/compare/united-states-vs-china', label: 'US vs China' },
              { href: '/compare/china-vs-india', label: 'China vs India' },
              { href: '/countries', label: 'All 218 Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
