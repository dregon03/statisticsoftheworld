import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'EU Economy 2026 — European Union GDP, Growth & Economic Data',
  description: 'European Union economy in 2026: combined GDP, growth, inflation, unemployment, and comparison of all 27 EU member states. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/eu-economy' },
};

const EU_MEMBERS = [
  { iso3: 'DEU', name: 'Germany', page: '/germany-economy' },
  { iso3: 'FRA', name: 'France', page: '/france-economy' },
  { iso3: 'ITA', name: 'Italy', page: '/italy-economy' },
  { iso3: 'ESP', name: 'Spain', page: '/spain-economy' },
  { iso3: 'NLD', name: 'Netherlands', page: '/netherlands-economy' },
  { iso3: 'POL', name: 'Poland', page: '/country/poland' },
  { iso3: 'BEL', name: 'Belgium', page: '/country/belgium' },
  { iso3: 'IRL', name: 'Ireland', page: '/country/ireland' },
  { iso3: 'AUT', name: 'Austria', page: '/country/austria' },
  { iso3: 'SWE', name: 'Sweden', page: '/country/sweden' },
  { iso3: 'ROU', name: 'Romania', page: '/country/romania' },
  { iso3: 'CZE', name: 'Czech Republic', page: '/country/czech-republic' },
  { iso3: 'DNK', name: 'Denmark', page: '/country/denmark' },
  { iso3: 'FIN', name: 'Finland', page: '/country/finland' },
  { iso3: 'PRT', name: 'Portugal', page: '/country/portugal' },
  { iso3: 'GRC', name: 'Greece', page: '/country/greece' },
];

export default async function EUEconomyPage() {
  const allData = await Promise.all(EU_MEMBERS.map(m => getAllIndicatorsForCountry(m.iso3)));
  const members = EU_MEMBERS.map((m, i) => ({
    ...m,
    gdp: allData[i]['IMF.NGDPD']?.value || 0,
    growth: allData[i]['IMF.NGDP_RPCH']?.value || 0,
    pop: allData[i]['SP.POP.TOTL']?.value || 0,
    inflation: allData[i]['IMF.PCPIPCH']?.value || 0,
    unemployment: allData[i]['IMF.LUR']?.value || 0,
  }));
  const totalGdp = members.reduce((s, m) => s + m.gdp, 0);
  const totalPop = members.reduce((s, m) => s + m.pop, 0);
  const year = allData[0]['IMF.NGDPD']?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `EU Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the GDP of the European Union?', acceptedAnswer: { '@type': 'Answer', text: `The European Union's combined GDP is approximately ${formatValue(totalGdp, 'currency')} in ${year} (top 16 members shown), making it the world's third-largest economic bloc after the US and China. The EU is the world's largest single market with 450 million consumers. Source: IMF.` } },
      { '@type': 'Question', name: 'Which is the largest economy in the EU?', acceptedAnswer: { '@type': 'Answer', text: `Germany is the EU's largest economy, followed by France, Italy, and Spain. These four countries account for roughly two-thirds of the EU's total GDP.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">EU Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">European Union Economy ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">27 member states · Combined GDP: {formatValue(totalGdp, 'currency')}+ · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">EU Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The European Union is the world&apos;s largest single market, with 27 member states, 450 million consumers, and a combined GDP that rivals the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>. The EU&apos;s single market — with free movement of goods, services, capital, and people — is its greatest economic achievement, enabling European companies to operate across a continent-wide market without trade barriers. The euro, shared by 20 member states, is the world&apos;s second most-used reserve currency after the dollar.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]"><Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link> is the EU&apos;s largest economy, followed by <Link href="/france-economy" className="text-[#0066cc] hover:underline">France</Link>, <Link href="/italy-economy" className="text-[#0066cc] hover:underline">Italy</Link>, and <Link href="/spain-economy" className="text-[#0066cc] hover:underline">Spain</Link>. These four account for roughly two-thirds of the EU&apos;s total output. The EU faces a competitiveness challenge vis-&agrave;-vis the US and China: European companies lag in technology and AI, <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">GDP growth</Link> has been sluggish, and the regulatory environment — while strong on consumer protection — can inhibit innovation and scale.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Key EU economic priorities include the green transition (the European Green Deal targets net-zero emissions by 2050), digital sovereignty (reducing dependence on US tech platforms and Chinese hardware), defense spending increases (prompted by Russia&apos;s invasion of Ukraine), and managing the energy transition after cutting Russian gas dependency. The EU Recovery Fund (NextGenerationEU) has directed &euro;800 billion toward post-pandemic recovery, with a focus on digitalization and sustainability.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Largest EU economies in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Unemployment</th>
                </tr>
              </thead>
              <tbody>
                {members.sort((a, b) => b.gdp - a.gdp).map((m, i) => (
                  <tr key={m.iso3} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={m.page} className="text-[#0066cc] hover:underline text-[14px]">{m.name}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.gdp, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]"><span className={m.growth > 0 ? 'text-green-600' : 'text-red-500'}>{formatValue(m.growth, 'percent', 1)}</span></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.unemployment, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/g7-economy', label: 'G7 Economy' }, { href: '/g20-economy', label: 'G20 Economy' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/asean-economy', label: 'ASEAN Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/unemployment-by-country', label: 'Unemployment' }, { href: '/inflation-by-country', label: 'Inflation' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
