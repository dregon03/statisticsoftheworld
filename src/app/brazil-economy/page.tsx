import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Brazil Economy 2026 — GDP, Growth, Commodities & Key Data',
  description: 'The Brazilian economy in 2026: GDP, growth, inflation, unemployment, commodity exports, and 440+ indicators. Latin America\'s largest economy. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/brazil-economy' },
};

export default async function BrazilEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('BRA');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `Brazil Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } }) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/brazil" className="hover:text-gray-600 transition">Brazil</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Brazil Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Brazilian Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Latin America&apos;s largest economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} yrs` : '—' }].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>
          ))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Brazil Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Brazil is Latin America&apos;s largest economy with a GDP of {formatValue(gdp?.value, 'currency')}, and the world&apos;s leading exporter of soybeans, coffee, sugar, orange juice, and beef. The Brazilian economy is diversified across agriculture, mining (iron ore), manufacturing (automotive, aerospace with Embraer), and a large domestic consumer market of {formatValue(pop?.value, 'number')} people — the sixth most populous country globally.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Brazil&apos;s economic history has been marked by boom-bust cycles driven by commodity prices and policy swings. The 2015-2016 recession was the deepest in a century, followed by slow recovery, COVID-19 disruption, and then a commodity-driven rebound. Growth of {formatValue(gdpGrowth?.value, 'percent', 1)} reflects the current trajectory. Brazil&apos;s central bank has maintained high real interest rates to control inflation (currently {formatValue(inflation?.value, 'percent', 1)}), which constrains growth but preserves monetary credibility. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is elevated for an emerging market.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Brazil&apos;s pre-salt oil discoveries have made it one of the world&apos;s top 10 oil producers, while its agricultural sector benefits from vast arable land and favorable climate. The challenge remains converting resource wealth into broad-based prosperity — Brazil&apos;s Gini coefficient is among the highest in the world, reflecting deep inequality. Data from <a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">IMF</a> and <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank</a>.</p>
        </div>
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Brazil&apos;s Economy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/compare/united-states-vs-brazil', label: 'Brazil vs US' }, { href: '/compare/india-vs-brazil', label: 'Brazil vs India' }, { href: '/compare/brazil-vs-mexico', label: 'Brazil vs Mexico' }, { href: '/compare/brazil-vs-argentina', label: 'Brazil vs Argentina' }, { href: '/compare/indonesia-vs-brazil', label: 'Brazil vs Indonesia' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/country/brazil/gdp', label: 'Brazil GDP' }, { href: '/country/brazil', label: 'Full Profile →' }, { href: '/world-economy', label: 'World Economy' }, { href: '/ranking/gdp', label: 'GDP Rankings' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
