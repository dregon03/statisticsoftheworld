import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'France Economy 2026 — GDP, Growth, Industry & Key Data | Statistics of the World',
  description: 'France economy 2026: EU\'s second-largest economy, world\'s seventh-largest. Luxury goods (LVMH), Airbus, nuclear energy (70%+ electricity), tourism leader. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/france-economy' },
  openGraph: {
    title: 'France Economy 2026 — GDP, Growth & Key Economic Data',
    description: 'France is the EU\'s second-largest and world\'s seventh-largest economy in 2026. Global leader in luxury (LVMH, Hermès), aerospace (Airbus), nuclear energy (70%+ of electricity), and tourism (90M+ visitors). 440+ indicators from IMF & World Bank.',
    url: 'https://statisticsoftheworld.com/france-economy',
    type: 'website',
  },
};

export default async function FranceEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('FRA');
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
          { '@type': 'ListItem', position: 2, name: 'France', item: 'https://statisticsoftheworld.com/country/france' },
          { '@type': 'ListItem', position: 3, name: 'France Economy', item: 'https://statisticsoftheworld.com/france-economy' },
        ],
      },
      {
        '@type': 'WebPage',
        name: `France Economy ${year} — GDP, Growth & Key Data`,
        url: 'https://statisticsoftheworld.com/france-economy',
        description: `French economy ${year}: GDP, growth, inflation, unemployment, trade, and 440+ indicators. EU's second-largest economy. IMF & World Bank data.`,
        dateModified: new Date().toISOString().split('T')[0],
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'Article',
        headline: `France Economy ${year}`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is France's GDP in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `France's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the EU's second-largest economy (after Germany) and the world's seventh-largest. Source: IMF World Economic Outlook April 2026.` },
          },
          {
            '@type': 'Question',
            name: 'Why is France\'s unemployment rate higher than other G7 economies?',
            acceptedAnswer: { '@type': 'Answer', text: `France's unemployment rate of ${formatValue(unemployment?.value, 'percent', 1)} is structurally higher than Germany, the UK, or the US due to several factors: rigid labor market regulations that make hiring and firing costly (discouraging risk), a high minimum wage (SMIC) that prices out lower-productivity workers, generous unemployment benefits that extend job search periods, and a skills mismatch between the education system and employer demand. Youth unemployment is particularly elevated, typically 15–20%.` },
          },
          {
            '@type': 'Question',
            name: 'What are France\'s key export industries?',
            acceptedAnswer: { '@type': 'Answer', text: 'France\'s top export sectors are: aerospace and defense (Airbus supplies ~50% of global commercial aircraft; Safran, Dassault, Thales), luxury goods and fashion (LVMH, Hermès, Kering, L\'Oréal — France dominates the global luxury market), agriculture and food (wine, spirits, dairy — the EU\'s largest agricultural producer), nuclear technology (EDF, Framatome supply reactors and fuel worldwide), and pharmaceuticals (Sanofi). Tourism is France\'s largest services export, with 90M+ visitors annually making it the world\'s most-visited country.' },
          },
          {
            '@type': 'Question',
            name: 'What is France\'s nuclear energy advantage?',
            acceptedAnswer: { '@type': 'Answer', text: 'France generates over 70% of its electricity from nuclear power — the highest share among major economies. This provides France a significant competitive advantage over Germany, whose 2022 Russian gas cutoff triggered a severe energy crisis that raised industrial costs. France\'s electricity prices for industry are among the lowest in Europe. President Macron announced in 2022 a €52B program to build six new EPR2 reactors (construction starting 2026), reinforcing nuclear as France\'s long-term energy strategy.' },
          },
          {
            '@type': 'Question',
            name: 'How are US tariffs affecting the French economy in 2026?',
            acceptedAnswer: { '@type': 'Answer', text: 'France faces US tariffs primarily through two channels: Airbus (France-Germany JV) faces potential tariff exposure on US aircraft deliveries, though Airbus has a US final assembly line in Mobile, Alabama that partially insulates it. Luxury goods (LVMH, Hermès, Kering) are technically subject to EU tariffs, but high-income US consumers absorb premium prices better than mass-market buyers — making luxury relatively tariff-resilient. Agricultural exports (wine, spirits, cheese) are more vulnerable to US tariff action. Overall, France\'s fiscal exposure to US tariffs is estimated at 0.2–0.4 percentage points of GDP.' },
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
          <Link href="/country/france" className="hover:text-gray-600 transition">France</Link><span className="mx-2">/</span>
          <span className="text-gray-600">France Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The French Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">EU&apos;s second-largest economy · Seventh-largest globally · Source: IMF &amp; World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">France Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            France is the European Union&apos;s second-largest economy and the world&apos;s seventh-largest with a GDP of {formatValue(gdp?.value, 'currency')}. The French economy is uniquely diversified: a global leader in luxury goods (LVMH, Hermès, Kering), aerospace (Airbus, Safran, Dassault), nuclear energy (70%+ of electricity from nuclear), tourism (the world&apos;s most visited country at 90M+ visitors annually), and agriculture (the EU&apos;s largest agricultural producer).
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            France&apos;s economic model features a larger state sector than most G7 peers — government spending exceeds 55% of GDP, funding a comprehensive welfare state with generous pensions, universal healthcare, and strong labor protections. This creates a trade-off: French workers are highly productive per hour worked (among the highest in Europe) but work fewer hours and have lower labor force participation. Unemployment at {formatValue(unemployment?.value, 'percent', 1)} has been a persistent challenge, particularly among youth, due to labor market rigidity and the high cost of payroll taxes that discourage entry-level hiring.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Recent reforms have aimed to improve competitiveness through labor market flexibility, tax cuts for businesses, and investment in technology and startups (the &quot;La French Tech&quot; ecosystem). GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} and life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'among the highest'} reflect a high quality of life. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is elevated and a source of fiscal concern; France was placed under the EU&apos;s Excessive Deficit Procedure in 2024 after its fiscal deficit exceeded 5% of GDP.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            In 2026, France holds a distinctive competitive advantage over its EU neighbors: energy security. With 70%+ nuclear electricity generation, France is largely insulated from the natural gas price spikes that have repeatedly hammered German industrial output. While Germany slashed its growth forecast to 0.5% partly due to Middle East energy shocks, France&apos;s electricity-intensive industries — aluminum smelting, chemicals, data centers — benefit from stable, low-cost power. On the tariff front, Airbus faces potential US exposure but its Mobile, Alabama assembly line provides partial protection. French luxury goods (LVMH, Hermès) are structurally tariff-resilient because high-income US buyers absorb premium pricing. The Paris tech ecosystem is producing more unicorns per year than at any point in French history, and Macron&apos;s AI investment agenda (€109B AI campus announced in 2025) positions France as a credible European tech hub alongside London.
          </p>
        </div>

        <div className="max-w-[800px] mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `What is France's GDP in ${year}?`,
                a: `France's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the EU's second-largest economy and the world's seventh-largest. Source: IMF World Economic Outlook April 2026.`,
              },
              {
                q: 'Why is France\'s unemployment higher than other G7 economies?',
                a: `France's unemployment rate of ${formatValue(unemployment?.value, 'percent', 1)} is structurally elevated due to rigid labor market rules that raise the cost of hiring and firing, a high minimum wage (SMIC) that prices out lower-productivity workers, and generous unemployment benefits that extend job search periods. Youth unemployment is typically 15–20%.`,
              },
              {
                q: 'What are France\'s key export industries?',
                a: 'France\'s top exports: aerospace (Airbus ~50% of global commercial aircraft), luxury goods (LVMH, Hermès, Kering, L\'Oréal), agriculture (wine, spirits, dairy — EU\'s largest agricultural producer), nuclear technology (EDF, Framatome), and pharmaceuticals (Sanofi). Tourism is France\'s largest services export at 90M+ visitors annually.',
              },
              {
                q: 'What is France\'s nuclear energy advantage?',
                a: 'France generates 70%+ of its electricity from nuclear power — the highest share among major economies. This gives French industry among the lowest electricity prices in Europe and insulates France from gas price shocks that have severely hurt Germany. Macron announced €52B in new nuclear capacity (six EPR2 reactors) starting construction in 2026.',
              },
              {
                q: 'How are US tariffs affecting France in 2026?',
                a: 'France\'s main US tariff exposures are Airbus aircraft (partially offset by its Mobile, Alabama assembly line) and agricultural exports like wine and spirits. Luxury goods are structurally resilient — high-income US consumers absorb premium pricing. Overall US tariff drag on French GDP is estimated at 0.2–0.4 percentage points.',
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
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare France&apos;s Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { href: '/compare/united-states-vs-france', label: 'France vs US' },
              { href: '/compare/germany-vs-france', label: 'France vs Germany' },
              { href: '/compare/united-kingdom-vs-france', label: 'France vs UK' },
              { href: '/compare/france-vs-italy', label: 'France vs Italy' },
              { href: '/compare/france-vs-spain', label: 'France vs Spain' },
              { href: '/compare/china-vs-france', label: 'France vs China' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[16px] font-bold text-[#0d1b2a] mb-4">Related Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/france/gdp', label: 'France GDP' },
              { href: '/country/france/inflation-rate', label: 'France Inflation' },
              { href: '/germany-economy', label: 'Germany Economy' },
              { href: '/uk-economy', label: 'UK Economy' },
              { href: '/eu-economy', label: 'EU Economy' },
              { href: '/debt-by-country', label: 'Govt Debt by Country' },
              { href: '/trade-by-country', label: 'Trade by Country' },
              { href: '/country/france', label: 'Full France Profile →' },
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
