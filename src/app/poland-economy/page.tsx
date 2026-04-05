import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Poland Economy 2026 — GDP, Growth, Trade & Key Data',
  description: 'Poland economy in 2026: GDP, growth rate, inflation, unemployment, and key indicators. Europe\'s growth champion and the EU\'s 6th largest economy. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/poland-economy' },
};

export default async function PolandEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('POL');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Poland Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Poland's GDP?`, acceptedAnswer: { '@type': 'Answer', text: `Poland's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it the EU's 6th largest economy. Poland is the only EU country that avoided recession in 2009 and has roughly tripled its real GDP since 2000. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/poland" className="hover:text-gray-600 transition">Poland</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Poland Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Poland Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Europe&apos;s growth champion · EU&apos;s 6th largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Poland Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Poland is Europe&apos;s most remarkable growth story of the 21st century. The only <Link href="/eu-economy" className="text-[#0066cc] hover:underline">EU</Link> country to avoid recession in 2009, Poland has roughly tripled its real GDP since 2000 — a performance rivaling East Asian economies. This transformation was driven by EU accession in 2004 (which unlocked massive structural funds and market access), a well-educated workforce, competitive labor costs, strategic geographic position between Western Europe and Eastern markets, and pragmatic economic policy that balanced growth with fiscal discipline.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Poland has become a major nearshoring destination for European companies seeking alternatives to Chinese manufacturing. The automotive sector is particularly strong, with factories supplying components to <Link href="/germany-economy" className="text-[#0066cc] hover:underline">German</Link> automakers. IT services, shared service centers, and business process outsourcing have also grown rapidly, with Warsaw, Krakow, and Wroclaw emerging as tech hubs. Poland&apos;s economy is diversified across manufacturing, services, agriculture, and a growing fintech sector.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Challenges include an aging population (though Poland&apos;s demographics are better than most Central European neighbors), energy dependence on coal (Poland is the EU&apos;s most coal-dependent economy), and political tensions with the EU over rule of law. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} has been converging toward Western European levels but remains about 40% below the EU average. Poland has not adopted the euro and maintains its own monetary policy through the zloty.</p>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/poland', label: 'Full Profile →' }, { href: '/germany-economy', label: 'Germany Economy' }, { href: '/eu-economy', label: 'EU Economy' }, { href: '/spain-economy', label: 'Spain Economy' }, { href: '/gdp-growth-by-country', label: 'GDP Growth' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
