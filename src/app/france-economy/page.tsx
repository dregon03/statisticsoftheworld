import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'France Economy 2026 — GDP, Growth, Industry & Key Data',
  description: 'The French economy in 2026: GDP, growth, inflation, unemployment, trade, and 440+ indicators. Europe\'s second-largest economy. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/france-economy' },
};

export default async function FranceEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('FRA');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `France Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } }) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/france" className="hover:text-gray-600 transition">France</Link><span className="mx-2">/</span>
          <span className="text-gray-600">France Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The French Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">The EU&apos;s second-largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} yrs` : '—' }].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>
          ))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">France Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">France is the European Union&apos;s second-largest economy and the world&apos;s seventh-largest with a GDP of {formatValue(gdp?.value, 'currency')}. The French economy is uniquely diversified: a global leader in luxury goods (LVMH, Hermès, Kering), aerospace (Airbus, Safran, Dassault), nuclear energy (70%+ of electricity from nuclear), tourism (the world&apos;s most visited country at 90M+ visitors annually), and agriculture (the EU&apos;s largest agricultural producer).</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">France&apos;s economic model features a larger state sector than most G7 peers — government spending exceeds 55% of GDP, funding a comprehensive welfare state with generous pensions, universal healthcare, and strong labor protections. This creates a trade-off: French workers are highly productive per hour worked (among the highest in Europe) but work fewer hours and have lower labor force participation. Unemployment at {formatValue(unemployment?.value, 'percent', 1)} has been a persistent challenge, particularly among youth.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Recent reforms have aimed to improve competitiveness through labor market flexibility, tax cuts for businesses, and investment in technology and startups (the &quot;La French Tech&quot; ecosystem). GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} and life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'among the highest'} reflect a high quality of life. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is elevated and a source of fiscal concern.</p>
        </div>
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/compare/united-states-vs-france', label: 'France vs US' }, { href: '/compare/germany-vs-france', label: 'France vs Germany' }, { href: '/compare/united-kingdom-vs-france', label: 'France vs UK' }, { href: '/compare/france-vs-italy', label: 'France vs Italy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/country/france/gdp', label: 'France GDP' }, { href: '/country/france', label: 'Full Profile →' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
