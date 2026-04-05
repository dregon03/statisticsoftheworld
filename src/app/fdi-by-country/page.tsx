import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Foreign Direct Investment by Country 2026 — FDI Inflows Ranked',
  description: 'FDI by country: all countries ranked by foreign direct investment inflows as % of GDP. Which countries attract the most foreign investment? Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/fdi-by-country' },
};

export default async function FDIByCountryPage() {
  const data = await getIndicatorForAllCountries('BX.KLT.DINV.WD.GD.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `FDI Inflows by Country ${year}`, description: `Foreign direct investment as % of GDP for ${data.length} countries. Source: World Bank.`, url: 'https://statisticsoftheworld.com/fdi-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country receives the most FDI?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} receives the highest FDI inflows at ${formatValue(data[0]?.value, 'percent', 1)} of GDP. Small open economies and those with favorable investment climates tend to attract the most FDI relative to their size. In absolute terms, the US, China, and Singapore are the largest recipients.` } },
      { '@type': 'Question', name: 'What is FDI?', acceptedAnswer: { '@type': 'Answer', text: 'Foreign Direct Investment (FDI) is investment from a company or individual in one country into business operations in another, involving lasting management interest (typically 10%+ ownership). FDI differs from portfolio investment because it represents a long-term commitment to operating in the host country.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">FDI by Country</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Foreign Direct Investment by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · FDI inflows as % of GDP · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global FDI Flows</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Foreign direct investment represents long-term capital commitment to operating in another country — building factories, acquiring companies, or establishing new operations. Unlike portfolio investment (buying stocks), FDI brings technology transfer, management practices, and access to global supply chains. The <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>, <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link>, and <Link href="/singapore-economy" className="text-[#0066cc] hover:underline">Singapore</Link> are the world&apos;s largest FDI recipients in absolute terms.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">As a percentage of GDP, small open economies attract the most FDI — <Link href="/ireland-economy" className="text-[#0066cc] hover:underline">Ireland</Link>, Singapore, and Luxembourg have FDI stocks exceeding 100% of GDP. The nearshoring trend has redirected FDI flows, with <Link href="/mexico-economy" className="text-[#0066cc] hover:underline">Mexico</Link>, <Link href="/vietnam-economy" className="text-[#0066cc] hover:underline">Vietnam</Link>, and <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> benefiting from supply chain diversification away from China. FDI flows are tracked by UNCTAD via the World Bank.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full"><caption className="sr-only">FDI inflows as % of GDP by country. Source: World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">FDI (% GDP)</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/fdi-inflows`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/fdi-inflows" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/ranking/fdi-inflows', label: 'FDI Rankings' }, { href: '/trade-by-country', label: 'Trade Openness' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/gdp-growth-by-country', label: 'GDP Growth' }, { href: '/corruption-by-country', label: 'Corruption' }, { href: '/largest-economies', label: 'Largest Economies' }, { href: '/singapore-economy', label: 'Singapore Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
