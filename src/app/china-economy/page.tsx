import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, getIndicatorForAllCountries, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'China Economy 2026 — GDP, Growth, Population & Key Data',
  description: 'The Chinese economy in 2026: GDP, real growth rate, inflation, unemployment, trade surplus, and 440+ indicators. Data from IMF World Economic Outlook & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/china-economy' },
  openGraph: {
    title: 'China Economy 2026 — GDP, Growth & Key Statistics',
    description: 'Comprehensive overview of China\'s economy with live data from IMF & World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function ChinaEconomyPage() {
  const [indicators, gdpRanking] = await Promise.all([
    getAllIndicatorsForCountry('CHN'),
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

  const year = gdp?.year || '2026';
  const worldGdp = gdpRanking.reduce((s, d) => s + (d.value || 0), 0);
  const chinaShare = gdp?.value && worldGdp ? ((gdp.value / worldGdp) * 100).toFixed(1) : '17';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `China Economy ${year} — GDP, Growth & Key Statistics`,
        description: `China's economy in ${year}: ${formatValue(gdp?.value, 'currency')} GDP, ${formatValue(gdpGrowth?.value, 'percent', 1)} growth.`,
        datePublished: `${year}-01-01`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is China's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `China's GDP in ${year} is approximately ${formatValue(gdp?.value, 'currency')} in nominal terms, making it the world's second-largest economy after the United States. China accounts for roughly ${chinaShare}% of global GDP. In purchasing power parity (PPP) terms, China's economy is the largest in the world. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `What is China's GDP growth rate?`, acceptedAnswer: { '@type': 'Answer', text: `China's real GDP growth rate in ${year} is ${formatValue(gdpGrowth?.value, 'percent', 1)}. Growth has slowed from the double-digit rates of 2000-2010 as the economy matures and transitions from investment-led to consumption-driven growth. Source: IMF.` } },
          { '@type': 'Question', name: `What is China's population in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `China's population in ${year} is approximately ${formatValue(pop?.value, 'number')}. China's population began declining in 2022 for the first time since the 1960s, and India has surpassed China as the world's most populous country. Source: World Bank.` } },
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
          <Link href="/country/china" className="hover:text-gray-600 transition">China</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">China Economy</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Chinese Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          Data on the world&apos;s second-largest economy · Source: IMF World Economic Outlook & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">China Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            China is the world&apos;s second-largest economy by nominal GDP at {formatValue(gdp?.value, 'currency')}, and the largest in purchasing power parity (PPP) terms. Since Deng Xiaoping&apos;s economic reforms beginning in 1978, China has experienced the most dramatic economic transformation in human history — lifting over 800 million people out of poverty and growing from one of the world&apos;s poorest countries to a global economic superpower in four decades. China is the world&apos;s largest manufacturer, exporter, and holder of foreign exchange reserves.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Growth has moderated from the double-digit rates of the 2000s to around {formatValue(gdpGrowth?.value, 'percent', 1)} as the economy matures. China faces structural headwinds: a declining population (the first major economy to face this since Japan), a property sector crisis (the Evergrande collapse exposed overbuilding), high youth unemployment, and growing tension with the United States over trade and technology. The government&apos;s response has emphasized technological self-sufficiency — &quot;Made in China 2025&quot; targets leadership in semiconductors, AI, electric vehicles, and renewable energy.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            China&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} remains well below developed-country levels, classifying it as an upper-middle-income country. The question of whether China can escape the &quot;middle-income trap&quot; — where countries stagnate after reaching moderate prosperity — is one of the defining economic questions of the 2020s. China&apos;s demographic profile (aging rapidly, shrinking workforce) mirrors Japan&apos;s situation in the 1990s, raising concerns about a prolonged period of slower growth.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Data sourced from the <a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">IMF World Economic Outlook</a> and <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank</a>.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare China&apos;s Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-china', label: 'China vs US' },
              { href: '/compare/china-vs-india', label: 'China vs India' },
              { href: '/compare/china-vs-japan', label: 'China vs Japan' },
              { href: '/compare/china-vs-germany', label: 'China vs Germany' },
              { href: '/compare/china-vs-russia', label: 'China vs Russia' },
              { href: '/compare/china-vs-united-kingdom', label: 'China vs UK' },
              { href: '/compare/china-vs-brazil', label: 'China vs Brazil' },
              { href: '/compare/china-vs-south-korea', label: 'China vs S. Korea' },
              { href: '/compare/china-vs-indonesia', label: 'China vs Indonesia' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Explore China Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/china/gdp', label: 'China GDP' },
              { href: '/country/china/gdp-growth', label: 'China GDP Growth' },
              { href: '/country/china/gdp-per-capita', label: 'China GDP per Capita' },
              { href: '/country/china/inflation-rate', label: 'China Inflation' },
              { href: '/country/china/population', label: 'China Population' },
              { href: '/country/china/government-debt', label: 'China Debt' },
              { href: '/country/china', label: 'Full China Profile →' },
              { href: '/ranking/gdp', label: 'GDP Rankings' },
              { href: '/world-economy', label: 'World Economy' },
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
