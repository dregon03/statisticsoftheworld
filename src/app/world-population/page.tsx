import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'World Population 2026 — 8.3 Billion People by Country | Statistics',
  description: 'World population in 2026: 8.3 billion people across 218 countries. India is now #1 most populous. Complete population rankings, growth rates, and demographic data. Source: World Bank & UN Population Division.',
  alternates: { canonical: 'https://statisticsoftheworld.com/world-population' },
  openGraph: {
    title: 'World Population 2026 — 8.3 Billion People by Country',
    description: 'India surpassed China as #1 most populous country. All 218 countries ranked by population with growth rates. Source: World Bank & UN.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/world-population',
    type: 'website',
  },
};

export default async function WorldPopulationPage() {
  const [popData, growthData] = await Promise.all([
    getIndicatorForAllCountries('SP.POP.TOTL'),
    getIndicatorForAllCountries('SP.POP.GROW'),
  ]);

  const worldPop = popData.reduce((s, d) => s + (d.value || 0), 0);
  const year = popData[0]?.year || '2026';
  const avgGrowth = growthData.length > 0 ? growthData.reduce((s, d) => s + (d.value || 0), 0) / growthData.length : 0;

  // Build growth lookup
  const growthMap: Record<string, number | null> = {};
  for (const d of growthData) growthMap[d.countryId] = d.value;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Population Rankings', item: 'https://statisticsoftheworld.com/ranking/population' },
          { '@type': 'ListItem', position: 3, name: 'World Population', item: 'https://statisticsoftheworld.com/world-population' },
        ],
      },
      {
        '@type': 'Dataset',
        name: `World Population by Country ${year}`,
        description: `Population data for ${popData.length} countries in ${year}. Total world population: ${(worldPop / 1e9).toFixed(2)} billion. Source: World Bank, UN Population Division.`,
        url: 'https://statisticsoftheworld.com/world-population',
        creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is the world population in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The world population in ${year} is approximately ${(worldPop / 1e9).toFixed(2)} billion people. India is the most populous country with 1.45 billion people, followed by China at 1.41 billion. Source: World Bank / UN Population Division.` } },
          { '@type': 'Question', name: 'Which country has the largest population?', acceptedAnswer: { '@type': 'Answer', text: `${popData[0]?.country} has the largest population at ${formatValue(popData[0]?.value, 'number')} in ${year}, followed by ${popData[1]?.country} (${formatValue(popData[1]?.value, 'number')}). India surpassed China as the most populous country in 2023, a historic demographic milestone.` } },
          { '@type': 'Question', name: 'Is world population still growing?', acceptedAnswer: { '@type': 'Answer', text: `Yes, but at a slowing rate. World population growth has decelerated from over 2% in the 1960s to about ${avgGrowth.toFixed(1)}% today. Several countries — including Japan, South Korea, China, and much of Eastern Europe — now have shrinking populations. Global population is projected to peak around 10.4 billion in the 2080s before slowly declining.` } },
          { '@type': 'Question', name: 'Which region is driving world population growth?', acceptedAnswer: { '@type': 'Answer', text: 'Sub-Saharan Africa is the primary engine of global population growth. The region has fertility rates well above the global average and is projected to account for more than half of world population growth through 2050. By contrast, Europe, East Asia, and parts of Latin America are experiencing population stagnation or decline, driven by fertility rates below the 2.1 replacement level.' } },
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
          <Link href="/ranking/population" className="hover:text-gray-600 transition">Population Rankings</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">World Population</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">World Population in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          {(worldPop / 1e9).toFixed(2)} billion people across {popData.length} countries · Source: World Bank & UN Population Division · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">World Population</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{(worldPop / 1e9).toFixed(2)}B</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Avg Growth Rate</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avgGrowth.toFixed(2)}%</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Most Populous</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{popData[0]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Population Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The world&apos;s population reached {(worldPop / 1e9).toFixed(2)} billion in {year}, with {popData[0]?.country} ({formatValue(popData[0]?.value, 'number')}) and {popData[1]?.country} ({formatValue(popData[1]?.value, 'number')}) together accounting for over a third of humanity. India surpassed China as the most populous country in 2023, a historic milestone reflecting decades of different fertility and population policies. The top 10 most populous countries contain over 4.4 billion people — more than half the global total.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Global population growth has slowed dramatically from its peak of over 2% annually in the late 1960s to approximately {avgGrowth.toFixed(1)}% today. This deceleration is driven by falling fertility rates across virtually every region — total fertility rates have dropped below replacement level (2.1 children per woman) in all developed countries and many developing ones. Sub-Saharan Africa remains the only region with high fertility, but rates are declining there too. The UN projects global population will peak around 10.4 billion in the 2080s before slowly declining.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Population data is critical for economic analysis because it determines labor force size, consumer market potential, and dependency ratios. Countries experiencing rapid population decline (Japan, South Korea, much of Eastern Europe) face challenges including shrinking workforces and rising pension costs. Countries with growing populations (India, Nigeria, Ethiopia) have the potential for a &quot;demographic dividend&quot; — if they can productively employ their youth. All data sourced from the <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank</a> and <a href="https://population.un.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">UN Population Division</a>.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The most consequential demographic story of 2026 is the divergence between Sub-Saharan Africa and the rest of the world. Africa&apos;s population is growing at roughly 2.5% per year — five times the global average — and Nigeria alone is projected to surpass the United States in population by mid-century. Meanwhile, South Korea posts the world&apos;s lowest fertility rate (below 0.8), Japan&apos;s population has been shrinking since 2010, and China&apos;s workforce is contracting for the first time in modern history. These trends are shaping everything from immigration policy in Europe to <Link href="/military-spending-by-country" className="text-[#0066cc] hover:underline">defense spending</Link> priorities, <Link href="/health-spending-by-country" className="text-[#0066cc] hover:underline">healthcare system</Link> capacity, and long-run <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">economic growth</Link> trajectories.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Population by Country ({year})</h2>
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Population by country in {year}. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Population</th>
                  <th scope="col" className="px-4 py-2.5 text-right">% of World</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth</th>
                </tr>
              </thead>
              <tbody>
                {popData.slice(0, 30).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`${getCleanCountryUrl(d.countryId)}/population`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'number')}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-[#64748b]">{((d.value || 0) / worldPop * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-right text-[13px]">
                      <span className={growthMap[d.countryId] != null ? (growthMap[d.countryId]! >= 0 ? 'text-green-600' : 'text-red-500') : 'text-[#94a3b8]'}>
                        {growthMap[d.countryId] != null ? `${growthMap[d.countryId]! >= 0 ? '+' : ''}${growthMap[d.countryId]!.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/ranking/population" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {popData.length} countries →</Link>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/population', label: 'Population Rankings' },
              { href: '/ranking/population-growth', label: 'Population Growth' },
              { href: '/ranking/fertility-rate', label: 'Fertility Rate' },
              { href: '/ranking/life-expectancy', label: 'Life Expectancy' },
              { href: '/ranking/population-over-65', label: 'Aging Population' },
              { href: '/ranking/population-under-15', label: 'Young Population' },
              { href: '/ranking/urban-population', label: 'Urbanization' },
              { href: '/ranking/net-migration', label: 'Net Migration' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/ranking/gdp', label: 'GDP Rankings' },
              { href: '/countries', label: 'All Countries' },
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
