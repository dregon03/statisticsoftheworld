import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, getIndicatorForAllCountries, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'India Economy 2026 — GDP, Growth, Population & Key Data',
  description: 'The Indian economy in 2026: GDP, real growth rate, inflation, unemployment, population, and 440+ indicators. Data from IMF World Economic Outlook & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/india-economy' },
  openGraph: {
    title: 'India Economy 2026 — GDP, Growth & Key Statistics',
    description: 'Comprehensive overview of India\'s economy with live data from IMF & World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function IndiaEconomyPage() {
  const [indicators, gdpRanking] = await Promise.all([
    getAllIndicatorsForCountry('IND'),
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
  const indiaShare = gdp?.value && worldGdp ? ((gdp.value / worldGdp) * 100).toFixed(1) : '4';

  // Find India's rank
  const indiaRank = gdpRanking.findIndex(d => d.countryId === 'IND') + 1;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `India Economy ${year} — GDP, Growth & Key Statistics`,
        description: `India's economy in ${year}: ${formatValue(gdp?.value, 'currency')} GDP, ${formatValue(gdpGrowth?.value, 'percent', 1)} growth, ${formatValue(pop?.value, 'number')} people.`,
        datePublished: `${year}-01-01`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
        publisher: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is India's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `India's GDP in ${year} is approximately ${formatValue(gdp?.value, 'currency')} in nominal terms, making it the world's #${indiaRank} largest economy. India accounts for ${indiaShare}% of global GDP. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `What is India's GDP growth rate?`, acceptedAnswer: { '@type': 'Answer', text: `India's real GDP growth rate in ${year} is ${formatValue(gdpGrowth?.value, 'percent', 1)}, making it one of the fastest-growing major economies in the world. India has consistently outpaced the global average growth rate. Source: IMF.` } },
          { '@type': 'Question', name: `Is India the most populous country?`, acceptedAnswer: { '@type': 'Answer', text: `Yes, India surpassed China as the world's most populous country in 2023. India's population in ${year} is approximately ${formatValue(pop?.value, 'number')}, with a median age under 30. Source: World Bank / UN Population Division.` } },
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
          <Link href="/country/india" className="hover:text-gray-600 transition">India</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">India Economy</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Indian Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          The world&apos;s fastest-growing major economy · Source: IMF World Economic Outlook & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">India Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            India is the world&apos;s #{indiaRank} largest economy with a GDP of {formatValue(gdp?.value, 'currency')}, and the fastest-growing major economy at {formatValue(gdpGrowth?.value, 'percent', 1)}. With {formatValue(pop?.value, 'number')} people, India surpassed China in 2023 as the world&apos;s most populous country. India&apos;s economic transformation has been driven by information technology services (Infosys, TCS, Wipro), a booming domestic consumer market, and increasingly, manufacturing as global supply chains diversify from China.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            India&apos;s demographic profile is its greatest economic asset: a median age under 30 and a growing working-age population that won&apos;t peak until the 2050s. This &quot;demographic dividend&quot; stands in contrast to the aging populations of China, Japan, and Europe. The challenge is converting this demographic advantage into productive employment — India needs to create millions of jobs annually. The country&apos;s services-led growth model (IT services, business process outsourcing) has been more successful at creating high-skill jobs than mass employment.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            India&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} remains low by global standards, reflecting the enormous development gap that persists despite decades of growth. Infrastructure development (roads, ports, railways, digital payments like UPI) has accelerated under recent policy initiatives, and India&apos;s digital economy has leapfrogged traditional stages of development — India processes more digital payments annually than any other country. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is manageable by emerging market standards, and inflation at {formatValue(inflation?.value, 'percent', 1)} is within the Reserve Bank of India&apos;s target range.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Data sourced from the <a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">IMF World Economic Outlook</a> and <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank</a>.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare India&apos;s Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-india', label: 'India vs US' },
              { href: '/compare/china-vs-india', label: 'India vs China' },
              { href: '/compare/india-vs-japan', label: 'India vs Japan' },
              { href: '/compare/india-vs-united-kingdom', label: 'India vs UK' },
              { href: '/compare/india-vs-brazil', label: 'India vs Brazil' },
              { href: '/compare/india-vs-pakistan', label: 'India vs Pakistan' },
              { href: '/compare/india-vs-indonesia', label: 'India vs Indonesia' },
              { href: '/compare/india-vs-bangladesh', label: 'India vs Bangladesh' },
              { href: '/compare/india-vs-russia', label: 'India vs Russia' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Explore India Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/india/gdp', label: 'India GDP' },
              { href: '/country/india/gdp-growth', label: 'India GDP Growth' },
              { href: '/country/india/gdp-per-capita', label: 'India GDP per Capita' },
              { href: '/country/india/inflation-rate', label: 'India Inflation' },
              { href: '/country/india/population', label: 'India Population' },
              { href: '/country/india', label: 'Full India Profile →' },
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
