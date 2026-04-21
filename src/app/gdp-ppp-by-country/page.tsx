import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GDP PPP by Country 2026 — Purchasing Power Parity Rankings | Statistics of the World',
  description: 'GDP by purchasing power parity (PPP) 2026: China leads at $35T+, India is #3 at ~$15T, ahead of Japan and Germany. All countries ranked. Why PPP is the fairest measure of economic size. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gdp-ppp-by-country' },
  openGraph: {
    title: 'GDP PPP by Country 2026 — Purchasing Power Parity Rankings',
    description: 'China\'s economy is larger than America\'s by PPP ($35T+ vs $29T). India ranks #3. All countries ranked by PPP-adjusted GDP. Source: IMF.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/gdp-ppp-by-country',
    type: 'website',
  },
};

export default async function GDPPPPByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.PPPGDP');
  const year = data[0]?.year || '2026';
  const totalGdpPPP = data.reduce((s, d) => s + (d.value || 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'GDP Rankings', item: 'https://statisticsoftheworld.com/ranking/gdp' },
        { '@type': 'ListItem', position: 3, name: 'GDP PPP by Country', item: 'https://statisticsoftheworld.com/gdp-ppp-by-country' },
      ],
    },
    {
      '@type': 'WebPage',
      name: `GDP PPP by Country ${year}`,
      url: 'https://statisticsoftheworld.com/gdp-ppp-by-country',
      description: `All countries ranked by GDP at purchasing power parity in ${year}. China leads, followed by the US and India. Source: IMF.`,
      dateModified: new Date().toISOString().split('T')[0],
    },
    { '@type': 'Dataset', name: `GDP PPP by Country ${year}`, description: `GDP in purchasing power parity for ${data.length} countries. Source: IMF.`, url: 'https://statisticsoftheworld.com/gdp-ppp-by-country', creator: { '@type': 'Organization', name: 'IMF' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the largest GDP by PPP?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the largest GDP by PPP at ${formatValue(data[0]?.value, 'currency')}. In PPP terms, China's economy surpasses the US because prices are much lower in China — a dollar buys more there. India ranks 3rd by PPP, ahead of Japan and Germany. Source: IMF.` } },
      { '@type': 'Question', name: 'What is GDP PPP?', acceptedAnswer: { '@type': 'Answer', text: 'GDP at Purchasing Power Parity adjusts for price differences across countries. If a haircut costs $5 in India but $30 in Switzerland, PPP accounts for that difference. PPP provides a fairer comparison of what economies can actually buy with their output, making it the preferred measure for comparing living standards.' } },
      { '@type': 'Question', name: 'Why do economists use PPP instead of nominal GDP for some comparisons?', acceptedAnswer: { '@type': 'Answer', text: "Nominal GDP converts every country's output into US dollars at market exchange rates — which fluctuate with investor sentiment, capital flows, and central bank policy. A sharp yen depreciation, as Japan experienced in 2022–2026, mechanically reduces Japan's nominal GDP even if Japanese workers produce the same amount. PPP eliminates this distortion by pricing output in a common basket of goods. The World Bank and IMF use PPP-adjusted figures when comparing poverty rates, productivity, and living standards. Nominal GDP remains better for international financial comparisons (trade finance, debt capacity) because real-world cross-border transactions happen at market exchange rates. Source: IMF." } },
      { '@type': 'Question', name: "What is India's GDP PPP in 2026?", acceptedAnswer: { '@type': 'Answer', text: "India's GDP (PPP) is approximately $15 trillion in 2026, making it the world's third-largest economy by this measure — ahead of Japan and Germany. While India's nominal GDP is roughly $4.15 trillion (placing it 6th globally by nominal), PPP adjustment reflects that India's vast domestic service sector, agricultural output, and informal economy generate real production at prices far below global averages. India's PPP GDP has grown from under $2 trillion in 2000, reflecting sustained high real growth. Source: IMF World Economic Outlook." } },
      { '@type': 'Question', name: 'How does PPP ranking differ from nominal GDP ranking for developing countries?', acceptedAnswer: { '@type': 'Answer', text: 'PPP adjustments systematically raise the apparent economic size of developing countries and reduce the apparent dominance of rich ones. High-income countries have expensive services (housing, healthcare, legal fees) that inflate their nominal GDP; pricing these at international averages brings relative size down. Conversely, low-cost economies — where the same basket of goods costs far less — rank higher by PPP. The result: Indonesia, Brazil, Russia, Mexico, Turkey, and Saudi Arabia all rank significantly higher by PPP than by nominal GDP. Indonesia, for example, is a top-10 economy by PPP despite a more modest nominal ranking. Source: IMF ICP.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ranking/gdp" className="hover:text-gray-600 transition">GDP Rankings</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">GDP PPP by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">GDP by Purchasing Power Parity ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · PPP-adjusted GDP · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">#1 (PPP)</div><div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div><div className="text-[13px] text-[#94a3b8]">{formatValue(data[0]?.value, 'currency')}</div></div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">#2 (PPP)</div><div className="text-[24px] font-bold text-[#0d1b2a]">{data[1]?.country}</div><div className="text-[13px] text-[#94a3b8]">{formatValue(data[1]?.value, 'currency')}</div></div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5"><div className="text-[13px] text-[#94a3b8] mb-1">#3 (PPP)</div><div className="text-[24px] font-bold text-[#0d1b2a]">{data[2]?.country}</div><div className="text-[13px] text-[#94a3b8]">{formatValue(data[2]?.value, 'currency')}</div></div>
        </div>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">GDP at Purchasing Power Parity</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">PPP-adjusted GDP provides a dramatically different picture of global economic power than <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">nominal GDP</Link>. <Link href="/china-economy" className="text-[#0066cc] hover:underline">China&apos;s</Link> economy is substantially larger than <Link href="/us-economy" className="text-[#0066cc] hover:underline">America&apos;s</Link> in PPP terms — exceeding $35 trillion — because domestic purchasing power in China is much greater than dollar-denominated figures suggest. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> ranks third, ahead of <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> and <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link>, reflecting the reality that India&apos;s enormous domestic economy is severely understated by nominal GDP.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">PPP data is calculated by the International Comparison Program (ICP), which surveys prices of thousands of goods across countries. These surveys are resource-intensive and conducted every few years, so PPP figures carry more uncertainty than nominal GDP. PPP is most useful for comparing living standards and economic size; nominal GDP is better for measuring international purchasing power (e.g., buying imports, servicing dollar-denominated debt).</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The 2026 tariff environment adds a new dimension to the PPP vs. nominal debate. When the US imposed broad import tariffs in April 2025 ("Liberation Day"), domestic prices for traded goods rose — mechanically widening the gap between PPP and nominal GDP for the US relative to its trading partners. For China, trade barriers from major markets constrain export revenue and, over time, suppress real purchasing-power gains in tradeable sectors. The IMF's April 2026 WEO uses ICP 2017 benchmark data, adjusted forward with price indices — so PPP estimates carry ±5–10% structural uncertainty regardless of the year, more than nominal figures which are directly reported. Neither measure tells the full story: analysts monitoring the US-China economic competition track both in parallel.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The PPP gap between rich and developing countries is narrowing, but slowly. Sub-Saharan Africa remains the most understated region in nominal terms: a dollar in Tanzania or Ethiopia buys 3–5× what it purchases in the US, meaning nominal GDP vastly understates actual production. <Link href="/ranking/gdp-ppp" className="text-[#0066cc] hover:underline">Indonesia, Brazil, and Mexico</Link> rank dramatically higher by PPP than by nominal GDP — Indonesia is a top-10 economy by PPP. This matters for policy: the World Bank&apos;s poverty thresholds ($2.15/day, $3.65/day) are PPP-adjusted, ensuring poverty counts reflect real purchasing power rather than exchange-rate swings. Understanding where a country sits by PPP vs. nominal reveals whether it is genuinely poor or simply has a weak currency. Source: IMF, World Bank ICP.</p>
        </div>
        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full"><caption className="sr-only">GDP PPP by country. Source: IMF.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">GDP (PPP)</th><th scope="col" className="px-4 py-2.5 text-right">% of World</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/gdp-ppp`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'currency')}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px] text-[#64748b]">{d.value && totalGdpPPP ? ((d.value / totalGdpPPP) * 100).toFixed(1) + '%' : '—'}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/gdp-ppp" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Economic Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/gdp-by-country', label: 'GDP (Nominal)' },
              { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' },
              { href: '/gdp-growth-by-country', label: 'GDP Growth Rate' },
              { href: '/largest-economies', label: 'Largest Economies' },
              { href: '/richest-countries', label: 'Richest Countries' },
              { href: '/india-economy', label: 'India Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/brics-economy', label: 'BRICS Economy' },
              { href: '/g20-economy', label: 'G20 Economy' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/compare', label: 'Compare Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.href === '/compare' ? `${l.label} →` : `${l.label} →`}</Link>
            ))}
          </div>
        </div>
      </section><Footer /></main>);
}
