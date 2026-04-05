import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mexico Economy 2026 — GDP, Trade, Growth & Key Data',
  description: 'Mexico economy in 2026: GDP, growth, inflation, unemployment, trade, and key indicators. Latin America\'s 2nd largest economy and major US trade partner. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/mexico-economy' },
};

export default async function MexicoEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('MEX');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Mexico Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Mexico's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Mexico's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Latin America's 2nd largest economy and the world's 12th-14th largest. Mexico is the US's largest trade partner. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/mexico" className="hover:text-gray-600 transition">Mexico</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Mexico Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Mexico Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Latin America&apos;s 2nd largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Mexico Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Mexico is Latin America&apos;s second-largest economy and has become the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States&apos;</Link> largest trade partner, surpassing China and Canada. The USMCA trade agreement (replacing NAFTA) underpins a deeply integrated North American supply chain, particularly in automotive manufacturing — Mexico is the world&apos;s 6th largest auto producer. Manufacturing, oil production (Pemex), remittances, and tourism are the economy&apos;s main pillars.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Mexico is a major beneficiary of &quot;nearshoring&quot; — the trend of companies relocating manufacturing from China to countries closer to the US market. This has driven record foreign direct investment and industrial park construction, particularly in northern border states. The automotive, electronics, and aerospace sectors are all expanding rapidly. Mexico&apos;s young population (median age ~29) provides a demographic advantage over aging competitors.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Challenges include high inequality (the <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">Gini index</Link> is around 45), a large informal economy employing roughly 55% of workers, security concerns from organized crime, and infrastructure bottlenecks. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} is well below developed-world levels. Energy policy has been contentious, with the government favoring state oil company Pemex over private and renewable investment, despite Mexico&apos;s enormous solar potential.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Mexico</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/united-states-vs-mexico', label: 'vs USA' },
              { href: '/compare/brazil-vs-mexico', label: 'vs Brazil' },
              { href: '/compare/canada-vs-mexico', label: 'vs Canada' },
              { href: '/compare/mexico-vs-indonesia', label: 'vs Indonesia' },
              { href: '/compare/mexico-vs-argentina', label: 'vs Argentina' },
              { href: '/compare/turkey-vs-mexico', label: 'vs Turkey' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/mexico', label: 'Full Profile →' }, { href: '/brazil-economy', label: 'Brazil Economy' }, { href: '/us-economy', label: 'US Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/inflation-by-country', label: 'Inflation Rates' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
