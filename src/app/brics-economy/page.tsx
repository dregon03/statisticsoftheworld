import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BRICS Economy 2026 — Combined GDP, Growth & Economic Data',
  description: 'BRICS economy in 2026: combined GDP, growth rates, population, and economic comparison of Brazil, Russia, India, China, South Africa, and new members. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/brics-economy' },
};

const BRICS_MEMBERS = [
  { iso3: 'CHN', name: 'China', slug: 'china', economyPage: '/china-economy' },
  { iso3: 'IND', name: 'India', slug: 'india', economyPage: '/india-economy' },
  { iso3: 'BRA', name: 'Brazil', slug: 'brazil', economyPage: '/brazil-economy' },
  { iso3: 'RUS', name: 'Russia', slug: 'russia', economyPage: '/russia-economy' },
  { iso3: 'ZAF', name: 'South Africa', slug: 'south-africa', economyPage: null },
  { iso3: 'SAU', name: 'Saudi Arabia', slug: 'saudi-arabia', economyPage: '/saudi-arabia-economy' },
  { iso3: 'EGY', name: 'Egypt', slug: 'egypt', economyPage: null },
  { iso3: 'ETH', name: 'Ethiopia', slug: 'ethiopia', economyPage: null },
  { iso3: 'IRN', name: 'Iran', slug: 'iran', economyPage: null },
  { iso3: 'ARE', name: 'UAE', slug: 'uae', economyPage: null },
];

export default async function BRICSEconomyPage() {
  const allData = await Promise.all(BRICS_MEMBERS.map(m => getAllIndicatorsForCountry(m.iso3)));
  const members = BRICS_MEMBERS.map((m, i) => ({
    ...m,
    gdp: allData[i]['IMF.NGDPD']?.value || 0,
    growth: allData[i]['IMF.NGDP_RPCH']?.value || 0,
    pop: allData[i]['SP.POP.TOTL']?.value || 0,
    inflation: allData[i]['IMF.PCPIPCH']?.value || 0,
    gdpPerCapita: allData[i]['IMF.NGDPDPC']?.value || 0,
  }));
  const totalGdp = members.reduce((s, m) => s + m.gdp, 0);
  const totalPop = members.reduce((s, m) => s + m.pop, 0);
  const year = allData[0]['IMF.NGDPD']?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `BRICS Economy ${year}`, description: `BRICS combined GDP: ${formatValue(totalGdp, 'currency')}. Members: ${BRICS_MEMBERS.map(m => m.name).join(', ')}.`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the combined GDP of BRICS?', acceptedAnswer: { '@type': 'Answer', text: `The combined GDP of BRICS members is approximately ${formatValue(totalGdp, 'currency')} in ${year}, representing roughly 35% of global GDP. In PPP terms, BRICS accounts for over 40% of world output. Source: IMF.` } },
      { '@type': 'Question', name: 'Which countries are in BRICS?', acceptedAnswer: { '@type': 'Answer', text: `BRICS expanded in 2024 from 5 to 10 members: Brazil, Russia, India, China, South Africa (original), plus Saudi Arabia, UAE, Egypt, Ethiopia, and Iran. Together they represent over 45% of the world's population.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">BRICS Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">BRICS Economy ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{BRICS_MEMBERS.length} members · Combined GDP: {formatValue(totalGdp, 'currency')} · Population: {(totalPop / 1e9).toFixed(2)}B · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Combined GDP</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{formatValue(totalGdp, 'currency')}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Population</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{(totalPop / 1e9).toFixed(2)}B</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Members</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{BRICS_MEMBERS.length}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">BRICS Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">BRICS began in 2009 as an alliance of five major emerging economies — Brazil, Russia, India, China, and South Africa — representing a counterweight to Western-dominated global institutions like the IMF and World Bank. In 2024, the bloc expanded dramatically to include Saudi Arabia, UAE, Egypt, Ethiopia, and Iran, transforming it into a group representing over 45% of the world&apos;s population and roughly 35% of global GDP in nominal terms (over 40% in PPP).</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]"><Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> dominates BRICS economically, accounting for roughly 70% of the bloc&apos;s combined GDP. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> is the fastest-growing major member, with consistent 6-7% annual growth. <Link href="/brazil-economy" className="text-[#0066cc] hover:underline">Brazil</Link> is Latin America&apos;s largest economy with vast agricultural and mineral resources. <Link href="/russia-economy" className="text-[#0066cc] hover:underline">Russia</Link>, despite Western sanctions, remains a major energy producer. The new members add significant oil wealth (<Link href="/saudi-arabia-economy" className="text-[#0066cc] hover:underline">Saudi Arabia</Link>, UAE, Iran) and Africa&apos;s largest population (Ethiopia).</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">BRICS members have established the New Development Bank (NDB) as an alternative to the World Bank and are actively working on de-dollarization — reducing dependence on the US dollar for trade settlement. The bloc&apos;s economic diversity is both a strength and weakness: members range from high-income Gulf states to low-income Ethiopia, and geopolitical tensions (India-China border disputes, Saudi-Iran rivalry) complicate unified action. BRICS represents the most significant institutional challenge to the post-WWII Western economic order.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">BRICS member economies in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Population</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP/Capita</th>
                </tr>
              </thead>
              <tbody>
                {members.sort((a, b) => b.gdp - a.gdp).map(m => (
                  <tr key={m.iso3} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5">
                      <Link href={m.economyPage || `/country/${m.slug}`} className="text-[#0066cc] hover:underline text-[14px]">{m.name}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.gdp, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={m.growth > 0 ? 'text-green-600' : 'text-red-500'}>{formatValue(m.growth, 'percent', 1)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.pop, 'number')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.gdpPerCapita, 'currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/g7-economy', label: 'G7 Economy' }, { href: '/g20-economy', label: 'G20 Economy' }, { href: '/eu-economy', label: 'EU Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/population-by-country', label: 'Population' }, { href: '/world-economy', label: 'World Economy' }, { href: '/compare/united-states-vs-china', label: 'US vs China' }, { href: '/compare/china-vs-india', label: 'China vs India' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
