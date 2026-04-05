import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Spain Economy 2026 — GDP, Unemployment, Tourism & Key Data',
  description: 'Spain economy in 2026: GDP, growth, inflation, unemployment, tourism, and key indicators. The eurozone\'s 4th largest economy. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/spain-economy' },
};

export default async function SpainEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('ESP');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Spain Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Spain's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Spain's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the 4th largest eurozone economy and roughly 14th-15th globally. Source: IMF.` } },
      { '@type': 'Question', name: `What is Spain's unemployment rate?`, acceptedAnswer: { '@type': 'Answer', text: `Spain's unemployment rate is ${formatValue(unemployment?.value, 'percent', 1)} in ${year}. Spain has historically had one of the highest unemployment rates in Western Europe, particularly for youth. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/spain" className="hover:text-gray-600 transition">Spain</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Spain Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Spain Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Eurozone&apos;s 4th largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Spain Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Spain is the eurozone&apos;s fourth-largest economy and one of Europe&apos;s most important tourist destinations, welcoming over 85 million international visitors annually — second only to France globally. Tourism, along with real estate, automotive manufacturing, agriculture, and renewable energy, forms the backbone of the Spanish economy. Spain is Europe&apos;s largest producer of olive oil and a major wine exporter, and has become a global leader in wind and solar energy deployment.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Spain&apos;s economy was devastated by the 2008 financial crisis and the European debt crisis that followed. A massive property bubble burst, unemployment soared above 26% (youth unemployment exceeded 55%), and the economy contracted for several consecutive years. Recovery was slow but real — structural labor market reforms, banking sector cleanup, and EU support helped Spain return to growth. However, the legacy persists: Spain still has one of Western Europe&apos;s highest <Link href="/unemployment-by-country" className="text-[#0066cc] hover:underline">unemployment rates</Link> at {formatValue(unemployment?.value, 'percent', 1)}, and the housing market remains a sensitive topic.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Spain&apos;s strengths include its diversified economy, high quality of life (life expectancy of {lifeExp?.value ? Number(lifeExp.value).toFixed(1) : '83'} years is among the world&apos;s highest), growing tech sector (Barcelona has become a major startup hub), and world-class infrastructure including high-speed rail. Challenges include regional inequality (Madrid and the Basque Country are far wealthier than Andalusia and Extremadura), an aging population, high government <Link href="/debt-by-country" className="text-[#0066cc] hover:underline">debt</Link>, and persistent structural unemployment.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Spain</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/france-vs-spain', label: 'vs France' },
              { href: '/compare/italy-vs-spain', label: 'vs Italy' },
              { href: '/compare/united-states-vs-spain', label: 'vs USA' },
              { href: '/compare/germany-vs-france', label: 'Germany vs France' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/spain', label: 'Full Profile →' }, { href: '/italy-economy', label: 'Italy Economy' }, { href: '/france-economy', label: 'France Economy' }, { href: '/germany-economy', label: 'Germany Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
