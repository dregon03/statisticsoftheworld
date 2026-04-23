import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GDP by Country 2026 — Ranked List of All 218 Economies',
  description: 'GDP by country 2026: 218 economies ranked by nominal GDP. US $32T, China $21T, Germany #3 at $5.4T, Japan #4 at $4.4T, India #6 at $4.15T. Free full rankings. Source: IMF April 2026 WEO.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gdp-by-country' },
  openGraph: {
    title: 'GDP by Country 2026 — Complete World Rankings',
    description: 'All 218 countries ranked by nominal GDP. US $32T, China $21T, Germany #3, Japan #4, UK #5, India #6. Source: IMF April 2026 WEO.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/gdp-by-country',
    type: 'website',
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
        '@type': 'WebPage',
        name: `GDP by Country ${year} — Ranked List of All 218 Economies`,
        url: 'https://statisticsoftheworld.com/gdp-by-country',
        description: `Nominal GDP for all ${gdpData.length} countries in ${year}, ranked largest to smallest. Source: IMF World Economic Outlook.`,
        dateModified: new Date().toISOString().split('T')[0],
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'GDP Rankings', item: 'https://statisticsoftheworld.com/ranking/gdp' },
          { '@type': 'ListItem', position: 3, name: `GDP by Country ${year}`, item: 'https://statisticsoftheworld.com/gdp-by-country' },
        ]},
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'GDP Rankings', item: 'https://statisticsoftheworld.com/ranking/gdp' },
          { '@type': 'ListItem', position: 3, name: `GDP by Country ${year}`, item: 'https://statisticsoftheworld.com/gdp-by-country' },
        ],
      },
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
          { '@type': 'Question', name: `What are the top 5 largest economies by GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The top 5 largest economies by nominal GDP in ${year} per the IMF April 2026 World Economic Outlook are: United States ($32T), China ($21T), Germany ($5.4T), Japan ($4.4T), and United Kingdom ($4.26T). India ranks sixth at $4.15T — rupee depreciation (84.6 to 88.5 per dollar) and a February 2026 statistical base-year revision by India's MoSPI prevented India from surpassing Japan in dollar terms, despite India growing at 6.5% in real terms.` } },
          { '@type': 'Question', name: `How do US tariffs affect GDP rankings in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The Trump administration's April 2026 tariff package weakened currencies of export-dependent economies against the dollar, compressing their nominal GDP in USD terms. Countries like Vietnam, South Korea, and Germany saw their dollar-denominated GDP reduced even as domestic economies continued growing. China's GDP growth slowed from ~5% to ~4.2% under the 145% US-China tariff rate. Economies that negotiated exemptions — India, the UK — were relatively insulated. Source: IMF.` } },
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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">GDP by Country 2026: Key Rankings</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The <strong>United States</strong> has the highest GDP of any country in 2026 at approximately $32 trillion, followed by <strong>China</strong> ($20.9T), <strong>Germany</strong> ($5.4T), <strong>Japan</strong> ($4.4T), and the <strong>United Kingdom</strong> ($4.26T). <strong>India</strong> ranks sixth at $4.15T. The full rankings below show nominal GDP in current US dollars for all {gdpData.length} countries, sourced from the IMF&apos;s April 2026 World Economic Outlook. The world economy totals over ${(worldGdp / 1e12).toFixed(0)} trillion — with the top 10 economies producing roughly two-thirds of all global output.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            When comparing GDP across countries, keep in mind that nominal figures in US dollars are affected by exchange rate movements. A country&apos;s GDP can shrink in dollar terms even while its domestic economy grows, simply because its currency weakened against the dollar. For a fairer comparison of living standards, use <Link href="/ranking/gdp-per-capita" className="text-[#0066cc] hover:underline">GDP per capita</Link> or <Link href="/ranking/gdp-ppp" className="text-[#0066cc] hover:underline">GDP adjusted for purchasing power parity (PPP)</Link>.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The IMF&apos;s April 2026 World Economic Outlook produced a notable realignment in the top ranks. Germany holds third place at $5.4 trillion; <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> fourth at $4.4 trillion; the United Kingdom fifth at $4.26 trillion. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> — widely expected to overtake Japan for fourth — ranks sixth at $4.15 trillion, held back by two factors: the rupee&apos;s depreciation from 84.6 to 88.5 per dollar over the past year, and a February 2026 statistical base-year revision by India&apos;s MoSPI that lowered India&apos;s nominal GDP estimate by roughly 4%. In real terms India is still the world&apos;s fastest-growing major economy at 6.5% and is on track to become the third-largest in dollar terms by the early 2030s. The US tariff escalation of 2025–2026 has further distorted dollar-denominated rankings broadly: currencies of export-dependent economies (South Korea, Vietnam, <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link>) weakened against the dollar, compressing their nominal figures even as domestic output held up. The <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">fastest-growing economies</Link> by real GDP in 2026 include Guyana (oil boom, 23%+), India, and Southeast Asian nations capturing supply chains relocating away from China.
          </p>
        </div>

        <div className="max-w-[800px] mb-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-2">Top 10 Largest Economies by GDP ({year})</h2>
          <p className="text-[13px] text-[#64748b] mb-4">Nominal GDP in current US dollars · Source: IMF April {year} World Economic Outlook</p>
          <ol className="space-y-2">
            {gdpData.slice(0, 10).map((d, i) => (
              <li key={d.countryId} className="flex gap-3 items-baseline text-[14px] text-[#374151]">
                <span className="font-bold text-[#0d1b2a] w-5 shrink-0">{i + 1}.</span>
                <span>
                  <Link href={`${getCleanCountryUrl(d.countryId)}/gdp`} className="font-semibold text-[#0066cc] hover:underline">{d.country}</Link>
                  {' — '}<span className="font-mono">{formatValue(d.value, 'currency')}</span>
                  <span className="text-[#94a3b8] text-[13px]"> ({((d.value || 0) / worldGdp * 100).toFixed(1)}% of world GDP)</span>
                </span>
              </li>
            ))}
          </ol>
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
