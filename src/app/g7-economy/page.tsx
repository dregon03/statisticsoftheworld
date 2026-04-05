import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'G7 Economy 2026 — Combined GDP, Growth & Economic Data',
  description: 'G7 economy in 2026: combined GDP, growth rates, and economic comparison of the US, Japan, Germany, UK, France, Italy, and Canada. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/g7-economy' },
};

const G7_MEMBERS = [
  { iso3: 'USA', name: 'United States', economyPage: '/us-economy' },
  { iso3: 'JPN', name: 'Japan', economyPage: '/japan-economy' },
  { iso3: 'DEU', name: 'Germany', economyPage: '/germany-economy' },
  { iso3: 'GBR', name: 'United Kingdom', economyPage: '/uk-economy' },
  { iso3: 'FRA', name: 'France', economyPage: '/france-economy' },
  { iso3: 'ITA', name: 'Italy', economyPage: '/italy-economy' },
  { iso3: 'CAN', name: 'Canada', economyPage: '/canada-economy' },
];

export default async function G7EconomyPage() {
  const allData = await Promise.all(G7_MEMBERS.map(m => getAllIndicatorsForCountry(m.iso3)));
  const members = G7_MEMBERS.map((m, i) => ({
    ...m,
    gdp: allData[i]['IMF.NGDPD']?.value || 0,
    growth: allData[i]['IMF.NGDP_RPCH']?.value || 0,
    pop: allData[i]['SP.POP.TOTL']?.value || 0,
    inflation: allData[i]['IMF.PCPIPCH']?.value || 0,
    gdpPerCapita: allData[i]['IMF.NGDPDPC']?.value || 0,
    debt: allData[i]['IMF.GGXWDG_NGDP']?.value || 0,
  }));
  const totalGdp = members.reduce((s, m) => s + m.gdp, 0);
  const totalPop = members.reduce((s, m) => s + m.pop, 0);
  const year = allData[0]['IMF.NGDPD']?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `G7 Economy ${year}`, description: `G7 combined GDP: ${formatValue(totalGdp, 'currency')}.`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the combined GDP of the G7?', acceptedAnswer: { '@type': 'Answer', text: `The combined GDP of the G7 is approximately ${formatValue(totalGdp, 'currency')} in ${year}, representing roughly 43% of global GDP. The US alone accounts for over half the G7's total output. Source: IMF.` } },
      { '@type': 'Question', name: 'Which countries are in the G7?', acceptedAnswer: { '@type': 'Answer', text: 'The G7 consists of the United States, Japan, Germany, United Kingdom, France, Italy, and Canada — the world\'s seven largest advanced economies. The EU also participates. Russia was expelled in 2014 following the annexation of Crimea.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">G7 Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">G7 Economy ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">7 largest advanced economies · Combined GDP: {formatValue(totalGdp, 'currency')} · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
            <div className="text-[13px] text-[#94a3b8] mb-1">Share of World GDP</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">~43%</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">G7 Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Group of Seven (G7) represents the world&apos;s seven largest advanced economies: the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>, <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link>, <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link>, the <Link href="/uk-economy" className="text-[#0066cc] hover:underline">United Kingdom</Link>, <Link href="/france-economy" className="text-[#0066cc] hover:underline">France</Link>, <Link href="/italy-economy" className="text-[#0066cc] hover:underline">Italy</Link>, and <Link href="/canada-economy" className="text-[#0066cc] hover:underline">Canada</Link>. Together they account for approximately 43% of global GDP in nominal terms, though this share has declined from over 65% in the 1990s as emerging economies — particularly China and India — have grown faster.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The G7 economies share common characteristics: mature, service-oriented economies with high <Link href="/gdp-per-capita-by-country" className="text-[#0066cc] hover:underline">GDP per capita</Link>, aging populations, independent central banks, deep capital markets, and strong institutional frameworks. They also face similar challenges: slowing productivity growth, rising government <Link href="/debt-by-country" className="text-[#0066cc] hover:underline">debt</Link> (the average G7 debt-to-GDP ratio exceeds 110%), aging demographics, and the need to balance climate commitments with energy security.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The G7&apos;s collective economic influence remains enormous: G7 currencies (USD, EUR, JPY, GBP, CAD) dominate global reserves and trade invoicing, G7 central banks set the global monetary policy tone, and G7 countries control the major international financial institutions. However, the rise of <Link href="/brics-economy" className="text-[#0066cc] hover:underline">BRICS</Link> and the G20&apos;s growing importance reflect the reality that global economic governance can no longer be managed by advanced economies alone.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">G7 member economies in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Inflation</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Debt (% GDP)</th>
                </tr>
              </thead>
              <tbody>
                {members.sort((a, b) => b.gdp - a.gdp).map(m => (
                  <tr key={m.iso3} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5"><Link href={m.economyPage} className="text-[#0066cc] hover:underline text-[14px]">{m.name}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.gdp, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]"><span className={m.growth > 0 ? 'text-green-600' : 'text-red-500'}>{formatValue(m.growth, 'percent', 1)}</span></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.inflation, 'percent', 1)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(m.debt, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/brics-economy', label: 'BRICS Economy' }, { href: '/g20-economy', label: 'G20 Economy' }, { href: '/eu-economy', label: 'EU Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/debt-by-country', label: 'Debt by Country' }, { href: '/inflation-by-country', label: 'Inflation Rates' }, { href: '/world-economy', label: 'World Economy' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
