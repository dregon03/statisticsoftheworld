import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'UK Economy 2026 — GDP, Growth, Brexit Impact & Key Data | Statistics of the World',
  description: 'United Kingdom economy 2026: world\'s fifth-largest economy, GDP per capita ~$61K, 0.6–1.1% growth. Brexit trade costs, Bank of England rate cuts, US-UK trade deal. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/uk-economy' },
  openGraph: {
    title: 'UK Economy 2026 — GDP, Growth, Brexit & Key Economic Data',
    description: 'The UK is the world\'s fifth-largest economy in 2026 with GDP per capita ~$61,000. Services-heavy economy (80%+ of GDP) provides insulation from goods tariffs. Growth forecast 0.6–1.1%. 440+ indicators from IMF & World Bank.',
    url: 'https://statisticsoftheworld.com/uk-economy',
    type: 'website',
  },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'United Kingdom', item: 'https://statisticsoftheworld.com/country/united-kingdom' },
          { '@type': 'ListItem', position: 3, name: 'UK Economy', item: 'https://statisticsoftheworld.com/uk-economy' },
        ],
      },
      {
        '@type': 'WebPage',
        name: `UK Economy ${year} — GDP, Growth & Key Data`,
        url: 'https://statisticsoftheworld.com/uk-economy',
        description: `United Kingdom economy ${year}: GDP, growth, inflation, unemployment, government debt, and 440+ indicators. World's fifth-largest economy. IMF & World Bank data.`,
        dateModified: new Date().toISOString().split('T')[0],
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'Article',
        headline: `UK Economy ${year}`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the UK's GDP in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `The UK's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the world's fifth-largest economy per IMF April 2026 World Economic Outlook data. Source: IMF.` },
          },
          {
            '@type': 'Question',
            name: 'Is the UK a top 5 economy in 2026?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. The United Kingdom is the world\'s fifth-largest economy by nominal GDP in 2026, per IMF April 2026 WEO data. The global ranking is: United States (#1), China (#2), Germany (#3), Japan (#4), United Kingdom (#5), India (#6), France (#7).' },
          },
          {
            '@type': 'Question',
            name: `What is UK GDP per capita in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `UK GDP per capita is approximately ${formatValue(gdpPerCapita?.value, 'currency')} in ${year} — roughly $61,000 — placing the UK among the wealthiest large economies globally. This is above the G7 average but below the United States (~$85,000) and smaller high-income economies like Luxembourg and Switzerland.` },
          },
          {
            '@type': 'Question',
            name: 'What is the UK economic growth rate in 2026?',
            acceptedAnswer: { '@type': 'Answer', text: 'UK GDP growth in 2026 is forecast at 0.6–1.1%, depending on the source. The UK Office for Budget Responsibility (OBR) projected 1.1% growth in March 2026. Independent forecasters surveyed by the Treasury averaged 0.6%. The EY ITEM Club and OECD forecasts fall between these figures at 0.8–0.9%.' },
          },
          {
            '@type': 'Question',
            name: 'How are US tariffs affecting the UK economy in 2026?',
            acceptedAnswer: { '@type': 'Answer', text: 'The UK faces a 10% baseline US tariff on goods exports — lower than the 20–145% rates applied to the EU and China. Crucially, the UK\'s economy is over 80% services-based, and financial services, professional services, and tech consulting face no goods tariffs. The Labour government has been negotiating a UK-US trade deal that could reduce tariffs on UK automotive and pharmaceutical exports. The overall tariff impact on UK GDP is estimated at a modest 0.1–0.3 percentage point drag.' },
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
          <Link href="/country/united-kingdom" className="hover:text-gray-600 transition">United Kingdom</Link><span className="mx-2">/</span>
          <span className="text-gray-600">UK Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The United Kingdom Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">The world&apos;s fifth-largest economy · Source: IMF &amp; World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
            The United Kingdom has a GDP of {formatValue(gdp?.value, 'currency')}, making it the world&apos;s fifth-largest economy per IMF April 2026 data. The UK economy is overwhelmingly services-based — financial services, professional services, technology, and creative industries account for over 80% of GDP. London is one of the world&apos;s two dominant financial centers alongside New York, and the City of London remains Europe&apos;s largest financial hub despite Brexit.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Brexit has been the defining economic event for the UK in recent years. Leaving the EU single market and customs union in 2020 introduced new trade barriers, particularly for goods exports to Europe. The UK experienced higher inflation than most G7 peers in 2022–2024, partly attributed to labor shortages in sectors that previously relied on EU workers (agriculture, hospitality, logistics). GDP growth of {formatValue(gdpGrowth?.value, 'percent', 1)} reflects the ongoing adjustment to the new trading relationship and broader global headwinds.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The UK maintains significant competitive advantages: the English language (the global business lingua franca), world-class universities (Oxford, Cambridge, Imperial), a flexible labor market, strong property rights, and a time zone that bridges Asian and American business hours. The UK&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} remains among the highest in Europe. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is elevated following pandemic spending, though the Bank of England navigated aggressive rate hikes to bring inflation back toward its 2% target.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            In 2026, the UK economy is navigating a more constructive environment. The Bank of England has entered a rate-cutting cycle as inflation fell back toward target, supporting household finances and the housing market. The Labour government is pursuing a dual strategy: fiscal consolidation to stabilize debt-to-GDP, alongside targeted investment in clean energy and NHS capacity. On trade, UK goods face only a 10% US baseline tariff — significantly lower than EU or Chinese rates — and the UK&apos;s services-heavy economy provides structural insulation from goods tariff shocks that hit Germany&apos;s industrial model harder. The OBR forecasts 1.1% GDP growth for 2026, with the UK-EU trade reset under Labour offering a further upside if agri-food and mobility barriers are reduced.
          </p>
        </div>

        <div className="max-w-[800px] mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `What is the UK's GDP in ${year}?`,
                a: `The UK's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the world's fifth-largest economy. Source: IMF World Economic Outlook April 2026.`,
              },
              {
                q: 'Is the UK a top 5 economy in 2026?',
                a: 'Yes. The UK is #5 globally by nominal GDP per IMF April 2026 WEO. The ranking: United States (#1), China (#2), Germany (#3), Japan (#4), United Kingdom (#5), India (#6), France (#7).',
              },
              {
                q: `What is UK GDP per capita in ${year}?`,
                a: `UK GDP per capita is approximately ${formatValue(gdpPerCapita?.value, 'currency')} — around $61,000 in 2026 — placing the UK among the wealthiest large economies. It is above the G7 average but below the United States (~$85,000) and smaller high-income economies like Luxembourg.`,
              },
              {
                q: 'What is the UK economic growth rate in 2026?',
                a: 'UK GDP growth in 2026 is forecast at 0.6–1.1%. The OBR projected 1.1% in March 2026; the Treasury\'s independent forecaster survey averaged 0.6%; the OECD forecast 0.8%. The range reflects uncertainty from global tariff policies and energy prices.',
              },
              {
                q: 'How are US tariffs affecting the UK economy in 2026?',
                a: 'The UK faces a 10% US baseline goods tariff — far lower than EU rates. More importantly, the UK economy is over 80% services-based, and services (financial, professional, tech) are not subject to goods tariffs. The overall drag on UK GDP from US tariffs is estimated at just 0.1–0.3 percentage points.',
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
          <h2 className="text-[16px] font-bold text-[#0d1b2a] mb-4">Related Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/united-kingdom/gdp', label: 'UK GDP' },
              { href: '/country/united-kingdom/inflation-rate', label: 'UK Inflation' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/germany-economy', label: 'Germany Economy' },
              { href: '/france-economy', label: 'France Economy' },
              { href: '/debt-by-country', label: 'Govt Debt by Country' },
              { href: '/inflation-by-country', label: 'Inflation by Country' },
              { href: '/country/united-kingdom', label: 'Full UK Profile →' },
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
