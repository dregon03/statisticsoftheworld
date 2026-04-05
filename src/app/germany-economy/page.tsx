import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Germany Economy 2026 — GDP, Trade, Industry & Key Data',
  description: 'The German economy in 2026: GDP, growth rate, inflation, unemployment, trade surplus, and 440+ indicators. Europe\'s largest economy. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/germany-economy' },
};

export default async function GermanyEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('DEU');
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
    { '@type': 'Article', headline: `Germany Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Germany's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Germany's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Europe's largest economy and the world's third-largest. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/germany" className="hover:text-gray-600 transition">Germany</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Germany Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The German Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Europe&apos;s largest economy and the world&apos;s third-largest · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Germany Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Germany is Europe&apos;s largest economy and the world&apos;s third-largest at {formatValue(gdp?.value, 'currency')}. The German economic model — &quot;Modell Deutschland&quot; — is built on export-driven manufacturing, with automotive (Volkswagen, BMW, Mercedes-Benz), chemicals (BASF, Bayer), industrial machinery (Siemens), and precision engineering forming the backbone of its industrial output. Germany consistently runs one of the world&apos;s largest trade surpluses, exporting roughly $1.5 trillion in goods annually.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The German economy faces structural headwinds that have intensified since 2022. The loss of cheap Russian natural gas — which powered Germany&apos;s industrial base for decades — forced an emergency energy transition that raised costs for manufacturers. Germany&apos;s Mittelstand (small and medium enterprises) face pressure from Chinese competition in exactly the sectors where Germany excels. The automotive industry is navigating a costly transition from internal combustion engines to electric vehicles, where Chinese competitors like BYD have established a lead. GDP growth of {formatValue(gdpGrowth?.value, 'percent', 1)} reflects these challenges.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Despite these challenges, Germany maintains key strengths: a highly skilled workforce, world-class engineering education (the dual apprenticeship system), strong institutions, and a central position in EU supply chains. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is moderate by developed-country standards, reflecting Germany&apos;s fiscal conservatism (the constitutional &quot;debt brake&quot;). Unemployment at {formatValue(unemployment?.value, 'percent', 1)} remains low by European standards. GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} places Germany among the wealthiest large economies.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Germany&apos;s Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-germany', label: 'Germany vs US' },
              { href: '/compare/germany-vs-france', label: 'Germany vs France' },
              { href: '/compare/germany-vs-united-kingdom', label: 'Germany vs UK' },
              { href: '/compare/germany-vs-japan', label: 'Germany vs Japan' },
              { href: '/compare/germany-vs-china', label: 'Germany vs China' },
              { href: '/compare/germany-vs-italy', label: 'Germany vs Italy' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/germany/gdp', label: 'Germany GDP' },
              { href: '/country/germany/gdp-growth', label: 'Germany GDP Growth' },
              { href: '/country/germany', label: 'Full Germany Profile →' },
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
