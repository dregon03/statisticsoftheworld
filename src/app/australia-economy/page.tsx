import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Australia Economy 2026 — GDP, Mining, Trade & Key Data',
  description: 'The Australian economy in 2026: GDP, growth, inflation, unemployment, mining exports, and 440+ indicators. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/australia-economy' },
};

export default async function AustraliaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('AUS');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `Australia Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } }) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/australia" className="hover:text-gray-600 transition">Australia</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Australia Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Australian Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">A resource-rich advanced economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} yrs` : '—' }].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>
          ))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Australia Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Australia&apos;s economy of {formatValue(gdp?.value, 'currency')} is built on an extraordinary combination of natural resource wealth, a strong services sector, and aggressive immigration-driven population growth. Australia avoided recession for nearly 30 consecutive years before COVID-19 — one of the longest growth streaks in modern economic history. The mining sector (iron ore, coal, lithium, natural gas) drives export revenues, with China as by far the largest customer.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Australia&apos;s GDP per capita of {formatValue(gdpPerCapita?.value, 'currency')} is among the highest globally, supported by a minimum wage that is the highest in the developed world. However, housing affordability has become Australia&apos;s defining economic challenge — median home prices in Sydney and Melbourne are among the world&apos;s most expensive relative to incomes. Immigration-driven population growth (Australia targets 190,000+ permanent residents annually) supports GDP growth but intensifies housing and infrastructure pressures.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Australian economy is navigating a strategic tension: deep economic ties with China (its largest trading partner at ~35% of exports) versus its security alliance with the United States and growing geopolitical tensions in the Indo-Pacific. Life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'among the highest globally'} and low government debt ({formatValue(debt?.value, 'percent', 1)} of GDP) reflect sound macroeconomic management and high living standards.</p>
        </div>
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/compare/united-states-vs-australia', label: 'Australia vs US' }, { href: '/compare/canada-vs-australia', label: 'Australia vs Canada' }, { href: '/compare/australia-vs-new-zealand', label: 'Australia vs NZ' }, { href: '/compare/south-korea-vs-australia', label: 'Australia vs S. Korea' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/country/australia/gdp', label: 'Australia GDP' }, { href: '/country/australia', label: 'Full Profile →' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
