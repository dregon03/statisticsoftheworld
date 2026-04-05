import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GDP by Country 2026 — Ranked List of All 218 Economies',
  description: 'GDP by country in 2026: complete ranking of 218 countries by nominal GDP in US dollars. From the United States ($29T+) to Tuvalu. Source: IMF World Economic Outlook.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gdp-by-country' },
  openGraph: {
    title: 'GDP by Country 2026 — Complete World Rankings',
    description: 'All 218 countries ranked by GDP (nominal USD). Source: IMF World Economic Outlook.',
    siteName: 'Statistics of the World',
  },
};

export default async function GdpByCountryPage() {
  const gdpData = await getIndicatorForAllCountries('IMF.NGDPD');
  const worldGdp = gdpData.reduce((s, d) => s + (d.value || 0), 0);
  const year = gdpData[0]?.year || '2026';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        name: `GDP by Country ${year} — World Rankings`,
        description: `Nominal GDP for ${gdpData.length} countries in ${year}, ranked from largest to smallest. Total world GDP: $${(worldGdp / 1e12).toFixed(0)} trillion. Source: IMF World Economic Outlook.`,
        url: 'https://statisticsoftheworld.com/gdp-by-country',
        creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'ItemList',
        numberOfItems: gdpData.length,
        itemListElement: gdpData.slice(0, 20).map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${d.country} — ${formatValue(d.value, 'currency')}`,
          url: `https://statisticsoftheworld.com${getCleanCountryUrl(d.countryId)}/gdp`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `Which country has the highest GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${gdpData[0]?.country} has the highest GDP at ${formatValue(gdpData[0]?.value, 'currency')} in ${year}, followed by ${gdpData[1]?.country} (${formatValue(gdpData[1]?.value, 'currency')}) and ${gdpData[2]?.country} (${formatValue(gdpData[2]?.value, 'currency')}). Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `What is the total world GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The total world GDP in ${year} is approximately $${(worldGdp / 1e12).toFixed(0)} trillion in nominal US dollars. The top 10 economies account for roughly two-thirds of this total. Source: IMF.` } },
          { '@type': 'Question', name: 'What does GDP measure?', acceptedAnswer: { '@type': 'Answer', text: 'GDP (Gross Domestic Product) measures the total monetary value of all goods and services produced within a country\'s borders in a given year. Nominal GDP is expressed in current US dollars, making it useful for comparing economic size across countries.' } },
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
          <Link href="/ranking/gdp" className="hover:text-gray-600 transition">GDP Rankings</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">GDP by Country</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">GDP by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          All {gdpData.length} countries ranked by nominal GDP · Total world GDP: ${(worldGdp / 1e12).toFixed(0)}T · Source: IMF World Economic Outlook · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Understanding GDP Rankings</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Gross Domestic Product (GDP) is the primary measure of a country&apos;s economic size. The rankings below show nominal GDP in current US dollars, as reported by the International Monetary Fund (IMF) in the World Economic Outlook. The world economy is worth over ${(worldGdp / 1e12).toFixed(0)} trillion, with the top two economies — {gdpData[0]?.country} and {gdpData[1]?.country} — accounting for over 40% of global output. The concentration is stark: the top 10 economies produce roughly two-thirds of all world GDP.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            When comparing GDP across countries, keep in mind that nominal figures in US dollars are affected by exchange rate movements. A country&apos;s GDP can shrink in dollar terms even while its domestic economy grows, simply because its currency weakened against the dollar. For a fairer comparison of living standards, use <Link href="/ranking/gdp-per-capita" className="text-[#0066cc] hover:underline">GDP per capita</Link> or <Link href="/ranking/gdp-ppp" className="text-[#0066cc] hover:underline">GDP adjusted for purchasing power parity (PPP)</Link>.
          </p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">GDP by country in {year}, ranked by nominal GDP in US dollars. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP (USD)</th>
                  <th scope="col" className="px-4 py-2.5 text-right">% of World</th>
                </tr>
              </thead>
              <tbody>
                {gdpData.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`${getCleanCountryUrl(d.countryId)}/gdp`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-[#64748b]">{((d.value || 0) / worldGdp * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/ranking/gdp" className="text-[14px] text-[#0066cc] hover:underline font-medium">View complete ranking of all {gdpData.length} countries →</Link>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Rankings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/gdp', label: 'GDP (Full List)' },
              { href: '/ranking/gdp-per-capita', label: 'GDP per Capita' },
              { href: '/ranking/gdp-ppp', label: 'GDP (PPP)' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth' },
              { href: '/ranking/population', label: 'Population' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/india-economy', label: 'India Economy' },
              { href: '/ranking/inflation-rate', label: 'Inflation Rates' },
              { href: '/ranking/unemployment-rate', label: 'Unemployment' },
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
