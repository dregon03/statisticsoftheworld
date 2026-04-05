import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'G20 Economy 2026 — Combined GDP, Growth & Economic Data',
  description: 'G20 economy in 2026: combined GDP, growth, and economic comparison of the world\'s 20 largest economies. The G20 represents 85% of global GDP. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/g20-economy' },
};

const G20_MEMBERS = [
  { iso3: 'USA', name: 'United States', page: '/us-economy' },
  { iso3: 'CHN', name: 'China', page: '/china-economy' },
  { iso3: 'JPN', name: 'Japan', page: '/japan-economy' },
  { iso3: 'DEU', name: 'Germany', page: '/germany-economy' },
  { iso3: 'IND', name: 'India', page: '/india-economy' },
  { iso3: 'GBR', name: 'United Kingdom', page: '/uk-economy' },
  { iso3: 'FRA', name: 'France', page: '/france-economy' },
  { iso3: 'BRA', name: 'Brazil', page: '/brazil-economy' },
  { iso3: 'ITA', name: 'Italy', page: '/italy-economy' },
  { iso3: 'CAN', name: 'Canada', page: '/canada-economy' },
  { iso3: 'RUS', name: 'Russia', page: '/russia-economy' },
  { iso3: 'KOR', name: 'South Korea', page: '/south-korea-economy' },
  { iso3: 'AUS', name: 'Australia', page: '/australia-economy' },
  { iso3: 'MEX', name: 'Mexico', page: '/mexico-economy' },
  { iso3: 'IDN', name: 'Indonesia', page: '/indonesia-economy' },
  { iso3: 'SAU', name: 'Saudi Arabia', page: '/saudi-arabia-economy' },
  { iso3: 'TUR', name: 'Turkey', page: '/turkey-economy' },
  { iso3: 'ARG', name: 'Argentina', page: '/country/argentina' },
  { iso3: 'ZAF', name: 'South Africa', page: '/country/south-africa' },
];

export default async function G20EconomyPage() {
  const allData = await Promise.all(G20_MEMBERS.map(m => getAllIndicatorsForCountry(m.iso3)));
  const members = G20_MEMBERS.map((m, i) => ({
    ...m,
    gdp: allData[i]['IMF.NGDPD']?.value || 0,
    growth: allData[i]['IMF.NGDP_RPCH']?.value || 0,
    pop: allData[i]['SP.POP.TOTL']?.value || 0,
    gdpPerCapita: allData[i]['IMF.NGDPDPC']?.value || 0,
  }));
  const totalGdp = members.reduce((s, m) => s + m.gdp, 0);
  const year = allData[0]['IMF.NGDPD']?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `G20 Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the combined GDP of the G20?', acceptedAnswer: { '@type': 'Answer', text: `The combined GDP of G20 members is approximately ${formatValue(totalGdp, 'currency')} in ${year}, representing about 85% of global GDP, 75% of international trade, and two-thirds of the world's population. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">G20 Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">G20 Economy ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">19 countries + EU · ~85% of global GDP · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">G20 Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Group of Twenty (G20) is the premier forum for international economic cooperation, bringing together the world&apos;s 19 largest economies plus the European Union. G20 members account for approximately 85% of global GDP, 75% of international trade, and two-thirds of the world&apos;s population. The G20 was elevated from a finance ministers&apos; forum to a leaders&apos; summit during the 2008 financial crisis, recognizing that global economic challenges require coordination beyond the <Link href="/g7-economy" className="text-[#0066cc] hover:underline">G7</Link>.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The G20 spans the full spectrum of economic development: from high-income economies like the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> ({formatValue(members.find(m => m.iso3 === 'USA')?.gdpPerCapita || 0, 'currency')} GDP per capita) to emerging markets like <Link href="/indonesia-economy" className="text-[#0066cc] hover:underline">Indonesia</Link> and <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link>. This diversity makes consensus difficult but ensures that G20 decisions reflect global economic realities rather than just advanced-economy perspectives.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">G20 member economies ranked by GDP in {year}. Source: IMF.</caption>
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
            {[{ href: '/g7-economy', label: 'G7 Economy' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/eu-economy', label: 'EU Economy' }, { href: '/asean-economy', label: 'ASEAN Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/world-economy', label: 'World Economy' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
