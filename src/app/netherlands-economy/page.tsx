import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Netherlands Economy 2026 — GDP, Trade, Tech & Key Data',
  description: 'Netherlands economy in 2026: GDP, growth, inflation, trade, and key indicators. Europe\'s 5th largest economy and a global trade powerhouse. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/netherlands-economy' },
};

export default async function NetherlandsEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('NLD');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Netherlands Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is the Netherlands GDP?`, acceptedAnswer: { '@type': 'Answer', text: `The Netherlands GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}. Despite a population of only 18 million, it's Europe's 5th largest economy, a testament to its extraordinary trade-oriented productivity. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/netherlands" className="hover:text-gray-600 transition">Netherlands</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Netherlands Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Netherlands Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Europe&apos;s trade gateway · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Netherlands Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Netherlands punches far above its weight economically. With just 18 million people, it&apos;s Europe&apos;s fifth-largest economy and the world&apos;s 17th largest, driven by its position as Europe&apos;s trade gateway. The Port of Rotterdam is Europe&apos;s largest, handling over 450 million tons of cargo annually, and Amsterdam&apos;s Schiphol Airport is a major European hub. Trade openness exceeds 150% of GDP, among the highest in the world.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Dutch economy is highly diversified and innovative. ASML, headquartered in Veldhoven, has a monopoly on extreme ultraviolet (EUV) lithography machines — the most critical technology in semiconductor manufacturing, making it one of the world&apos;s most strategically important companies. Other major Dutch multinationals include Shell, Unilever, Philips, ING, and Heineken. Agriculture is another surprising strength: the Netherlands is the world&apos;s second-largest agricultural exporter by value, behind only the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>, thanks to intensive greenhouse farming and advanced agritech.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} is among the highest in Europe. However, the Netherlands faces its own challenges: a severe housing shortage, high household debt, and its status as a corporate tax haven has drawn EU criticism. The economy&apos;s openness makes it vulnerable to global trade disruptions, and the country is heavily exposed to any slowdown in European demand. Climate adaptation is an existential concern — roughly a quarter of the country lies below sea level.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Netherlands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/netherlands-vs-belgium', label: 'vs Belgium' },
              { href: '/compare/italy-vs-netherlands', label: 'vs Italy' },
              { href: '/compare/germany-vs-france', label: 'Germany vs France' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/netherlands', label: 'Full Profile →' }, { href: '/germany-economy', label: 'Germany Economy' }, { href: '/france-economy', label: 'France Economy' }, { href: '/switzerland-economy', label: 'Switzerland Economy' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
