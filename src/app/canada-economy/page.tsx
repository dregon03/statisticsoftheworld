import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Canada Economy 2026 — GDP, Trade, Resources & Key Data',
  description: 'The Canadian economy in 2026: GDP, growth, inflation, unemployment, natural resources, and 440+ indicators. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/canada-economy' },
};

export default async function CanadaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('CAN');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `Canada Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } }) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/canada" className="hover:text-gray-600 transition">Canada</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Canada Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Canadian Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">A resource-rich G7 economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} yrs` : '—' }].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>
          ))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Canada Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Canada is a G7 economy with a GDP of {formatValue(gdp?.value, 'currency')}, built on vast natural resources (oil sands, minerals, timber, natural gas), a sophisticated financial sector centered in Toronto, and deep economic integration with the United States through USMCA. The US-Canada trading relationship is one of the largest bilateral trade flows in the world, with roughly 75% of Canadian exports going south.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Canada has used immigration as a growth strategy more aggressively than any other G7 nation, targeting 500,000+ new permanent residents annually to offset demographic aging. This has driven population growth and housing demand, contributing to a severe housing affordability crisis in Toronto and Vancouver. GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} is competitive globally. The Bank of Canada has navigated rate hikes and cuts to manage inflation at {formatValue(inflation?.value, 'percent', 1)} while supporting growth.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Canada&apos;s economy faces a productivity challenge — GDP per hour worked has lagged the US and many European peers for decades. The country&apos;s resource dependence means economic performance tracks commodity prices, particularly oil. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is moderate by G7 standards. Canada&apos;s life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'among the highest'} and universal healthcare system reflect high living standards.</p>
        </div>
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/compare/united-states-vs-canada', label: 'Canada vs US' }, { href: '/compare/canada-vs-australia', label: 'Canada vs Australia' }, { href: '/compare/canada-vs-mexico', label: 'Canada vs Mexico' }, { href: '/compare/united-kingdom-vs-canada', label: 'Canada vs UK' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/country/canada/gdp', label: 'Canada GDP' }, { href: '/country/canada', label: 'Full Profile →' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
