import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, getIndicatorForAllCountries, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'US Economy 2026 — GDP, Tariff Impact, Inflation & Key Data',
  description: 'US economy 2026: world\'s largest at $32T+ GDP, 2.1% growth, above-target inflation. One year after Liberation Day tariffs — what changed? IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/us-economy' },
  openGraph: {
    title: 'US Economy 2026 — GDP, Tariff Impact & Key Statistics',
    description: 'The US economy one year after Liberation Day tariffs: $32T GDP, inflation, trade, and labor market data from IMF & World Bank.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/us-economy',
    type: 'website',
  },
};

export default async function USEconomyPage() {
  const [indicators, gdpRanking] = await Promise.all([
    getAllIndicatorsForCountry('USA'),
    getIndicatorForAllCountries('IMF.NGDPD'),
  ]);

  const gdp = indicators['IMF.NGDPD'];
  const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC'];
  const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR'];
  const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL'];
  const lifeExp = indicators['SP.DYN.LE00.IN'];
  const currentAccount = indicators['IMF.BCA_NGDPD'];

  const year = gdp?.year || '2026';
  const worldGdp = gdpRanking.reduce((s, d) => s + (d.value || 0), 0);
  const usShare = gdp?.value && worldGdp ? ((gdp.value / worldGdp) * 100).toFixed(1) : '26';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'United States', item: 'https://statisticsoftheworld.com/country/united-states' },
          { '@type': 'ListItem', position: 3, name: 'US Economy', item: 'https://statisticsoftheworld.com/us-economy' },
        ],
      },
      {
        '@type': 'Article',
        headline: `United States Economy ${year} — GDP, Growth & Key Statistics`,
        description: `The US economy in ${year}: ${formatValue(gdp?.value, 'currency')} GDP, ${formatValue(gdpGrowth?.value, 'percent', 1)} growth, ${formatValue(inflation?.value, 'percent', 1)} inflation.`,
        datePublished: `${year}-01-01`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is the US GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The United States GDP in ${year} is approximately ${formatValue(gdp?.value, 'currency')} in nominal terms, making it the world's largest economy. The US accounts for roughly ${usShare}% of global GDP. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `What is the US inflation rate in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The US inflation rate in ${year} is ${formatValue(inflation?.value, 'percent', 1)}, as measured by the consumer price index. The Federal Reserve targets 2% annual inflation. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `What is the US unemployment rate in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The US unemployment rate in ${year} is ${formatValue(unemployment?.value, 'percent', 1)}. The US labor market has ${(unemployment?.value || 0) < 5 ? 'remained relatively tight' : 'shown signs of softening'}. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: 'What is the US national debt?', acceptedAnswer: { '@type': 'Answer', text: `US government debt stands at ${formatValue(debt?.value, 'percent', 1)} of GDP in ${year}. Federal debt has increased significantly since 2020 due to pandemic-era fiscal stimulus. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: 'Is the US the largest economy in the world?', acceptedAnswer: { '@type': 'Answer', text: `Yes, the United States is the world's largest economy by nominal GDP at ${formatValue(gdp?.value, 'currency')} in ${year}. China is second. In purchasing power parity (PPP) terms, China's economy is larger. Source: IMF.` } },
          { '@type': 'Question', name: `What is the impact of tariffs on the US economy in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The tariffs announced in April 2025 — including 145%+ levies on Chinese goods and baseline 10% tariffs on imports from most countries — have had a mixed economic impact. US manufacturing has seen some re-shoring activity, but consumers face higher prices on imported goods, contributing to above-target inflation. The Federal Reserve has had to balance tariff-driven price pressures against slowing growth. The IMF estimates the tariff shock reduced US growth by roughly 0.3–0.5 percentage points in 2025–2026. Source: IMF World Economic Outlook.` } },
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
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/country/united-states" className="hover:text-gray-600 transition">United States</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">US Economy</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The United States Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          Comprehensive data on the world&apos;s largest economy · Source: IMF World Economic Outlook & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        {/* Key metrics */}
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

        {/* Editorial */}
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">US Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The United States has the world&apos;s largest economy by nominal GDP at {formatValue(gdp?.value, 'currency')}, accounting for approximately {usShare}% of global output. The American economy is driven by technology (Apple, Microsoft, Alphabet, Amazon, Meta), financial services (Wall Street remains the world&apos;s dominant capital market), healthcare, and consumer spending. The US dollar serves as the world&apos;s primary reserve currency, giving the Federal Reserve outsized influence on global monetary conditions.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Real GDP growth in {year} is {formatValue(gdpGrowth?.value, 'percent', 1)}, reflecting the US economy&apos;s resilience despite elevated interest rates. The Federal Reserve has been navigating a delicate balance between controlling inflation — which peaked at 9.1% in June 2022 — and avoiding a recession. The labor market has remained historically tight, with unemployment at {formatValue(unemployment?.value, 'percent', 1)}, though some sectors have seen layoffs. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP remains elevated following pandemic-era spending.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The defining policy shift of {year} for the US economy is the sweeping tariff regime that took effect in April 2025. The &quot;Liberation Day&quot; tariffs imposed a 10% baseline tariff on imports from most trading partners and 145%+ on Chinese goods — the most aggressive US trade intervention in nearly a century. One year on, the results are mixed: some domestic manufacturing has expanded (steel, aluminum, semiconductors), but consumers face meaningfully higher prices on electronics, clothing, and consumer goods. Tariff-driven inflation has kept the Federal Reserve cautious about rate cuts, even as growth moderates. The US trade deficit — historically persistent — has narrowed slightly as imports fell, but at the cost of retaliatory tariffs from China, the EU, and Canada on US agricultural exports. For a detailed assessment, see: <Link href="/blog/liberation-day-tariffs-one-year-later" className="text-[#0066cc] hover:underline">One Year After Liberation Day: What Trump&apos;s Tariffs Did</Link>.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The US economy&apos;s competitive advantages include world-leading universities, deep capital markets, a culture of entrepreneurship, and dominance in artificial intelligence and advanced technology. Challenges include rising income inequality, an aging infrastructure (despite recent legislation), high healthcare costs (the US spends more per capita on healthcare than any other country), and a persistent trade deficit. The US GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} is among the highest for large economies, though it masks significant regional variation.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The US economy&apos;s most durable structural advantage in 2026 is its commanding lead in artificial intelligence. American companies — OpenAI, Anthropic, Google DeepMind, Meta AI — control the frontier models that are increasingly embedded in global productivity. The IMF estimates AI could add 0.5–1.5 percentage points to annual US GDP growth through 2030 via efficiency gains in healthcare, finance, software, and professional services. This technology premium partially offsets the drag from tariff-driven price pressures. Structural challenges remain: US housing affordability is at historic lows (the median home price-to-income ratio exceeds 7× nationally), healthcare costs consume 17%+ of GDP — the highest of any OECD country — and the federal deficit at roughly 6–7% of GDP adds to a debt burden of {formatValue(debt?.value, 'percent', 1)} of GDP. Whether AI productivity gains can sustain growth while these structural costs compound is the central question for the US economy over the next decade.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            All economic data on this page is sourced from the <a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">IMF World Economic Outlook</a> and the <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank World Development Indicators</a>. The IMF publishes updated projections biannually in April and October; World Bank data is updated annually.
          </p>
        </div>

        {/* Comparisons */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare the US Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-china', label: 'US vs China' },
              { href: '/compare/united-states-vs-japan', label: 'US vs Japan' },
              { href: '/compare/united-states-vs-germany', label: 'US vs Germany' },
              { href: '/compare/united-states-vs-united-kingdom', label: 'US vs UK' },
              { href: '/compare/united-states-vs-india', label: 'US vs India' },
              { href: '/compare/united-states-vs-canada', label: 'US vs Canada' },
              { href: '/compare/united-states-vs-russia', label: 'US vs Russia' },
              { href: '/compare/united-states-vs-brazil', label: 'US vs Brazil' },
              { href: '/compare/united-states-vs-mexico', label: 'US vs Mexico' },
              { href: '/compare/united-states-vs-france', label: 'US vs France' },
              { href: '/compare/united-states-vs-south-korea', label: 'US vs South Korea' },
              { href: '/compare/united-states-vs-australia', label: 'US vs Australia' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Explore more */}
        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Explore US Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/united-states/gdp', label: 'US GDP' },
              { href: '/country/united-states/gdp-growth', label: 'US GDP Growth' },
              { href: '/country/united-states/gdp-per-capita', label: 'US GDP per Capita' },
              { href: '/country/united-states/inflation-rate', label: 'US Inflation Rate' },
              { href: '/country/united-states/unemployment-rate', label: 'US Unemployment' },
              { href: '/country/united-states/government-debt', label: 'US Government Debt' },
              { href: '/country/united-states/population', label: 'US Population' },
              { href: '/country/united-states/life-expectancy', label: 'US Life Expectancy' },
              { href: '/country/united-states', label: 'Full US Profile →' },
              { href: '/ranking/gdp', label: 'GDP Rankings' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/countries', label: 'All 218 Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
