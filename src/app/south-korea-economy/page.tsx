import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, getIndicatorForAllCountries, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'South Korea Economy 2026 — GDP, Growth, Trade & Key Data',
  description: 'South Korea economy in 2026: GDP, growth rate, inflation, unemployment, trade, and key indicators. The world\'s 12th largest economy. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/south-korea-economy' },
};

export default async function SouthKoreaEconomyPage() {
  const [indicators, gdpRanking] = await Promise.all([
    getAllIndicatorsForCountry('KOR'),
    getIndicatorForAllCountries('IMF.NGDPD'),
  ]);
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `South Korea Economy ${year}`, description: `South Korea GDP: ${formatValue(gdp?.value, 'currency')}, growth: ${formatValue(gdpGrowth?.value, 'percent', 1)}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is South Korea's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `South Korea's GDP in ${year} is approximately ${formatValue(gdp?.value, 'currency')}, making it the world's 12th-13th largest economy. South Korea is a major exporter of semiconductors, automobiles, ships, and electronics. Source: IMF.` } },
      { '@type': 'Question', name: `What is South Korea's economic growth rate?`, acceptedAnswer: { '@type': 'Answer', text: `South Korea's real GDP growth rate is ${formatValue(gdpGrowth?.value, 'percent', 1)} in ${year}. Growth has moderated from the rapid industrialization era but remains solid for an advanced economy. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/south-korea" className="hover:text-gray-600 transition">South Korea</Link><span className="mx-2">/</span>
          <span className="text-gray-600">South Korea Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The South Korea Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Asia&apos;s 4th largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">South Korea Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">South Korea is one of the most remarkable economic success stories of the 20th century. In 1960, its GDP per capita was comparable to sub-Saharan Africa; today it exceeds {formatValue(gdpPerCapita?.value, 'currency')}, placing it firmly among the world&apos;s wealthiest nations. This transformation — the &quot;Miracle on the Han River&quot; — was driven by export-oriented industrialization, massive investment in education, strategic government-business coordination through the chaebol system (Samsung, Hyundai, SK, LG), and integration into global supply chains.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Korean economy is the world&apos;s largest producer of semiconductors (Samsung and SK Hynix control over 60% of global memory chip production), a dominant shipbuilder, and a major automobile exporter (Hyundai-Kia). Samsung alone accounts for roughly 20% of South Korea&apos;s total exports. The country&apos;s R&amp;D spending at over 5% of GDP is among the highest globally, and it leads in 5G deployment, battery technology, and display manufacturing. K-pop and Korean cultural exports have also become a significant soft power and economic asset.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">South Korea faces significant structural challenges. Its fertility rate has fallen below 0.8 — the lowest ever recorded for any country — threatening a demographic crisis that will shrink the working-age population by 30% by 2060. The economy is heavily export-dependent, making it vulnerable to global trade disruptions and the US-China technology rivalry. Household debt exceeds 100% of GDP, one of the highest ratios in the developed world. Youth unemployment and intense competition in education have created social pressures that contribute to the low birth rate.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare South Korea</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/south-korea-vs-japan', label: 'vs Japan' },
              { href: '/compare/south-korea-vs-australia', label: 'vs Australia' },
              { href: '/compare/south-korea-vs-germany', label: 'vs Germany' },
              { href: '/compare/south-korea-vs-united-kingdom', label: 'vs UK' },
              { href: '/compare/united-states-vs-south-korea', label: 'vs USA' },
              { href: '/compare/china-vs-south-korea', label: 'vs China' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/country/south-korea', label: 'Full Profile →' },
              { href: '/country/south-korea/gdp', label: 'South Korea GDP' },
              { href: '/japan-economy', label: 'Japan Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/world-economy', label: 'World Economy' },
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
