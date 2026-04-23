import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Japan Economy 2026 — GDP, Growth, Yen & Key Statistics',
  description: 'Japan economy 2026: GDP ~$4.4 trillion (world\'s 4th largest economy per IMF April 2026 WEO), 0.8% growth, aging population, 260%+ debt-to-GDP. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/japan-economy' },
  openGraph: {
    title: 'Japan Economy 2026 — GDP, Growth & Key Data',
    description: 'Japan is the world\'s 4th largest economy in 2026 at ~$4.4T. Aging population, record debt-to-GDP, yen depreciation, and US tariff headwinds. IMF & World Bank data.',
    url: 'https://statisticsoftheworld.com/japan-economy',
    siteName: 'Statistics of the World',
    type: 'website',
  },
};

export default async function JapanEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('JPN');
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
          { '@type': 'ListItem', position: 2, name: 'Japan', item: 'https://statisticsoftheworld.com/country/japan' },
          { '@type': 'ListItem', position: 3, name: 'Japan Economy', item: 'https://statisticsoftheworld.com/japan-economy' },
        ],
      },
      {
        '@type': 'Article',
        headline: `Japan Economy ${year} — GDP, Growth & Key Statistics`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is Japan's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Japan's GDP in ${year} is approximately ${formatValue(gdp?.value, 'currency')}, making it the world's fourth-largest economy per the IMF April 2026 World Economic Outlook — ahead of the United Kingdom ($4.26T) and India ($4.15T). Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `Is Japan still ranked above India in GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Yes. Per the IMF April 2026 World Economic Outlook, Japan ranks fourth at approximately ${formatValue(gdp?.value, 'currency')}, ahead of India which ranks sixth at $4.15T. India did not overtake Japan in 2026 — two factors prevented this: the Indian rupee's depreciation from 84.6 to 88.5 per dollar (compressing India's dollar-denominated GDP) and a February 2026 statistical revision by India's MoSPI that lowered India's nominal estimate by ~4%. Despite Japan's slow growth (~0.8%) vs. India's 6.5%, Japan's larger nominal base preserved its lead in dollar terms. India is projected to surpass Japan in the late 2020s or early 2030s. Source: IMF.` } },
          { '@type': 'Question', name: `What is Japan's government debt in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Japan's government debt is approximately ${formatValue(debt?.value, 'percent', 1)} of GDP in ${year} — the highest debt-to-GDP ratio in the developed world. Despite this, Japan finances it almost entirely domestically at near-zero interest rates, enabled by massive household savings and Bank of Japan bond purchases. Source: IMF.` } },
          { '@type': 'Question', name: `Why has the Japanese yen weakened?`, acceptedAnswer: { '@type': 'Answer', text: `The yen has depreciated significantly since 2022 because the Bank of Japan maintained ultra-low interest rates while the US Federal Reserve raised rates aggressively. The interest rate differential made yen assets less attractive to global investors. A weaker yen boosts Japanese export earnings and corporate profits but compresses Japan's GDP when measured in US dollars — a key reason Japan's dollar-denominated GDP appears smaller than its underlying domestic output would suggest. Source: Bank of Japan, IMF.` } },
          { '@type': 'Question', name: `What is Japan's economic outlook for ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Japan's economic growth in ${year} is projected at approximately ${formatValue(gdpGrowth?.value, 'percent', 1)}, weighed down by demographic decline, export headwinds from US tariffs on Japanese autos and electronics, and sluggish domestic consumption. The Bank of Japan has cautiously begun normalizing monetary policy after decades of near-zero rates. Long-term structural challenges — a shrinking workforce and the world's oldest major population — constrain Japan's growth ceiling. Source: IMF, Bank of Japan.` } },
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
          <Link href="/country/japan" className="hover:text-gray-600 transition">Japan</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Japan Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Japanese Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">The world&apos;s fourth-largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'GDP (Nominal)', value: formatValue(gdp?.value, 'currency') },
            { label: 'GDP Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) },
            { label: 'Inflation Rate', value: formatValue(inflation?.value, 'percent', 1) },
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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Japan Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Japan is the world&apos;s fourth-largest economy at {formatValue(gdp?.value, 'currency')} per the IMF&apos;s April 2026 World Economic Outlook, ahead of the United Kingdom ($4.26T) and <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> ($4.15T). Japan&apos;s economy is built on automotive manufacturing (Toyota, Honda, Nissan), electronics, robotics, and precision engineering. The Japanese economy experienced its &quot;economic miracle&quot; from 1950 to 1990, growing from post-war devastation to briefly threatening to overtake the United States. The burst of Japan&apos;s asset price bubble in 1991 ushered in the &quot;Lost Decades&quot; — a prolonged period of deflation, stagnant growth, and balance sheet repair that continues to shape economic policy today.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Japan&apos;s defining economic challenge is its demographics: the population has been declining since 2008, and at {formatValue(pop?.value, 'number')}, Japan has the world&apos;s oldest population with a median age above 48. The shrinking workforce puts downward pressure on growth and increases the burden on social security. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is the highest in the developed world, yet Japan finances it almost entirely domestically at near-zero interest rates — a unique situation enabled by massive household savings and Bank of Japan bond purchases.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Japan&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} and life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'among the highest globally'} reflect a high-quality, technologically advanced society. The yen&apos;s significant weakening since 2022 has boosted export competitiveness and corporate profits but reduced purchasing power. Japan remains the world&apos;s largest creditor nation and a leader in automotive technology, with Toyota being the world&apos;s largest automaker.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Japan&apos;s lead over <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> in dollar-denominated GDP is real but precarious. The IMF April 2026 WEO places Japan fourth ($4.4T) and India sixth ($4.15T) — a gap of roughly $250 billion that reflects two temporary factors: the rupee&apos;s depreciation from 84.6 to 88.5 per dollar, and a February 2026 statistical revision by India&apos;s MoSPI that lowered India&apos;s nominal GDP estimate by ~4%. India is growing at 6.5% annually versus Japan&apos;s 0.8%, so at current trajectories India is projected to overtake Japan sometime in the late 2020s or early 2030s. The Trump administration&apos;s April 2026 tariffs add near-term pressure on Japan: auto exports to the US face elevated duties, and Japanese manufacturers have been slower than South Korean or European rivals to diversify supply chains. The <Link href="/compare/japan-vs-india" className="text-[#0066cc] hover:underline">Japan vs. India comparison</Link> captures this divergence in live data — India&apos;s demographic advantage (median age 28 vs. Japan&apos;s 48) means the gap in underlying economic momentum will almost certainly close within this decade.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Japan&apos;s Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-japan', label: 'Japan vs US' },
              { href: '/compare/china-vs-japan', label: 'Japan vs China' },
              { href: '/compare/japan-vs-germany', label: 'Japan vs Germany' },
              { href: '/compare/japan-vs-south-korea', label: 'Japan vs S. Korea' },
              { href: '/compare/japan-vs-india', label: 'Japan vs India' },
              { href: '/compare/japan-vs-united-kingdom', label: 'Japan vs UK' },
              { href: '/india-economy', label: 'India Economy →' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Explore Japan Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/japan/gdp', label: 'Japan GDP' },
              { href: '/country/japan/gdp-growth', label: 'Japan GDP Growth' },
              { href: '/country/japan/population', label: 'Japan Population' },
              { href: '/country/japan/government-debt', label: 'Japan Debt' },
              { href: '/country/japan', label: 'Full Japan Profile →' },
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
