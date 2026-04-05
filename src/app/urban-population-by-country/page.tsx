import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Urban Population by Country 2026 — Urbanization Rates Ranked',
  description: 'Urban population by country: all countries ranked by percentage of population living in cities. From 100% (Singapore) to under 15%. Source: World Bank / UN.',
  alternates: { canonical: 'https://statisticsoftheworld.com/urban-population-by-country' },
};

export default async function UrbanPopulationByCountryPage() {
  const data = await getIndicatorForAllCountries('SP.URB.TOTL.IN.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Urban Population by Country ${year}`, description: `Urbanization rate for ${data.length} countries. Global average: ${avg.toFixed(0)}%. Source: World Bank / UN.`, url: 'https://statisticsoftheworld.com/urban-population-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country is the most urbanized?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest urbanization at ${formatValue(data[0]?.value, 'percent', 0)}. City-states like Singapore and Hong Kong are essentially 100% urban. Among large countries, Argentina, Japan, and South Korea exceed 90%.` } },
      { '@type': 'Question', name: 'What percentage of the world lives in cities?', acceptedAnswer: { '@type': 'Answer', text: `The world crossed 50% urbanization around 2007 and now stands at approximately ${avg.toFixed(0)}%. Urbanization drives economic growth — GDP per capita is strongly correlated with urbanization. There is no wealthy, low-urbanization country.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">Urban Population by Country</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Urban Population by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(0)}% · Source: World Bank / UN · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Urbanization Trends</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Urbanization is one of the most powerful structural forces in economic development. When people move from farms to cities, productivity increases through specialization, knowledge spillovers, and efficient service delivery. <Link href="/gdp-per-capita-by-country" className="text-[#0066cc] hover:underline">GDP per capita</Link> is strongly correlated with urbanization — there is no wealthy, low-urbanization country. <Link href="/singapore-economy" className="text-[#0066cc] hover:underline">Singapore</Link> and Hong Kong are essentially 100% urban, while Burundi, Niger, and Chad remain over 85% rural.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">However, unmanaged urbanization creates slums, congestion, pollution, and infrastructure strain. Sub-Saharan Africa and South Asia are urbanizing rapidly without the infrastructure investment needed. <Link href="/china-economy" className="text-[#0066cc] hover:underline">China&apos;s</Link> urbanization from 20% to 65% in four decades was accompanied by massive infrastructure spending; many developing countries lack that fiscal capacity.</p>
        </div>
        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full"><caption className="sr-only">Urban population % by country. Source: World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">Urban %</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/urban-population`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 0)}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/population-by-country', label: 'Population' }, { href: '/most-populous-countries', label: 'Most Populous' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/fertility-rate-by-country', label: 'Fertility Rate' }, { href: '/co2-emissions-by-country', label: 'CO2 Emissions' }, { href: '/china-economy', label: 'China Economy' }, { href: '/india-economy', label: 'India Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
