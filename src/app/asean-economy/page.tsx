import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ASEAN Economy 2026 — Combined GDP, Growth & Economic Data',
  description: 'ASEAN economy in 2026: combined GDP, growth, and comparison of Southeast Asia\'s 10 member economies. ASEAN is the world\'s 5th largest economic bloc. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/asean-economy' },
};

const ASEAN_MEMBERS = [
  { iso3: 'IDN', name: 'Indonesia', page: '/indonesia-economy' },
  { iso3: 'THA', name: 'Thailand', page: '/country/thailand' },
  { iso3: 'SGP', name: 'Singapore', page: '/country/singapore' },
  { iso3: 'PHL', name: 'Philippines', page: '/country/philippines' },
  { iso3: 'MYS', name: 'Malaysia', page: '/country/malaysia' },
  { iso3: 'VNM', name: 'Vietnam', page: '/country/vietnam' },
  { iso3: 'MMR', name: 'Myanmar', page: '/country/myanmar' },
  { iso3: 'KHM', name: 'Cambodia', page: '/country/cambodia' },
  { iso3: 'LAO', name: 'Laos', page: '/country/laos' },
  { iso3: 'BRN', name: 'Brunei', page: '/country/brunei' },
];

export default async function ASEANEconomyPage() {
  const allData = await Promise.all(ASEAN_MEMBERS.map(m => getAllIndicatorsForCountry(m.iso3)));
  const members = ASEAN_MEMBERS.map((m, i) => ({
    ...m,
    gdp: allData[i]['IMF.NGDPD']?.value || 0,
    growth: allData[i]['IMF.NGDP_RPCH']?.value || 0,
    pop: allData[i]['SP.POP.TOTL']?.value || 0,
    gdpPerCapita: allData[i]['IMF.NGDPDPC']?.value || 0,
  }));
  const totalGdp = members.reduce((s, m) => s + m.gdp, 0);
  const totalPop = members.reduce((s, m) => s + m.pop, 0);
  const year = allData[0]['IMF.NGDPD']?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `ASEAN Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the combined GDP of ASEAN?', acceptedAnswer: { '@type': 'Answer', text: `ASEAN's combined GDP is approximately ${formatValue(totalGdp, 'currency')} in ${year}, making it the world's 5th largest economic bloc. With 680+ million people, ASEAN has a larger population than the EU. Source: IMF.` } },
      { '@type': 'Question', name: 'Which is the largest ASEAN economy?', acceptedAnswer: { '@type': 'Answer', text: `Indonesia is ASEAN's largest economy, accounting for roughly 40% of the bloc's total GDP. Singapore has the highest GDP per capita. Vietnam is the fastest-growing major ASEAN economy. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">ASEAN Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">ASEAN Economy ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">10 member states · Combined GDP: {formatValue(totalGdp, 'currency')} · Population: {(totalPop / 1e9).toFixed(2)}B · Source: IMF</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">ASEAN Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Association of Southeast Asian Nations (ASEAN) is one of the world&apos;s most dynamic economic regions, with a combined GDP of approximately {formatValue(totalGdp, 'currency')} and a population exceeding 680 million — larger than the <Link href="/eu-economy" className="text-[#0066cc] hover:underline">European Union</Link>. If ASEAN were a single country, it would be the world&apos;s 5th largest economy. The bloc encompasses enormous economic diversity: from Singapore&apos;s $65,000+ GDP per capita to Myanmar and Cambodia at under $2,000.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">ASEAN has been a major beneficiary of manufacturing diversification away from <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link>. Vietnam has emerged as a major electronics and textile exporter, with Samsung&apos;s largest factory complex in the world located near Hanoi. <Link href="/indonesia-economy" className="text-[#0066cc] hover:underline">Indonesia</Link> is developing a nickel and EV battery supply chain. Thailand is Southeast Asia&apos;s automotive hub. The Philippines has a thriving business process outsourcing (BPO) industry. Malaysia and Singapore are key nodes in the global semiconductor supply chain.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">ASEAN&apos;s young demographics (median age ~30), rising middle class, and rapid digital adoption make it one of the most attractive regions for long-term investment. The region&apos;s digital economy is projected to exceed $300 billion by 2025. Challenges include infrastructure gaps, regulatory fragmentation across member states, income inequality, and vulnerability to climate change — particularly rising sea levels and extreme weather events that threaten agricultural livelihoods.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">ASEAN member economies in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP/Capita</th>
                </tr>
              </thead>
              <tbody>
                {members.sort((a, b) => b.gdp - a.gdp).map((m, i) => (
                  <tr key={m.iso3} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={m.page} className="text-[#0066cc] hover:underline text-[14px]">{m.name}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.gdp, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]"><span className={m.growth > 0 ? 'text-green-600' : 'text-red-500'}>{formatValue(m.growth, 'percent', 1)}</span></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.gdpPerCapita, 'currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/g20-economy', label: 'G20 Economy' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/eu-economy', label: 'EU Economy' }, { href: '/china-economy', label: 'China Economy' }, { href: '/india-economy', label: 'India Economy' }, { href: '/japan-economy', label: 'Japan Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
