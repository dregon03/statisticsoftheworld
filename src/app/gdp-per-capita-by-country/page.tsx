import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GDP per Capita by Country 2026 — Ranked List of All Countries',
  description: 'GDP per capita by country 2026: top economies exceed $100K per person, US at $85K+. Complete ranking of all 218 countries by GDP per person in USD. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gdp-per-capita-by-country' },
  openGraph: {
    title: 'GDP per Capita by Country 2026 — Ranked List of All Countries',
    description: 'All 218 countries ranked by GDP per capita in 2026. Explore which countries have the highest and lowest GDP per person. Source: IMF World Economic Outlook.',
    siteName: 'Statistics of the World',
  },
};

export default async function GdpPerCapitaByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.NGDPDPC');
  const year = data[0]?.year || '2026';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        name: `GDP per Capita by Country ${year}`,
        description: `GDP per capita for ${data.length} countries in ${year}. Source: IMF World Economic Outlook.`,
        url: 'https://statisticsoftheworld.com/gdp-per-capita-by-country',
        creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Which country has the highest GDP per capita in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest GDP per capita at ${formatValue(data[0]?.value, 'currency')} in ${year}. Small, high-income economies with large financial sectors — Luxembourg, Singapore, Switzerland, and the Gulf states — consistently top the per-capita rankings because their total GDP is concentrated in small populations. Source: IMF.` },
          },
          {
            '@type': 'Question',
            name: 'What does GDP per capita measure?',
            acceptedAnswer: { '@type': 'Answer', text: "GDP per capita divides a country's total GDP by its population, providing a rough measure of average economic output per person. It's the most common proxy for comparing living standards across countries, though it doesn't account for income inequality or cost of living differences. A country with high GDP per capita may still have severe poverty if income is concentrated at the top." },
          },
          {
            '@type': 'Question',
            name: `Which country has the fastest-growing GDP per capita in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `Guyana has the fastest-growing GDP per capita in ${year}, driven by its oil production boom that began in 2020. From one of the poorest countries in the Western Hemisphere, Guyana has rapidly climbed the global rankings as oil revenues compound. India is also among the fastest-rising large economies, with GDP per capita growth above 6% annually. Source: IMF World Economic Outlook.` },
          },
          {
            '@type': 'Question',
            name: `How has dollar strength affected GDP per capita rankings in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `Nominal GDP per capita figures in US dollars are significantly affected by exchange rates. A stronger US dollar in ${year} — partly a result of trade tensions and Federal Reserve policy — has compressed the dollar-denominated GDP per capita of European, Japanese, and many emerging market economies. Countries whose currencies depreciated against the dollar appear lower in the rankings than their domestic economic performance suggests. For a fairer comparison, use GDP per capita adjusted for purchasing power parity (PPP), which removes exchange rate distortions.` },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'GDP per Capita Rankings', item: 'https://statisticsoftheworld.com/ranking/gdp-per-capita' },
          { '@type': 'ListItem', position: 3, name: 'GDP per Capita by Country', item: 'https://statisticsoftheworld.com/gdp-per-capita-by-country' },
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
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/gdp-per-capita" className="hover:text-gray-600 transition">GDP per Capita Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">GDP per Capita by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">GDP per Capita by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked by GDP per person · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Understanding GDP per Capita</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">GDP per capita is the most commonly used proxy for comparing living standards across countries. It divides total GDP by population, yielding an estimate of average economic output per person. The range is staggering: the richest countries ({data[0]?.country} at {formatValue(data[0]?.value, 'currency')}) report figures 100x higher than the poorest ({data[data.length-1]?.country} at {formatValue(data[data.length-1]?.value, 'currency')}). This gap reflects accumulated differences in institutions, education, infrastructure, and governance over generations.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nominal GDP per capita in US dollars is distorted by exchange rates — a salary of $10,000 goes much further in India than in Switzerland. For a fairer cross-country comparison, use <Link href="/ranking/gdp-per-capita-ppp" className="text-[#0066cc] hover:underline">GDP per capita in PPP terms</Link>. GDP per capita is also an average that masks inequality — Qatar has among the world&apos;s highest GDP per capita but most GDP accrues to citizens, while a large migrant labor force earns far less. For inequality comparisons, see the <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">Gini index ranking</Link>.</p>
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mt-2">{year}: Dollar Strength, Oil Booms, and Rising Asia</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Three themes define the {year} GDP per capita rankings. First, dollar strength: the US dollar&apos;s appreciation against major currencies — driven by Federal Reserve policy and trade-war safe-haven flows — has mechanically depressed the nominal dollar GDP per capita of European, Japanese, Korean, and many emerging market economies relative to their actual domestic purchasing power. Germany, France, and Japan all appear lower in these nominal rankings than PPP-adjusted figures suggest. Second, the oil windfall: Guyana is the world&apos;s fastest-rising economy by GDP per capita, with oil revenues compounding rapidly from a small population base. Gulf states remain at the top tier, though their figures include large non-citizen populations not always counted in IMF denominator estimates. Third, India&apos;s rise: while still a low-to-middle-income country by per-capita measures, India&apos;s growth above 6% annually is steadily lifting its position — and driving the shift in <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">total GDP rankings</Link> where India overtook Japan in {year} to become the world&apos;s third-largest economy.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">GDP per capita by country in {year}. Source: IMF.</caption>
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
          <div className="mt-3 text-right"><Link href="/ranking/gdp-per-capita" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/gdp-per-capita', label: 'Full Rankings' },
              { href: '/ranking/gdp-per-capita-ppp', label: 'GDP/Capita (PPP)' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/gdp-ppp-by-country', label: 'GDP (PPP)' },
              { href: '/richest-countries', label: 'Richest Countries' },
              { href: '/ranking/gini-index', label: 'Inequality (Gini)' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth Rate' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/countries', label: 'All Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
