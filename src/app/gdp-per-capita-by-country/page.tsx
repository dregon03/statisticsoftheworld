import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getIndicatorForAllCountries('IMF.NGDPDPC');
  const year = data[0]?.year || '2026';
  const top = data[0];
  return {
    title: `GDP per Capita by Country ${year} — Complete World Rankings | Statistics of the World`,
    description: `GDP per capita for ${data.length} countries in ${year}. #1 ${top?.country}: ${formatValue(top?.value, 'currency')}. Compare the US, Switzerland, Singapore vs. low-income economies. Free full rankings. Source: IMF.`,
    alternates: { canonical: 'https://statisticsoftheworld.com/gdp-per-capita-by-country' },
    openGraph: {
      title: `GDP per Capita by Country ${year} — World Rankings`,
      description: `All ${data.length} countries ranked by GDP per person. Top nations exceed $100K per capita. US ranks in the top 15. Compare all economies. Source: IMF ${year}.`,
      siteName: 'Statistics of the World',
      url: 'https://statisticsoftheworld.com/gdp-per-capita-by-country',
      type: 'website',
    },
  };
}

export default async function GdpPerCapitaByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.NGDPDPC');
  const year = data[0]?.year || '2026';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'GDP per Capita Rankings', item: 'https://statisticsoftheworld.com/ranking/gdp-per-capita' },
          { '@type': 'ListItem', position: 3, name: `GDP per Capita by Country ${year}`, item: 'https://statisticsoftheworld.com/gdp-per-capita-by-country' },
        ],
      },
      {
        '@type': 'Dataset',
        name: `GDP per Capita by Country ${year}`,
        description: `GDP per capita for ${data.length} countries in ${year}. Source: IMF.`,
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
            acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest GDP per capita at ${formatValue(data[0]?.value, 'currency')} in ${year}. The top rankings are dominated by small, wealthy nations: Luxembourg, Switzerland, Norway, and Singapore combine concentrated high-value industries with small populations to produce among the world's highest per-person output. Source: IMF.` },
          },
          {
            '@type': 'Question',
            name: 'What does GDP per capita measure?',
            acceptedAnswer: { '@type': 'Answer', text: "GDP per capita divides a country's total GDP by its population, providing a rough measure of average economic output per person. It's the most widely used proxy for comparing living standards across countries, though it doesn't capture income inequality or cost-of-living differences. For those adjustments, GDP per capita in purchasing power parity (PPP) terms is more useful." },
          },
          {
            '@type': 'Question',
            name: `What is the US GDP per capita in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `The United States GDP per capita is approximately $85,000–$93,000 in ${year}, ranking the US among the top 10–15 countries globally. While the US is the world's largest economy by total GDP, it ranks lower in per-capita terms than micro-states like Luxembourg, Monaco, and Switzerland. The US figure reflects high productivity, strong wages in technology and finance, and consumer spending that drives roughly 70% of the economy. Source: IMF.` },
          },
          {
            '@type': 'Question',
            name: 'Why do small countries like Luxembourg and Singapore have the highest GDP per capita?',
            acceptedAnswer: { '@type': 'Answer', text: "Small countries dominate GDP per capita rankings for structural reasons. Luxembourg hosts European Union financial and technology headquarters, concentrating very high-paying jobs in a tiny population of 670,000. Singapore is a global financial, logistics, and technology hub with a highly educated workforce. Both benefit from favorable tax regimes that attract multinational headquarters. Qatar and Norway combine natural resource wealth (oil, gas) with small populations. Large economies like China, India, and even Germany dilute their total GDP across far more people, lowering per-capita figures even as their aggregate economies dwarf Luxembourg's." },
          },
          {
            '@type': 'Question',
            name: `Which country has the lowest GDP per capita in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${data[data.length - 1]?.country} has the lowest recorded GDP per capita at ${formatValue(data[data.length - 1]?.value, 'currency')} in ${year}. Other low-income economies include Burundi, South Sudan, and the Central African Republic. These countries face compounding challenges: political instability, infrastructure deficits, subsistence agriculture, and exclusion from global supply chains. Low nominal GDP per capita also understates actual living standards — informal economies and non-market production are not captured in official GDP data. Source: IMF.` },
          },
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
          <p className="text-[15px] text-[#374151] leading-[1.8]">GDP per capita is the most commonly used proxy for comparing living standards across countries. It divides total GDP by population, yielding an estimate of average economic output per person. The range is staggering: the richest countries ({data[0]?.country} at {formatValue(data[0]?.value, 'currency')}) report figures more than 100 times higher than the poorest ({data[data.length - 1]?.country} at {formatValue(data[data.length - 1]?.value, 'currency')}). This gap reflects accumulated differences in institutions, education, infrastructure, and governance built up over generations.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nominal GDP per capita in US dollars is distorted by exchange rates — a salary of $10,000 goes much further in India than in Switzerland. For a fairer cross-country comparison of purchasing power, see <Link href="/ranking/gdp-per-capita-ppp" className="text-[#0066cc] hover:underline">GDP per capita adjusted for PPP</Link>. GDP per capita is also an average that masks inequality: Qatar has among the world&apos;s highest GDP per capita, but most GDP accrues to citizens while a large migrant labor force — over 80% of Qatar&apos;s workforce — earns far less and is excluded from the welfare story those headline figures suggest.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">In {year}, US dollar strength is influencing nominal rankings. Currencies that have weakened against the dollar — the euro, yen, Korean won, Indian rupee — see their dollar-denominated GDP per capita compressed even as domestic economies grow in local-currency terms. Guyana is the standout upward mover: offshore oil production has driven GDP growth above 20% annually, catapulting its per-capita figure from under $10,000 five years ago toward upper-middle-income status. Ireland presents the opposite distortion: large multinational corporations (Apple, Google, Pfizer) book substantial profits through Irish subsidiaries, inflating measured GDP well above what Irish residents actually earn — a gap better captured by Ireland&apos;s GNI (Gross National Income). Source: IMF April 2026 WEO.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">GDP per capita has real limits as a welfare measure beyond inequality. China&apos;s GDP per capita of approximately $14,700 understates the purchasing power of Chinese consumers: prices for housing, food, and services are far lower than in the US or Europe, a gap that PPP-adjusted figures better reflect. India, despite rapid 6.5% annual growth, has a nominal per-capita income of roughly $2,900 — placing it in the lower-middle income tier even as its middle class expands rapidly and absolute poverty falls. The US, by contrast, has relatively high nominal per-capita income but faces persistent regional inequality and housing affordability pressures that aggregate GDP figures do not capture. For a complete picture of economic wellbeing, per-capita data should be read alongside <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">inequality (Gini index)</Link> and <Link href="/ranking/life-expectancy" className="text-[#0066cc] hover:underline">life expectancy</Link> data. Source: IMF, World Bank.</p>
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
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Rankings & Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/gdp-per-capita', label: 'Full Per Capita Rankings' },
              { href: '/ranking/gdp-per-capita-ppp', label: 'GDP/Capita (PPP)' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/richest-countries', label: 'Richest Countries' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth Rate' },
              { href: '/largest-economies', label: 'Largest Economies' },
              { href: '/ranking/gini-index', label: 'Inequality (Gini)' },
              { href: '/inflation-by-country', label: 'Inflation by Country' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/compare', label: 'Compare Countries' },
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
