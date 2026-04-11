import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Richest Countries in the World 2026 — GDP per Capita Rankings',
  description: 'The richest countries in the world ranked by GDP per capita in 2026. From Luxembourg and Singapore to the wealthiest large economies. Source: IMF World Economic Outlook.',
  alternates: { canonical: 'https://statisticsoftheworld.com/richest-countries' },
  openGraph: {
    title: 'Richest Countries in the World 2026',
    description: 'Top 50 wealthiest countries ranked by GDP per capita. Source: IMF.',
    siteName: 'Statistics of the World',
  },
};

export default async function RichestCountriesPage() {
  const data = await getIndicatorForAllCountries('IMF.NGDPDPC');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Richest Countries ${year}`, description: `Countries ranked by GDP per capita. Global average: ${formatValue(avg, 'currency')}. Source: IMF.`, url: 'https://statisticsoftheworld.com/richest-countries', creator: { '@type': 'Organization', name: 'IMF' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is the richest country in the world in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `By nominal GDP per capita in ${year}, the very top positions are held by micro-states: Monaco, Liechtenstein, Luxembourg, and Singapore. Among countries with populations over 1 million, Luxembourg leads at roughly $130,000–$150,000 per person, followed by Singapore (~$100,000), Ireland, Switzerland, and Norway. Among large economies (population over 100 million), the United States leads at roughly $85,000–$93,000 per person. Source: IMF World Economic Outlook.` } },
      { '@type': 'Question', name: 'What is the richest country in Europe?', acceptedAnswer: { '@type': 'Answer', text: 'Luxembourg has the highest GDP per capita in Europe (and among the highest globally), followed by Ireland, Switzerland, and Norway. Among large European economies, Germany and the Netherlands rank highest. Note that all figures are in nominal US dollars and are affected by the euro-dollar exchange rate — a weaker euro makes European economies appear smaller in dollar terms.' } },
      { '@type': 'Question', name: 'How is wealth measured across countries?', acceptedAnswer: { '@type': 'Answer', text: 'GDP per capita (total GDP divided by population) is the most common measure. However, it does not account for inequality, cost of living, or non-monetary quality of life. Purchasing power parity (PPP) adjustments provide a fairer comparison of actual living standards. GDP per capita is also an average — high inequality means the median person may experience very different conditions than the headline figure suggests.' } },
      { '@type': 'Question', name: `Which country has seen the fastest rise in GDP per capita recently?`, acceptedAnswer: { '@type': 'Answer', text: `Guyana has seen one of the fastest rises in GDP per capita of any country in recent years, driven by massive offshore oil production that came online in 2020. Its GDP per capita has grown tenfold in under a decade, moving it from one of South America's poorest nations to one of its wealthiest by this measure. Among larger economies, India continues to grow per-capita income rapidly at 7%+ annually. Source: IMF.` } },
    ]},
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'GDP per Capita', item: 'https://statisticsoftheworld.com/gdp-per-capita-by-country' },
        { '@type': 'ListItem', position: 3, name: 'Richest Countries', item: 'https://statisticsoftheworld.com/richest-countries' },
      ],
    },
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/gdp-per-capita-by-country" className="hover:text-gray-600 transition">GDP per Capita</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Richest Countries</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Richest Countries in the World ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked by GDP per capita · Global average: {formatValue(avg, 'currency')} · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Richest</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div>
            <div className="text-[13px] text-[#94a3b8]">{formatValue(data[0]?.value, 'currency')}/person</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{formatValue(avg, 'currency')}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Poorest</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[data.length - 1]?.country}</div>
            <div className="text-[13px] text-[#94a3b8]">{formatValue(data[data.length - 1]?.value, 'currency')}/person</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The World&apos;s Wealthiest Nations</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">GDP per capita — total economic output divided by population — is the most widely used proxy for comparing national wealth. The range is staggering: the richest countries report figures above $80,000 per person while the <Link href="/poorest-countries" className="text-[#0066cc] hover:underline">poorest</Link> fall below $500. This 100x+ gap reflects accumulated differences in institutions, education, infrastructure, technology, and governance built over decades or centuries.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Small financial centers and resource-rich nations dominate the top of the per-capita rankings: Luxembourg (driven by its outsized financial sector relative to its 650,000 population), Ireland (inflated by multinational profit routing), Singapore, Qatar, and <Link href="/switzerland-economy" className="text-[#0066cc] hover:underline">Switzerland</Link>. Among large economies, the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> leads at roughly $85,000, well ahead of <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link> (~$58,000) and <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> (~$35,000).</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nominal GDP per capita is distorted by exchange rates and doesn&apos;t reflect local purchasing power — a salary of $10,000 goes much further in Vietnam than in Switzerland. For a fairer comparison, use GDP per capita in purchasing power parity (PPP) terms. GDP per capita is also an average, not a measure of income distribution — <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">inequality</Link> means actual living standards may differ significantly from what the average suggests.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The {year} rankings carry an important exchange rate caveat. Dollar strength in 2025-2026 — partly driven by safe-haven demand during global trade tensions — has compressed the dollar-denominated GDP per capita of European countries. Germany, France, Sweden, and the Netherlands all appear smaller on this list than their local economic performance implies; a stronger euro would move them several positions up. Conversely, countries whose currencies held firm against the dollar — Singapore, Switzerland, and the Gulf states — maintain their rankings. One standout trajectory: Guyana, whose offshore oil production has driven a tenfold increase in GDP per capita over the past decade, moving it from one of South America&apos;s poorest to one of its wealthiest economies by this measure. Compare these economies directly using the <Link href="/compare" className="text-[#0066cc] hover:underline">country comparison tool</Link>.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Richest countries by GDP per capita in {year}. Source: IMF.</caption>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/poorest-countries', label: 'Poorest Countries' }, { href: '/largest-economies', label: 'Largest Economies' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/ranking/gdp-per-capita-ppp', label: 'GDP per Capita PPP' }, { href: '/ranking/gini-index', label: 'Inequality (Gini)' }, { href: '/us-economy', label: 'US Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
