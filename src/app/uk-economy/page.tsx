import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'UK Economy 2026 — GDP, Growth, Brexit Impact & Key Data',
  description: 'The United Kingdom economy in 2026: GDP, growth, inflation, unemployment, government debt, and 440+ indicators. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/uk-economy' },
};

export default async function UKEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('GBR');
  const gdp = indicators['IMF.NGDPD'];
  const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC'];
  const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR'];
  const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL'];
  const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `UK Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is the UK's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The UK's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the world's sixth-largest economy. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/united-kingdom" className="hover:text-gray-600 transition">United Kingdom</Link><span className="mx-2">/</span>
          <span className="text-gray-600">UK Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The United Kingdom Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">The world&apos;s sixth-largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'GDP (Nominal)', value: formatValue(gdp?.value, 'currency') },
            { label: 'GDP Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) },
            { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) },
            { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) },
            { label: 'GDP per Capita', value: formatValue(gdpPerCapita?.value, 'currency') },
            { label: 'Population', value: formatValue(pop?.value, 'number') },
            { label: 'Govt Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) },
            { label: 'Life Expectancy', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} yrs` : '—' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5">
              <div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div>
              <div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div>
            </div>
          ))}
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">UK Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The United Kingdom has a GDP of {formatValue(gdp?.value, 'currency')}, making it the world&apos;s sixth-largest economy. The UK economy is overwhelmingly services-based — financial services, professional services, technology, and creative industries account for over 80% of GDP. London is one of the world&apos;s two dominant financial centers alongside New York, and the City of London remains Europe&apos;s largest financial hub despite Brexit.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Brexit has been the defining economic event for the UK in recent years. Leaving the EU single market and customs union in 2020 introduced new trade barriers, particularly for goods exports to Europe. The UK has experienced higher inflation than most G7 peers, partly attributed to labor shortages in sectors that previously relied on EU workers (agriculture, hospitality, logistics). GDP growth of {formatValue(gdpGrowth?.value, 'percent', 1)} reflects the ongoing adjustment to the new trading relationship.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The UK maintains significant competitive advantages: the English language (the global business lingua franca), world-class universities (Oxford, Cambridge, Imperial), a flexible labor market, strong property rights, and a time zone that bridges Asian and American business hours. The UK&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} remains among the highest in Europe. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is elevated following pandemic spending, and the Bank of England has navigated aggressive rate hikes to combat inflation.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare the UK Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-united-kingdom', label: 'UK vs US' },
              { href: '/compare/united-kingdom-vs-france', label: 'UK vs France' },
              { href: '/compare/germany-vs-united-kingdom', label: 'UK vs Germany' },
              { href: '/compare/united-kingdom-vs-canada', label: 'UK vs Canada' },
              { href: '/compare/india-vs-united-kingdom', label: 'UK vs India' },
              { href: '/compare/japan-vs-united-kingdom', label: 'UK vs Japan' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/united-kingdom/gdp', label: 'UK GDP' },
              { href: '/country/united-kingdom/inflation-rate', label: 'UK Inflation' },
              { href: '/country/united-kingdom', label: 'Full UK Profile →' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/ranking/gdp', label: 'GDP Rankings' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
