import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, getIndicatorForAllCountries, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Italy Economy 2026 — GDP, Debt, Growth & Key Data',
  description: 'Italy economy in 2026: GDP, growth rate, inflation, unemployment, government debt, and key indicators. The eurozone\'s 3rd largest economy. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/italy-economy' },
};

export default async function ItalyEconomyPage() {
  const [indicators] = await Promise.all([getAllIndicatorsForCountry('ITA')]);
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Italy Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Italy's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Italy's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the eurozone's 3rd largest economy and the world's 8th-9th largest. Source: IMF.` } },
      { '@type': 'Question', name: `What is Italy's government debt?`, acceptedAnswer: { '@type': 'Answer', text: `Italy's government debt is ${formatValue(debt?.value, 'percent', 1)} of GDP — one of the highest in Europe and a persistent challenge for fiscal policy. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/italy" className="hover:text-gray-600 transition">Italy</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Italy Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Italy Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Eurozone&apos;s 3rd largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Italy Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Italy is the eurozone&apos;s third-largest economy and the world&apos;s eighth or ninth largest by nominal GDP. It is a global leader in luxury goods, automotive manufacturing (Ferrari, Lamborghini, Fiat), fashion (Gucci, Prada, Armani), food and wine, machinery, and tourism. Italy receives roughly 65 million international visitors annually, making it one of the most visited countries in the world. The northern regions (Lombardy, Veneto, Emilia-Romagna) are among Europe&apos;s most productive, while the south (Mezzogiorno) lags significantly.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Italy&apos;s central challenge is low growth. GDP growth has averaged barely 0.5% per year over the past two decades — the weakest performance among major European economies. This stagnation reflects structural factors: rigid labor markets, slow judicial systems, an aging and shrinking population (Italy&apos;s fertility rate is among the world&apos;s lowest at about 1.2), and a large public sector that absorbs resources without proportional productivity gains. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is the highest in the eurozone after Greece.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Despite these challenges, Italy&apos;s economy has important strengths. Its manufacturing sector is the second largest in Europe, with a strong network of small and medium enterprises specializing in high-quality niche products. Italy runs a trade surplus, particularly in machinery and luxury exports. The EU Recovery Fund has directed significant investment toward digitalization and green transition. Italy&apos;s life expectancy at {lifeExp?.value ? Number(lifeExp.value).toFixed(1) : '83'} years is among the world&apos;s highest, reflecting excellent healthcare and diet.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Italy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/france-vs-italy', label: 'vs France' },
              { href: '/compare/germany-vs-italy', label: 'vs Germany' },
              { href: '/compare/italy-vs-spain', label: 'vs Spain' },
              { href: '/compare/united-states-vs-italy', label: 'vs USA' },
              { href: '/compare/italy-vs-netherlands', label: 'vs Netherlands' },
              { href: '/compare/united-kingdom-vs-france', label: 'UK vs France' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/italy', label: 'Full Profile →' }, { href: '/germany-economy', label: 'Germany Economy' }, { href: '/france-economy', label: 'France Economy' }, { href: '/spain-economy', label: 'Spain Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
