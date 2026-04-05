import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Russia Economy 2026 — GDP, Sanctions, Energy & Key Data',
  description: 'The Russian economy in 2026: GDP, growth, inflation, sanctions impact, energy exports, and 440+ indicators. IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/russia-economy' },
};

export default async function RussiaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('RUS');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `Russia Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } }) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/russia" className="hover:text-gray-600 transition">Russia</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Russia Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Russian Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">The world&apos;s largest country by area · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} yrs` : '—' }].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>
          ))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Russia Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Russia&apos;s economy at {formatValue(gdp?.value, 'currency')} is the world&apos;s eleventh-largest by nominal GDP — comparable to South Korea&apos;s despite Russia being the world&apos;s largest country by landmass with vast natural resources. The economy is heavily dependent on oil and gas exports, which account for roughly 40% of federal government revenue and 60% of total exports. Russia is the world&apos;s second-largest natural gas exporter and a top-five oil producer.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Western sanctions imposed since 2022 following the invasion of Ukraine have fundamentally reshaped Russia&apos;s economic trajectory. Roughly $300 billion in central bank reserves were frozen, hundreds of Western companies exited, and Russia was largely cut off from the global financial system. However, the economy proved more resilient than many predicted, as energy exports to China and India partially offset lost European markets, and the government implemented capital controls. Inflation at {formatValue(inflation?.value, 'percent', 1)} and a tight labor market (unemployment {formatValue(unemployment?.value, 'percent', 1)}) reflect the contradictions of a wartime economy.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Russia&apos;s long-term economic challenges extend beyond sanctions: an aging and shrinking population (life expectancy of {lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : 'relatively low for its income level'} is significantly below Western peers), failure to diversify beyond natural resources, brain drain of educated workers, and underinvestment in non-resource sectors. Government debt at {formatValue(debt?.value, 'percent', 1)} of GDP is low by global standards, reflecting both fiscal conservatism and Russia&apos;s reliance on resource revenues rather than bond markets.</p>
        </div>
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/compare/united-states-vs-russia', label: 'Russia vs US' }, { href: '/compare/china-vs-russia', label: 'Russia vs China' }, { href: '/compare/russia-vs-india', label: 'Russia vs India' }, { href: '/compare/russia-vs-germany', label: 'Russia vs Germany' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[{ href: '/country/russia/gdp', label: 'Russia GDP' }, { href: '/country/russia', label: 'Full Profile →' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
