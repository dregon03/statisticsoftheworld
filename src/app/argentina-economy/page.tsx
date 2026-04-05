import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Argentina Economy 2026 — GDP, Inflation, Reform & Key Data',
  description: 'Argentina economy in 2026: GDP, inflation, currency, growth, and key indicators. South America\'s 3rd largest economy undergoing radical reform. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/argentina-economy' },
};

export default async function ArgentinaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('ARG');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Argentina Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Argentina's inflation rate?`, acceptedAnswer: { '@type': 'Answer', text: `Argentina's inflation rate is ${formatValue(inflation?.value, 'percent', 1)} in ${year}. Argentina has experienced chronic high inflation — exceeding 100% annually — driven by fiscal deficits, money printing, and currency instability. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/argentina" className="hover:text-gray-600 transition">Argentina</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Argentina Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Argentina Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">South America&apos;s 3rd largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Argentina Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Argentina is one of the most paradoxical economies in the world. Blessed with vast agricultural lands (the Pampas are among the world&apos;s most fertile), abundant natural resources (including the massive Vaca Muerta shale formation), a well-educated population, and a diversified industrial base, Argentina should be one of the world&apos;s richest countries. In fact, it was — in 1900, Argentina&apos;s GDP per capita was comparable to France and <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link>. Over the subsequent century, a series of economic crises, military dictatorships, populist policies, and institutional failures eroded that prosperity.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Argentina&apos;s chronic <Link href="/inflation-by-country" className="text-[#0066cc] hover:underline">inflation</Link> — which exceeded 100% annually in recent years — is the defining feature of its economy. This inflation has been driven by persistent fiscal deficits financed by money printing, multiple currency devaluations, and failed stabilization attempts. The country has defaulted on its sovereign debt nine times, most recently in 2020. Radical economic reform under President Milei (elected 2023) — including aggressive fiscal austerity, currency devaluation, and deregulation — represents the latest attempt to break the cycle.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Despite macro instability, Argentina has genuine economic strengths. It is the world&apos;s third-largest soybean exporter, a major beef and wine producer, has a thriving tech startup ecosystem (MercadoLibre, Globant), and the Vaca Muerta shale gas formation could make it a major energy exporter. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} understates real living standards due to peso weakness. The economy&apos;s future depends on whether current reforms can establish the macro stability that has eluded Argentina for over a century.</p>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/argentina', label: 'Full Profile →' }, { href: '/brazil-economy', label: 'Brazil Economy' }, { href: '/mexico-economy', label: 'Mexico Economy' }, { href: '/inflation-by-country', label: 'Inflation Rates' }, { href: '/debt-by-country', label: 'Debt by Country' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
