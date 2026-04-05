import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Japan Economy 2026 — GDP, Growth, Deflation & Key Data',
  description: 'The Japanese economy in 2026: GDP, growth rate, inflation, unemployment, government debt, population decline, and 440+ indicators. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/japan-economy' },
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
        '@type': 'Article',
        headline: `Japan Economy ${year} — GDP, Growth & Key Statistics`,
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `What is Japan's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Japan's GDP in ${year} is approximately ${formatValue(gdp?.value, 'currency')}, making it the world's fourth-largest economy. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: `What is Japan's government debt?`, acceptedAnswer: { '@type': 'Answer', text: `Japan's government debt is ${formatValue(debt?.value, 'percent', 1)} of GDP in ${year} — the highest debt-to-GDP ratio in the developed world. Despite this, Japan borrows at very low interest rates. Source: IMF.` } },
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
            Japan is the world&apos;s fourth-largest economy at {formatValue(gdp?.value, 'currency')}, built on automotive manufacturing (Toyota, Honda, Nissan), electronics, robotics, and precision engineering. The Japanese economy experienced its &quot;economic miracle&quot; from 1950 to 1990, growing from post-war devastation to briefly threatening to overtake the United States. However, the burst of Japan&apos;s asset price bubble in 1991 ushered in the &quot;Lost Decades&quot; — a prolonged period of deflation, stagnant growth, and balance sheet repair that continues to shape economic policy today.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Japan&apos;s defining economic challenge is its demographics: the population has been declining since 2008, and at {formatValue(pop?.value, 'number')}, Japan has the world&apos;s oldest population with a median age above 48. The shrinking workforce puts downward pressure on growth and increases the burden on social security. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is the highest in the developed world, yet Japan finances it almost entirely domestically at near-zero interest rates — a unique situation enabled by massive household savings and Bank of Japan bond purchases.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Japan&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} and life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'among the highest globally'} reflect a high-quality, technologically advanced society. The yen&apos;s significant weakening since 2022 has boosted export competitiveness and corporate profits but reduced purchasing power. Japan remains the world&apos;s largest creditor nation and a leader in automotive technology, with Toyota being the world&apos;s largest automaker.
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
