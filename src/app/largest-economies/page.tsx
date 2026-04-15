import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Largest Economies in the World 2026 — Top 50 GDP Rankings',
  description: 'The 50 largest economies in the world by nominal GDP in 2026. US leads at $29T+, China at $19T+, India now #4 surpassing Japan. Full rankings, GDP share, and tariff impact analysis. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/largest-economies' },
  openGraph: {
    title: 'Largest Economies in the World 2026 — Top 50 GDP Rankings',
    description: 'US $29T+, China $19T+, India now #4. The 50 biggest economies ranked by nominal GDP with world share. Source: IMF World Economic Outlook.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/largest-economies',
    type: 'website',
  },
};

export default async function LargestEconomiesPage() {
  const data = await getIndicatorForAllCountries('IMF.NGDPD');
  const year = data[0]?.year || '2026';
  const totalGdp = data.reduce((s, d) => s + (d.value || 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'GDP by Country', item: 'https://statisticsoftheworld.com/gdp-by-country' },
        { '@type': 'ListItem', position: 3, name: 'Largest Economies', item: 'https://statisticsoftheworld.com/largest-economies' },
      ],
    },
    { '@type': 'Dataset', name: `Largest Economies ${year}`, description: `Countries ranked by nominal GDP. World total: ${formatValue(totalGdp, 'currency')}. Source: IMF.`, url: 'https://statisticsoftheworld.com/largest-economies', creator: { '@type': 'Organization', name: 'IMF' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the largest economy in the world?', acceptedAnswer: { '@type': 'Answer', text: `The United States is the world's largest economy by nominal GDP at ${formatValue(data[0]?.value, 'currency')} in ${year}. China is second, followed by Germany, Japan, and India (which surpassed Japan in 2025). The US and China together account for over 40% of global GDP. Source: IMF.` } },
      { '@type': 'Question', name: 'Is China bigger than the US economy?', acceptedAnswer: { '@type': 'Answer', text: 'In nominal (dollar) terms, the US economy is larger. However, in purchasing power parity (PPP) terms — which adjusts for price differences — China\'s economy is substantially larger, exceeding $35 trillion vs about $30 trillion for the US. PPP better reflects domestic purchasing power, while nominal GDP reflects international purchasing power and global market weight.' } },
      { '@type': 'Question', name: 'What are the fastest-growing large economies?', acceptedAnswer: { '@type': 'Answer', text: 'Among the world\'s 20 largest economies, India is the fastest-growing at 6–6.5% annually in 2026, supported by strong domestic consumption and a favorable trade deal with the US. Indonesia (5%), Vietnam (5.6%), and the Philippines (5.7%) are also growing rapidly. Advanced economies (US, Germany, Japan) are growing at 0.8–2.1%.' } },
      { '@type': 'Question', name: 'How are 2026 tariffs affecting the largest economies?', acceptedAnswer: { '@type': 'Answer', text: 'The US Liberation Day tariffs and retaliatory Chinese measures have created divergent effects. Germany and Japan — heavily export-dependent — are growing near zero at 0.9% and 0.8% respectively. China faces headwinds from 145%+ tariffs on US-bound exports, depressing manufacturing output. India, with a partial US tariff exemption (reduced from 25% to 18% in a bilateral deal), continues growing strongly. The US itself faces higher consumer prices from import tariffs, with inflation holding above the 2% target.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/gdp-by-country" className="hover:text-gray-600 transition">GDP by Country</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Largest Economies</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Largest Economies in the World ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked by nominal GDP · World GDP: {formatValue(totalGdp, 'currency')} · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">#1 Economy</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div>
            <div className="text-[13px] text-[#94a3b8]">{formatValue(data[0]?.value, 'currency')}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">#2 Economy</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[1]?.country}</div>
            <div className="text-[13px] text-[#94a3b8]">{formatValue(data[1]?.value, 'currency')}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">World GDP</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{formatValue(totalGdp, 'currency')}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The World&apos;s Biggest Economies</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The global economy is heavily concentrated: the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> and <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> together account for over 40% of world GDP, and the top 10 economies produce roughly two-thirds of all global output. This concentration has deepened over the past two decades as the US economy grew through technology-led productivity gains and China industrialized at an unprecedented pace. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link>, now the fourth or fifth largest economy, has emerged as the fastest-growing major economy.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The rankings shift when measured by purchasing power parity (PPP) instead of nominal dollars. China&apos;s economy is substantially larger than America&apos;s in PPP terms, and India ranks third — ahead of <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> and <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link>. PPP matters because domestic purchasing power in large developing economies is much greater than their dollar-denominated GDP suggests. The <Link href="/g7-economy" className="text-[#0066cc] hover:underline">G7</Link> countries account for roughly 43% of global GDP, while <Link href="/brics-economy" className="text-[#0066cc] hover:underline">BRICS</Link> represents about 35%.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Economic size does not equal prosperity. <Link href="/richest-countries" className="text-[#0066cc] hover:underline">GDP per capita</Link> provides a better measure of individual wealth — China has the second-largest economy but ranks around 70th in per capita terms. Similarly, <Link href="/nigeria-economy" className="text-[#0066cc] hover:underline">Nigeria</Link> has a large total GDP but very low per capita income. The relationship between economic size and quality of life depends heavily on <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">inequality</Link>, governance, <Link href="/health-spending-by-country" className="text-[#0066cc] hover:underline">healthcare</Link>, and education investments.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The 2026 US tariff escalation has reshuffled near-term rankings. Dollar-denominated GDP figures are sensitive to exchange rates — and the dollar&apos;s strength since Liberation Day has mechanically reduced the dollar value of European and Japanese economies. Germany&apos;s nominal GDP has been pushed down partly by euro depreciation against the dollar, even as its underlying economic performance holds steady in local currency terms. This currency effect is worth watching: a 10% shift in the EUR/USD rate can move Germany&apos;s dollar-GDP ranking by tens of billions without any real change in output. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link>, meanwhile, now firmly holds the #4 spot after overtaking <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> — a structural shift that reflects decades of faster growth rather than any currency effect. At its current trajectory, India is on course to become the world&apos;s third-largest economy by 2030.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Largest economies by GDP in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP (Nominal)</th>
                  <th scope="col" className="px-4 py-2.5 text-right">% of World</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/gdp`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px] text-[#64748b]">{d.value && totalGdp ? ((d.value / totalGdp) * 100).toFixed(1) + '%' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/gdp-by-country" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/richest-countries', label: 'Richest Countries' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/gdp-growth-by-country', label: 'GDP Growth' }, { href: '/g7-economy', label: 'G7 Economy' }, { href: '/g20-economy', label: 'G20 Economy' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/most-populous-countries', label: 'Most Populous' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
