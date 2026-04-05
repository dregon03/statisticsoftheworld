import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Egypt Economy 2026 — GDP, Suez Canal, Population & Key Data',
  description: 'Egypt economy in 2026: GDP, growth, inflation, Suez Canal revenue, and key indicators. North Africa\'s largest economy with 105M+ people. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/egypt-economy' },
};

export default async function EgyptEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('EGY');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Egypt Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Egypt's GDP?`, acceptedAnswer: { '@type': 'Answer', text: `Egypt's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Africa's 3rd largest economy (after Nigeria and South Africa) and the Arab world's 2nd largest. The economy benefits from the Suez Canal, tourism, and remittances. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><Link href="/country/egypt" className="hover:text-gray-600 transition">Egypt</Link><span className="mx-2">/</span><span className="text-gray-600">Egypt Economy</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Egypt Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">North Africa&apos;s largest economy · 105M+ people · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[{ label: 'GDP', value: formatValue(gdp?.value, 'currency') }, { label: 'Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) }, { label: 'Inflation', value: formatValue(inflation?.value, 'percent', 1) }, { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) }, { label: 'GDP/Capita', value: formatValue(gdpPerCapita?.value, 'currency') }, { label: 'Population', value: formatValue(pop?.value, 'number') }, { label: 'Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) }, { label: 'Life Exp.', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)}y` : '—' }].map(m => (<div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div><div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div></div>))}
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Egypt Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Egypt is North Africa&apos;s largest economy, the Arab world&apos;s most populous country with over 105 million people, and a new member of <Link href="/brics-economy" className="text-[#0066cc] hover:underline">BRICS</Link>. The economy rests on four pillars: Suez Canal revenue (roughly $9 billion annually from ~20,000 vessel transits), tourism (the Pyramids, Nile cruises, Red Sea resorts), remittances from millions of Egyptians working in the Gulf, and a growing manufacturing and gas sector. Natural gas from the offshore Zohr field has transformed Egypt from an energy importer to an exporter.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Egypt has faced significant economic challenges including high <Link href="/inflation-by-country" className="text-[#0066cc] hover:underline">inflation</Link>, currency devaluation (the pound lost over 50% against the dollar in 2022-2024), and rising government <Link href="/debt-by-country" className="text-[#0066cc] hover:underline">debt</Link>. The country has required multiple IMF programs to stabilize its balance of payments. Despite these challenges, GDP growth has remained positive, driven by mega-projects including a new administrative capital east of Cairo and Suez Canal expansion.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Egypt&apos;s strategic position — controlling the Suez Canal chokepoint for global trade — gives it geopolitical significance far beyond its economic size. The country&apos;s young and rapidly growing <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population</Link> presents both an opportunity (demographic dividend) and a challenge (creating enough jobs for 2 million new labor market entrants annually).</p>
        </div>
        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/country/egypt', label: 'Full Profile →' }, { href: '/nigeria-economy', label: 'Nigeria Economy' }, { href: '/saudi-arabia-economy', label: 'Saudi Arabia' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/population-by-country', label: 'Population' }, { href: '/world-economy', label: 'World Economy' }].map(l => (<Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>))}
        </div></div>
      </section>
      <Footer />
    </main>
  );
}
