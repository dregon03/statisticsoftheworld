import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GDP PPP by Country 2026 — Purchasing Power Parity Rankings',
  description: 'GDP by purchasing power parity (PPP) by country: all countries ranked. By PPP, China\'s economy is larger than America\'s. The fairest measure of economic size. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gdp-ppp-by-country' },
};

export default async function GDPPPPByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.PPPGDP');
  const year = data[0]?.year || '2026';
  const totalGdpPPP = data.reduce((s, d) => s + (d.value || 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `GDP PPP by Country ${year}`, description: `GDP in purchasing power parity for ${data.length} countries. Source: IMF.`, url: 'https://statisticsoftheworld.com/gdp-ppp-by-country', creator: { '@type': 'Organization', name: 'IMF' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the largest GDP by PPP?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the largest GDP by PPP at ${formatValue(data[0]?.value, 'currency')}. In PPP terms, China's economy surpasses the US because prices are much lower in China — a dollar buys more there. India ranks 3rd by PPP, ahead of Japan and Germany. Source: IMF.` } },
      { '@type': 'Question', name: 'What is GDP PPP?', acceptedAnswer: { '@type': 'Answer', text: 'GDP at Purchasing Power Parity adjusts for price differences across countries. If a haircut costs $5 in India but $30 in Switzerland, PPP accounts for that difference. PPP provides a fairer comparison of what economies can actually buy with their output, making it the preferred measure for comparing living standards.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">GDP PPP by Country</span></nav>
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
        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/gdp-by-country', label: 'GDP (Nominal)' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/largest-economies', label: 'Largest Economies' }, { href: '/richest-countries', label: 'Richest Countries' }, { href: '/brics-economy', label: 'BRICS Economy' }, { href: '/g20-economy', label: 'G20 Economy' }, { href: '/china-economy', label: 'China Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
