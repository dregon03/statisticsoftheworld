import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'South Africa Economy 2026 — GDP, Mining, Inequality & Key Data',
  description: 'South Africa economy in 2026: GDP, growth, inflation, unemployment, mining, and key indicators. Africa\'s most industrialized economy. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/south-africa-economy' },
};

export default async function SouthAfricaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('ZAF');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `South Africa Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is South Africa's unemployment rate?`, acceptedAnswer: { '@type': 'Answer', text: `South Africa's unemployment rate is ${formatValue(unemployment?.value, 'percent', 1)} — one of the highest in the world. Youth unemployment exceeds 60%, creating a social crisis. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><Link href="/country/south-africa" className="hover:text-gray-600 transition">South Africa</Link><span className="mx-2">/</span><span className="text-gray-600">South Africa Economy</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The South Africa Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Africa&apos;s most industrialized economy · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)}y` : '—' }].map(m => (<div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">South Africa Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">South Africa is Africa&apos;s most industrialized economy and its second-largest by GDP. The Johannesburg Stock Exchange (JSE) is Africa&apos;s only truly modern stock exchange, and the country has the continent&apos;s most developed financial, legal, and transportation infrastructure. South Africa is the world&apos;s leading producer of platinum, a major gold producer, and has significant reserves of manganese, chromium, and coal. The mining sector, financial services, automotive manufacturing, and tourism form the economic backbone.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">South Africa faces extraordinary challenges. <Link href="/unemployment-by-country" className="text-[#0066cc] hover:underline">Unemployment</Link> at {formatValue(unemployment?.value, 'percent', 1)} is among the highest in the world — youth unemployment exceeds 60%, creating a social crisis with no parallel among middle-income countries. Load-shedding (rolling blackouts from state utility Eskom&apos;s collapse) has severely constrained economic growth, costing an estimated 2% of GDP annually. The country has the world&apos;s highest <Link href="/gini-index-by-country" className="text-[#0066cc] hover:underline">Gini coefficient</Link> (~63), reflecting extreme inequality that is a direct legacy of apartheid.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Despite these challenges, South Africa has important strengths: a sophisticated financial sector, an independent judiciary and free press, world-class universities, and a diversified economy relative to other African nations. The country is a key member of <Link href="/brics-economy" className="text-[#0066cc] hover:underline">BRICS</Link> and the <Link href="/g20-economy" className="text-[#0066cc] hover:underline">G20</Link>, giving it diplomatic weight beyond its economic size. Reform of the energy sector, job creation, and reducing inequality are the critical priorities.</p>
        </div>
        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/country/south-africa', label: 'Full Profile →' }, { href: '/nigeria-economy', label: 'Nigeria Economy' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/unemployment-by-country', label: 'Unemployment' }, { href: '/gini-index-by-country', label: 'Inequality' }, { href: '/world-economy', label: 'World Economy' }].map(l => (<Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>))}
        </div></div>
      </section>
      <Footer />
    </main>
  );
}
