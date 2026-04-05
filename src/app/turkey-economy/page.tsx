import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Turkey Economy 2026 — GDP, Inflation, Lira & Key Data',
  description: 'Turkey economy in 2026: GDP, growth, inflation, currency, and key indicators. A G20 economy bridging Europe and Asia. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/turkey-economy' },
};

export default async function TurkeyEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('TUR');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Turkey Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Turkey's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Turkey's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}. Turkey is a G20 economy and the largest economy in the Middle East/North Africa region by some measures. Source: IMF.` } },
      { '@type': 'Question', name: `What is Turkey's inflation rate?`, acceptedAnswer: { '@type': 'Answer', text: `Turkey's inflation rate is ${formatValue(inflation?.value, 'percent', 1)} in ${year}. Turkey has experienced chronic high inflation driven by unorthodox monetary policy, currency depreciation, and loose fiscal policy. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/turkey" className="hover:text-gray-600 transition">Turkey</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Turkey Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Turkey Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">G20 economy bridging Europe and Asia · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Turkey Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Turkey occupies a unique position straddling Europe and Asia, with a large, diversified economy that includes manufacturing, agriculture, tourism, construction, and a growing services sector. Istanbul is one of the world&apos;s great commercial cities and Turkey&apos;s economic engine. The country is a major automotive manufacturer (producing vehicles for European brands like Ford, Fiat, and Renault), a leading textile and apparel exporter, and hosts over 50 million tourists annually.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Turkey&apos;s most prominent economic challenge has been persistent high <Link href="/inflation-by-country" className="text-[#0066cc] hover:underline">inflation</Link>, which peaked at over 85% in late 2022. The Turkish lira has lost more than 80% of its value against the dollar since 2018, driven by unorthodox monetary policy (the government resisted interest rate increases despite soaring inflation), geopolitical uncertainty, and large current account deficits. In 2023, Turkey returned to conventional monetary policy with aggressive rate hikes, which have begun to stabilize the currency and slow inflation.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Despite macro instability, Turkey&apos;s underlying economic fundamentals have strengths: a young and growing population of over 85 million (unlike aging European neighbors), a strategic location for logistics and trade, a diversified manufacturing base, and a dynamic entrepreneurial culture. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} understates living standards due to lira weakness — in PPP terms, Turkey ranks significantly higher. The economy&apos;s trajectory depends on whether orthodox economic policy persists and whether structural reforms address the <Link href="/ranking/current-account" className="text-[#0066cc] hover:underline">current account</Link> deficit and institutional quality.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Turkey</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/turkey-vs-mexico', label: 'vs Mexico' },
              { href: '/compare/turkey-vs-brazil', label: 'vs Brazil' },
              { href: '/compare/russia-vs-india', label: 'Russia vs India' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/turkey', label: 'Full Profile →' }, { href: '/mexico-economy', label: 'Mexico Economy' }, { href: '/brazil-economy', label: 'Brazil Economy' }, { href: '/inflation-by-country', label: 'Inflation Rates' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
