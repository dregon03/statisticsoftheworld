import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CO2 Emissions by Country 2026 — Per Capita Rankings',
  description: 'CO2 emissions per capita by country: all countries ranked from highest to lowest carbon emissions per person. From Gulf states (30+ tons) to sub-Saharan Africa (<0.5 tons). Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/co2-emissions-by-country' },
  openGraph: {
    title: 'CO2 Emissions by Country 2026 — Global Rankings',
    description: 'All countries ranked by CO2 emissions per capita. Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function CO2EmissionsByCountryPage() {
  const data = await getIndicatorForAllCountries('EN.ATM.CO2E.PC');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `CO2 Emissions per Capita by Country ${year}`, description: `CO2 emissions per capita for ${data.length} countries. Global average: ${avg.toFixed(1)} metric tons. Source: World Bank.`, url: 'https://statisticsoftheworld.com/co2-emissions-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest CO2 emissions per capita?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest CO2 emissions per capita at ${data[0]?.value ? Number(data[0].value).toFixed(1) : '—'} metric tons per person. Gulf states and small petrochemical economies dominate the top of the rankings due to energy-intensive industries and high per-capita energy consumption.` } },
      { '@type': 'Question', name: 'What is the global average CO2 emissions per person?', acceptedAnswer: { '@type': 'Answer', text: `The global average is approximately ${avg.toFixed(1)} metric tons of CO2 per person per year. The US averages about 14 tons (twice the European average), while many sub-Saharan African countries emit less than 0.5 tons per capita.` } },
      { '@type': 'Question', name: 'Are global CO2 emissions increasing or decreasing?', acceptedAnswer: { '@type': 'Answer', text: 'Per capita emissions are declining in most advanced economies due to the shift from coal to gas and renewables. However, total global emissions continue to rise because growth in developing countries more than offsets developed-world reductions.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/co2-emissions" className="hover:text-gray-600 transition">CO2 Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">CO2 Emissions by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">CO2 Emissions by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)} tons/capita · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avg.toFixed(1)} t</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest Emitter</div>
            <div className="text-[24px] font-bold text-red-600">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Lowest Emitter</div>
            <div className="text-[24px] font-bold text-green-600">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Carbon Emissions</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">CO2 emissions per capita measure the average carbon dioxide each person in a country is responsible for, expressed in metric tons per year. This metric is essential for climate policy because it normalizes emissions by population — large countries like <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> and <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> have high total emissions but moderate per capita figures, while smaller wealthy nations like Qatar and Kuwait have among the highest per-person emissions globally. The global average is approximately {avg.toFixed(1)} metric tons per person, but the range is extreme.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Gulf states and small island nations with petrochemical industries can exceed 30 tons per capita. The <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> averages around 14 tons — roughly twice the European average and three times the global mean. At the other end, many sub-Saharan African countries emit less than 0.5 tons per capita, reflecting both lower industrialization and limited access to energy. This 60x gap between the highest and lowest emitters underscores the deep inequality in both energy consumption and climate responsibility.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Per capita emissions are declining in most advanced economies due to the transition from coal to natural gas and <Link href="/ranking/renewable-energy" className="text-[#0066cc] hover:underline">renewables</Link>, energy efficiency improvements, and the structural shift from manufacturing to services. However, global total emissions continue to rise because growth in developing countries — particularly India, Southeast Asia, and Africa — more than offsets developed-world reductions. The fundamental tension in climate negotiations remains: historically wealthy nations produced most cumulative emissions, but future growth will come predominantly from developing countries seeking the same economic prosperity.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">CO2 emissions per capita by country. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">CO2 (tons/capita)</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/co2-emissions`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 10 ? 'text-red-600' : (d.value || 0) > 5 ? 'text-amber-600' : 'text-green-600'}>{d.value ? Number(d.value).toFixed(1) : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/co2-emissions" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/co2-emissions', label: 'CO2 Rankings' }, { href: '/ranking/renewable-energy', label: 'Renewable Energy' }, { href: '/ranking/forest-area', label: 'Forest Area' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/population-by-country', label: 'Population' }, { href: '/us-economy', label: 'US Economy' }, { href: '/china-economy', label: 'China Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
