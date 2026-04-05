import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Poorest Countries in the World 2026 — Lowest GDP per Capita',
  description: 'The poorest countries in the world ranked by GDP per capita in 2026. From sub-Saharan Africa to conflict-affected states with GDP per capita under $1,000. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/poorest-countries' },
  openGraph: {
    title: 'Poorest Countries in the World 2026',
    description: 'Countries with the lowest GDP per capita. Source: IMF.',
    siteName: 'Statistics of the World',
  },
};

export default async function PoorestCountriesPage() {
  const rawData = await getIndicatorForAllCountries('IMF.NGDPDPC');
  const data = [...rawData].reverse();
  const year = rawData[0]?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Poorest Countries ${year}`, description: `Countries ranked by lowest GDP per capita. Source: IMF.`, url: 'https://statisticsoftheworld.com/poorest-countries', creator: { '@type': 'Organization', name: 'IMF' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the poorest country in the world?', acceptedAnswer: { '@type': 'Answer', text: `By GDP per capita, ${data[0]?.country} is the poorest country at ${formatValue(data[0]?.value, 'currency')} per person. Most of the world's poorest countries are in sub-Saharan Africa or are affected by conflict. Source: IMF.` } },
      { '@type': 'Question', name: 'Why are some countries so poor?', acceptedAnswer: { '@type': 'Answer', text: 'Extreme poverty is driven by a combination of factors: colonial legacies, weak institutions, corruption, conflict, geographic disadvantages (landlocked, disease-prone climates), rapid population growth outpacing economic growth, and limited access to education and infrastructure.' } },
      { '@type': 'Question', name: 'Is global poverty decreasing?', acceptedAnswer: { '@type': 'Answer', text: 'Global extreme poverty has fallen from 36% in 1990 to under 9% today, driven by China and India\'s growth. However, poverty is concentrating in sub-Saharan Africa, where 60%+ of the world\'s extreme poor now live.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/gdp-per-capita-by-country" className="hover:text-gray-600 transition">GDP per Capita</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Poorest Countries</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Poorest Countries in the World ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Countries ranked from lowest GDP per capita · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The World&apos;s Poorest Nations</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The poorest countries in the world, measured by GDP per capita, are overwhelmingly concentrated in sub-Saharan Africa, with a few conflict-affected states in South Asia and the Middle East. {data[0]?.country} has the lowest GDP per capita at {formatValue(data[0]?.value, 'currency')} — meaning the average economic output per person is less than what a coffee costs daily in wealthy nations. The gap between the <Link href="/richest-countries" className="text-[#0066cc] hover:underline">richest</Link> and poorest countries exceeds 100x.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Several factors keep countries trapped in poverty. Conflict and political instability destroy physical and human capital — South Sudan, Somalia, Syria, and Afghanistan feature prominently on this list. Colonial legacies left many countries with arbitrary borders, extractive institutions, and economies oriented toward commodity export rather than broad-based development. Geographic disadvantages matter: landlocked countries face higher trade costs, and tropical climates carry higher disease burdens that reduce productivity.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Rapid <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population growth</Link> is a critical factor — when the population grows faster than the economy, GDP per capita stagnates or falls even as total GDP rises. Many of the poorest countries have <Link href="/fertility-rate-by-country" className="text-[#0066cc] hover:underline">fertility rates</Link> above 5, meaning their populations will double within a generation, placing enormous strain on education, healthcare, and employment. Breaking the poverty cycle requires simultaneous progress on governance, education, <Link href="/health-spending-by-country" className="text-[#0066cc] hover:underline">health</Link>, infrastructure, and economic diversification.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Poorest countries by GDP per capita in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP per Capita</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/gdp-per-capita`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/richest-countries', label: 'Richest Countries' }, { href: '/poverty-rate-by-country', label: 'Poverty Rate' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/fertility-rate-by-country', label: 'Fertility Rate' }, { href: '/ranking/infant-mortality', label: 'Infant Mortality' }, { href: '/nigeria-economy', label: 'Nigeria Economy' }, { href: '/india-economy', label: 'India Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
