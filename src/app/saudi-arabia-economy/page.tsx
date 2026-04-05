import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Saudi Arabia Economy 2026 — GDP, Oil, Vision 2030 & Key Data',
  description: 'Saudi Arabia economy in 2026: GDP, growth, oil revenue, inflation, Vision 2030 diversification, and key indicators. The Arab world\'s largest economy. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/saudi-arabia-economy' },
};

export default async function SaudiArabiaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('SAU');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Saudi Arabia Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Saudi Arabia's GDP?`, acceptedAnswer: { '@type': 'Answer', text: `Saudi Arabia's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the Arab world's largest economy and a G20 member. The economy is heavily dependent on oil, though Vision 2030 aims to diversify. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/saudi-arabia" className="hover:text-gray-600 transition">Saudi Arabia</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Saudi Arabia Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Saudi Arabia Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Arab world&apos;s largest economy · G20 member · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Saudi Arabia Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Saudi Arabia is the Arab world&apos;s largest economy, the world&apos;s largest oil exporter, and a key player in global energy markets through its leadership of OPEC+. The kingdom holds the world&apos;s second-largest proven oil reserves (after Venezuela) and state oil company Aramco is one of the most profitable companies on Earth, generating hundreds of billions in annual revenue. Oil and gas still account for roughly 40% of GDP, 70% of export earnings, and 60% of government revenue.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Vision 2030, launched in 2016 by Crown Prince Mohammed bin Salman, is an ambitious plan to diversify the economy away from oil dependence. The program encompasses mega-projects like NEOM (a $500 billion futuristic city), massive tourism development (including entertainment, sports events, and religious tourism), financial sector liberalization, and expansion of mining, technology, and manufacturing. The Public Investment Fund (PIF), Saudi Arabia&apos;s sovereign wealth fund with over $900 billion in assets, is the primary vehicle for these investments.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Progress on diversification has been mixed. Non-oil GDP growth has been strong, tourism numbers are rising rapidly, and social reforms (women driving, entertainment sector opening) have transformed daily life. However, the economy remains fundamentally oil-dependent — oil price declines still cause fiscal stress. Youth unemployment remains high, and the private sector has struggled to absorb Saudi nationals at wages they consider acceptable. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} is high but unevenly distributed between citizens and the large expatriate workforce.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Saudi Arabia</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/saudi-arabia-vs-uae', label: 'vs UAE' },
              { href: '/compare/saudi-arabia-vs-iran', label: 'vs Iran' },
              { href: '/compare/egypt-vs-saudi-arabia', label: 'vs Egypt' },
              { href: '/compare/israel-vs-saudi-arabia', label: 'vs Israel' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/saudi-arabia', label: 'Full Profile →' }, { href: '/turkey-economy', label: 'Turkey Economy' }, { href: '/india-economy', label: 'India Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/co2-emissions-by-country', label: 'CO2 Emissions' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
