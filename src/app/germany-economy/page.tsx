import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Germany Economy 2026 — GDP, Trade, Industry & Key Data | Statistics of the World',
  description: 'Germany economy 2026: $5.4T+ GDP, world\'s third-largest economy. Growth forecast cut to 0.5% (April 2026) amid Middle East energy shock. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/germany-economy' },
  openGraph: {
    title: 'Germany Economy 2026 — GDP, Trade & Key Economic Data',
    description: 'Germany is the world\'s third-largest economy at $5.4T+ GDP. Growth forecast slashed to 0.5% in April 2026 as Middle East tensions drove energy prices higher. 440+ indicators from IMF & World Bank.',
    url: 'https://statisticsoftheworld.com/germany-economy',
    type: 'website',
  },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Germany', item: 'https://statisticsoftheworld.com/country/germany' },
          { '@type': 'ListItem', position: 3, name: 'Germany Economy', item: 'https://statisticsoftheworld.com/germany-economy' },
        ],
      },
      {
        '@type': 'WebPage',
        name: `Germany Economy ${year} — GDP, Trade & Key Data`,
        url: 'https://statisticsoftheworld.com/germany-economy',
        description: `Germany economy ${year}: GDP, growth rate, inflation, unemployment, trade surplus, and 440+ indicators. Europe's largest economy. IMF & World Bank data.`,
        dateModified: new Date().toISOString().split('T')[0],
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'Article',
        headline: `Germany Economy ${year}`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is Germany's GDP in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `Germany's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Europe's largest economy and the world's third-largest behind the United States and China. Source: IMF World Economic Outlook.` },
          },
          {
            '@type': 'Question',
            name: 'Is Germany the world\'s third-largest economy in 2026?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. Per IMF April 2026 World Economic Outlook data, Germany is the third-largest economy globally by nominal GDP, behind the United States (#1) and China (#2), and ahead of Japan (#4) and the United Kingdom (#5).' },
          },
          {
            '@type': 'Question',
            name: 'Why did Germany cut its 2026 GDP growth forecast?',
            acceptedAnswer: { '@type': 'Answer', text: 'Germany\'s government slashed its 2026 growth forecast from 1% to 0.5% in April 2026, citing escalating Middle East tensions that pushed energy prices higher. Germany relies heavily on liquefied natural gas imports following the loss of cheap Russian pipeline gas in 2022. Higher energy costs squeeze industrial output and reduce German export competitiveness, particularly in energy-intensive sectors like chemicals and metals.' },
          },
          {
            '@type': 'Question',
            name: `What is Germany's GDP per capita in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `Germany's GDP per capita is approximately ${formatValue(gdpPerCapita?.value, 'currency')} in ${year}. This places Germany among the wealthiest large economies globally, though it trails smaller high-income nations like Luxembourg, Switzerland, and the Nordic countries on a per-capita basis.` },
          },
          {
            '@type': 'Question',
            name: 'How are US tariffs affecting the German economy in 2026?',
            acceptedAnswer: { '@type': 'Answer', text: 'US tariffs pose a significant risk to Germany\'s export-driven economy. The German automotive sector — Volkswagen, BMW, and Mercedes-Benz together export roughly €40 billion in vehicles to the United States annually. A 25% tariff on EU auto imports would directly hit these manufacturers. Germany\'s machinery and chemicals sectors face similar exposure. The German government has engaged in EU-level negotiations seeking a bilateral framework to limit tariff damage.' },
          },
        ],
      },
    ],
  };

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
        <p className="text-[15px] text-[#64748b] mb-6">Europe&apos;s largest economy · Third-largest globally · Source: IMF &amp; World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
            Germany is Europe&apos;s largest economy and the world&apos;s third-largest at {formatValue(gdp?.value, 'currency')}. The German economic model — &quot;Modell Deutschland&quot; — is built on export-driven manufacturing, with automotive (Volkswagen, BMW, Mercedes-Benz), chemicals (BASF, Bayer), industrial machinery (Siemens), and precision engineering forming the backbone of industrial output. Germany consistently runs one of the world&apos;s largest trade surpluses, exporting roughly $1.5 trillion in goods annually.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The German economy faces structural headwinds that have intensified since 2022. The loss of cheap Russian natural gas — which powered Germany&apos;s industrial base for decades — forced an emergency energy transition that raised costs for manufacturers. Germany&apos;s Mittelstand (small and medium enterprises) face pressure from Chinese competition in exactly the sectors where Germany excels. The automotive industry is navigating a costly transition from internal combustion engines to electric vehicles, where Chinese competitors like BYD have established a lead. GDP growth of {formatValue(gdpGrowth?.value, 'percent', 1)} reflects these challenges.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Despite these challenges, Germany maintains key strengths: a highly skilled workforce, world-class engineering education (the dual apprenticeship system), strong institutions, and a central position in EU supply chains. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is moderate by developed-country standards, reflecting Germany&apos;s fiscal conservatism. Unemployment at {formatValue(unemployment?.value, 'percent', 1)} remains low by European standards. GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} places Germany among the wealthiest large economies.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            In April 2026, Germany&apos;s government slashed its full-year growth forecast from 1% to just 0.5%, citing escalating Middle East tensions that drove energy prices sharply higher — the same vulnerability that crippled output after the 2022 Russian gas cutoff. The forecast cut underscores how exposed Germany&apos;s industrial base remains to energy price shocks. On the fiscal side, Germany is navigating a historic pivot: the constitutional &quot;debt brake&quot; was modified in early 2026 to allow a €500 billion Sondervermögen (special fund) for defense and infrastructure — the largest single spending authorization in postwar German history, covering NATO commitments, rail, roads, and energy transition investment. Whether this fiscal stimulus can offset cyclical weakness depends largely on whether energy costs stabilize and Chinese consumer demand for German goods recovers through 2026 and into 2027.
          </p>
        </div>

        <div className="max-w-[800px] mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `What is Germany's GDP in ${year}?`,
                a: `Germany's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Europe's largest economy and the world's third-largest. Source: IMF World Economic Outlook April 2026.`,
              },
              {
                q: 'Is Germany the world\'s third-largest economy?',
                a: 'Yes, per IMF April 2026 WEO data. Germany is #3 globally by nominal GDP, behind the United States (#1) and China (#2), and ahead of Japan (#4) and the United Kingdom (#5).',
              },
              {
                q: 'Why did Germany cut its 2026 growth forecast?',
                a: 'Germany halved its 2026 GDP growth forecast from 1% to 0.5% in April 2026. The government cited escalating Middle East tensions that pushed energy prices higher. Germany\'s industry relies heavily on LNG imports after losing access to cheap Russian pipeline gas in 2022, making it acutely sensitive to energy market disruptions.',
              },
              {
                q: `What is Germany's GDP per capita in ${year}?`,
                a: `Germany's GDP per capita is approximately ${formatValue(gdpPerCapita?.value, 'currency')} in ${year}. This places Germany among the world's wealthiest large economies, though behind smaller high-income nations like Luxembourg, Switzerland, and the Nordic countries.`,
              },
              {
                q: 'How are US tariffs affecting the German economy in 2026?',
                a: 'US tariffs are a significant risk for Germany\'s export-driven economy. German automakers (VW, BMW, Mercedes-Benz) export roughly €40B+ in vehicles to the US annually. A 25% US tariff on EU auto imports would directly hit these manufacturers. Germany\'s chemicals and machinery sectors face similar exposure. The EU is negotiating a bilateral framework with Washington to limit the damage.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="border border-[#d5dce6] rounded-xl p-4">
                <summary className="font-semibold text-[15px] text-[#0d1b2a] cursor-pointer">{q}</summary>
                <p className="text-[14px] text-[#374151] leading-[1.7] mt-2">{a}</p>
              </details>
            ))}
          </div>
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
          <h2 className="text-[16px] font-bold text-[#0d1b2a] mb-4">Related Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/germany/gdp', label: 'Germany GDP' },
              { href: '/country/germany/gdp-growth', label: 'Germany GDP Growth' },
              { href: '/eu-economy', label: 'EU Economy' },
              { href: '/largest-economies', label: 'Largest Economies' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' },
              { href: '/france-economy', label: 'France Economy' },
              { href: '/country/germany', label: 'Full Germany Profile →' },
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
