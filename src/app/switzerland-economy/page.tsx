import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Switzerland Economy 2026 — GDP, Banking, Innovation & Key Data',
  description: 'Switzerland economy in 2026: GDP, growth, inflation, and key indicators. One of the world\'s wealthiest countries by GDP per capita. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/switzerland-economy' },
};

export default async function SwitzerlandEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('CHE');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Switzerland Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Switzerland's GDP per capita?`, acceptedAnswer: { '@type': 'Answer', text: `Switzerland's GDP per capita is approximately ${formatValue(gdpPerCapita?.value, 'currency')} — among the highest in the world. This reflects Switzerland's strengths in banking, pharmaceuticals, precision manufacturing, and commodity trading. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/switzerland" className="hover:text-gray-600 transition">Switzerland</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Switzerland Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Switzerland Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Among the world&apos;s wealthiest per capita · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'GDP (Nominal)', value: formatValue(gdp?.value, 'currency') },
            { label: 'GDP Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) },
            { label: 'Inflation Rate', value: formatValue(inflation?.value, 'percent', 1) },
            { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) },
            { label: 'GDP per Capita', value: formatValue(gdpPerCapita?.value, 'currency') },
            { label: 'Population', value: formatValue(pop?.value, 'number') },
            { label: 'Govt Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) },
            { label: 'Life Expectancy', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : '—' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5">
              <div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div>
              <div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div>
            </div>
          ))}
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Switzerland Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Switzerland is one of the world&apos;s wealthiest and most stable economies, with a GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} that consistently ranks in the global top 5. The Swiss economy is built on four pillars: financial services (UBS, Credit Suisse/UBS, Zurich Insurance), pharmaceuticals (Novartis, Roche — together forming the world&apos;s largest pharma cluster), precision manufacturing (watches, machinery, medical devices), and commodity trading (Switzerland is the world&apos;s largest commodities trading hub, with companies like Glencore, Trafigura, and Vitol based in Geneva and Zug).</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Switzerland&apos;s economic model combines low taxes, light regulation, and an extremely skilled workforce with strong social safety nets and consensus-driven policymaking. The Swiss franc is one of the world&apos;s safe-haven currencies, which can create challenges — a strong franc makes Swiss exports more expensive, leading the Swiss National Bank to occasionally intervene in currency markets. Unemployment at {formatValue(unemployment?.value, 'percent', 1)} is among the lowest in the world, reflecting both a strong economy and an apprenticeship system that smoothly transitions youth into employment.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Innovation is a Swiss hallmark: the country consistently ranks #1 on the Global Innovation Index. CERN, ETH Zurich, and EPFL are world-leading research institutions. Switzerland is not an EU member but maintains extensive bilateral agreements for market access. <Link href="/life-expectancy-by-country" className="text-[#0066cc] hover:underline">Life expectancy</Link> at {lifeExp?.value ? Number(lifeExp.value).toFixed(1) : '83'} years is among the world&apos;s highest. Challenges include high cost of living, housing affordability (particularly in Zurich and Geneva), and managing the franc&apos;s strength without harming export competitiveness.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Switzerland</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/switzerland-vs-norway', label: 'vs Norway' },
              { href: '/compare/switzerland-vs-germany', label: 'vs Germany' },
              { href: '/compare/singapore-vs-switzerland', label: 'vs Singapore' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/switzerland', label: 'Full Profile →' }, { href: '/netherlands-economy', label: 'Netherlands Economy' }, { href: '/germany-economy', label: 'Germany Economy' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/corruption-by-country', label: 'Corruption Index' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
