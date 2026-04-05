import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Remittances by Country 2026 — Personal Transfers Ranked',
  description: 'Remittances by country: all countries ranked by personal remittances received as % of GDP. From 30%+ in small states to near zero in wealthy nations. Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/remittances-by-country' },
};

export default async function RemittancesByCountryPage() {
  const data = await getIndicatorForAllCountries('BX.TRF.PWKR.DT.GD.ZS');
  const year = data[0]?.year || '2024';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Remittances by Country ${year}`, description: `Personal remittances received as % of GDP for ${data.length} countries. Source: World Bank.`, url: 'https://statisticsoftheworld.com/remittances-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country receives the most remittances?', acceptedAnswer: { '@type': 'Answer', text: `As % of GDP, ${data[0]?.country} receives the most at ${formatValue(data[0]?.value, 'percent', 1)}. In absolute terms, India receives the most globally (~$125B), followed by Mexico, China, Philippines, and Egypt. Remittances exceed foreign aid and FDI combined for many developing countries.` } },
      { '@type': 'Question', name: 'Why are remittances important?', acceptedAnswer: { '@type': 'Answer', text: 'Remittances — money sent home by workers abroad — are a lifeline for many developing countries. They reduce poverty, fund education and healthcare, and provide a stable foreign currency income that is less volatile than aid or investment. Global remittances exceeded $650 billion in 2024.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">Remittances by Country</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Remittances by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · % of GDP · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Remittance Flows</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Remittances — money sent home by workers abroad — exceeded $650 billion globally in 2024, more than double foreign aid flows. For many developing countries, remittances are the largest source of foreign exchange. The <Link href="/philippines-economy" className="text-[#0066cc] hover:underline">Philippines</Link> (10%+ of GDP from OFWs), Nepal, and several Central American countries depend heavily on diaspora earnings. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> leads in absolute terms (~$125B annually), followed by <Link href="/mexico-economy" className="text-[#0066cc] hover:underline">Mexico</Link> and <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link>.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Remittances reduce <Link href="/poverty-rate-by-country" className="text-[#0066cc] hover:underline">poverty</Link>, fund education, and provide insurance against economic shocks. Mobile money platforms like M-Pesa have reduced transfer costs in Africa. The Gulf states are the largest remittance-sending region due to millions of South Asian and African migrant workers.</p>
        </div>
        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full"><caption className="sr-only">Remittances as % of GDP by country. Source: World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">% of GDP</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/remittances-received`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/fdi-by-country', label: 'FDI Inflows' }, { href: '/population-by-country', label: 'Population' }, { href: '/poverty-rate-by-country', label: 'Poverty Rate' }, { href: '/philippines-economy', label: 'Philippines Economy' }, { href: '/india-economy', label: 'India Economy' }, { href: '/mexico-economy', label: 'Mexico Economy' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
