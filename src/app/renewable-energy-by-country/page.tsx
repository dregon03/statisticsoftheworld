import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Renewable Energy by Country 2026 — Clean Energy Rankings',
  description: 'Renewable energy by country: all countries ranked by share of energy from renewable sources. From Iceland (90%+) to oil states (<1%). Source: World Bank / IEA.',
  alternates: { canonical: 'https://statisticsoftheworld.com/renewable-energy-by-country' },
};

export default async function RenewableEnergyByCountryPage() {
  const data = await getIndicatorForAllCountries('EG.FEC.RNEW.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Renewable Energy by Country ${year}`, description: `Renewable energy share for ${data.length} countries. Global average: ${avg.toFixed(0)}%. Source: World Bank.`, url: 'https://statisticsoftheworld.com/renewable-energy-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country uses the most renewable energy?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} leads with ${formatValue(data[0]?.value, 'percent', 0)} of energy from renewable sources. Iceland (geothermal/hydro), Norway (hydro), and several Latin American countries with large hydropower capacity rank highest.` } },
      { '@type': 'Question', name: 'What percentage of world energy is renewable?', acceptedAnswer: { '@type': 'Answer', text: `The global average is approximately ${avg.toFixed(0)}% renewable. Solar and wind costs fell over 90% between 2010 and 2024, making renewables cost-competitive with fossil fuels in most markets. China installs more renewable capacity annually than the rest of the world combined.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Renewable Energy by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Renewable Energy by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(0)}% · Source: World Bank / IEA · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The Global Energy Transition</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Renewable energy consumption as a share of total energy tracks the shift from fossil fuels to sustainable sources. Iceland leads at nearly 90% (geothermal and hydroelectric), followed by Norway (~70%, almost entirely hydro) and several Latin American countries with large hydropower capacity. At the other end, oil-producing nations like <Link href="/saudi-arabia-economy" className="text-[#0066cc] hover:underline">Saudi Arabia</Link>, Kuwait, and Trinidad derive less than 1% from renewables.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Solar and wind costs fell over 90% between 2010 and 2024, making renewables cost-competitive with fossil fuels in most markets. <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> dominates global renewable capacity additions, manufacturing 80%+ of the world&apos;s solar panels. Europe has set a 42.5% renewable target for 2030. The key challenges are intermittency, grid infrastructure, and energy storage. See also: <Link href="/co2-emissions-by-country" className="text-[#0066cc] hover:underline">CO2 emissions by country</Link>.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Renewable energy share by country. Source: World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">Renewable %</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/renewable-energy`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]"><span className={(d.value || 0) > 50 ? 'text-green-600' : 'text-[#0d1b2a]'}>{formatValue(d.value, 'percent', 0)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/renewable-energy" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/renewable-energy', label: 'Full Rankings' }, { href: '/co2-emissions-by-country', label: 'CO2 Emissions' }, { href: '/ranking/forest-area', label: 'Forest Area' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/china-economy', label: 'China Economy' }, { href: '/eu-economy', label: 'EU Economy' }, { href: '/saudi-arabia-economy', label: 'Saudi Arabia' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
