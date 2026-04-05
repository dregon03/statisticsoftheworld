import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Indonesia Economy 2026 — GDP, Growth, Population & Key Data',
  description: 'Indonesia economy in 2026: GDP, growth rate, inflation, and key indicators. Southeast Asia\'s largest economy and the world\'s 4th most populous country. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/indonesia-economy' },
};

export default async function IndonesiaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('IDN');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Indonesia Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Indonesia's GDP in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `Indonesia's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Southeast Asia's largest economy and the world's 16th-17th largest. By PPP, Indonesia is already a top-10 economy. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/indonesia" className="hover:text-gray-600 transition">Indonesia</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Indonesia Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Indonesia Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Southeast Asia&apos;s largest economy · 280M+ people · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Indonesia Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Indonesia is Southeast Asia&apos;s largest economy, the world&apos;s fourth most populous country with over 280 million people, and a member of the G20. By purchasing power parity, Indonesia is already a top-10 economy globally. The economy is driven by commodities (palm oil, coal, nickel, tin), manufacturing, services, and a rapidly growing digital economy. Indonesia&apos;s geographic position spanning over 17,000 islands makes it strategically important for global trade routes.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Indonesia has maintained steady <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">GDP growth</Link> of approximately 5% annually — a rate that, if sustained, would double the economy every 14 years. The government has ambitious plans to become a developed nation by 2045 (Indonesia Emas), investing heavily in infrastructure including a new capital city (Nusantara) on Borneo. Indonesia is the world&apos;s largest nickel producer and is aggressively developing a downstream nickel and battery supply chain to become a hub for electric vehicle manufacturing.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Challenges include a large informal economy, infrastructure gaps (particularly outside Java), relatively low <Link href="/education-spending-by-country" className="text-[#0066cc] hover:underline">education spending</Link>, and environmental concerns from deforestation and coal dependency. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} reflects Indonesia&apos;s status as a lower-middle-income country — per capita wealth is less than a quarter of neighboring Malaysia. The demographic dividend from its young <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population</Link> (median age ~30) represents both an enormous opportunity and a challenge to create sufficient quality employment.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Indonesia</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/indonesia-vs-india', label: 'vs India' },
              { href: '/compare/indonesia-vs-brazil', label: 'vs Brazil' },
              { href: '/compare/indonesia-vs-mexico', label: 'vs Mexico' },
              { href: '/compare/thailand-vs-indonesia', label: 'vs Thailand' },
              { href: '/compare/vietnam-vs-indonesia', label: 'vs Vietnam' },
              { href: '/compare/philippines-vs-indonesia', label: 'vs Philippines' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/indonesia', label: 'Full Profile →' }, { href: '/india-economy', label: 'India Economy' }, { href: '/china-economy', label: 'China Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/population-by-country', label: 'Population' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
