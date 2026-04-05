import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'GDP Growth Rate by Country 2026 — Fastest & Slowest Economies',
  description: 'Real GDP growth rate by country in 2026: all countries ranked from fastest to slowest growing economies. Source: IMF World Economic Outlook.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gdp-growth-by-country' },
};

export default async function GdpGrowthByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.NGDP_RPCH');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `GDP Growth by Country ${year}`, description: `Real GDP growth rate for ${data.length} countries in ${year}. Global average: ${avg.toFixed(1)}%. Source: IMF.`, url: 'https://statisticsoftheworld.com/gdp-growth-by-country', creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `Which country has the fastest GDP growth in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest real GDP growth rate at ${formatValue(data[0]?.value, 'percent', 1)} in ${year}. Source: IMF.` } },
      { '@type': 'Question', name: `What is the global average GDP growth rate in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The global average GDP growth rate is approximately ${avg.toFixed(1)}% in ${year}. Advanced economies typically grow at 1-3%, while emerging markets grow at 4-7%. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/gdp-growth" className="hover:text-gray-600 transition">GDP Growth Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">GDP Growth by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">GDP Growth Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Growth Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Real GDP growth measures the annual change in economic output after adjusting for inflation. In {year}, the global average is approximately {avg.toFixed(1)}%, but the variation is enormous. The fastest-growing economies are typically small commodity exporters experiencing booms, post-conflict recoveries, or rapidly industrializing emerging markets. Advanced economies like the US, EU, and Japan typically grow at 1-3%, reflecting mature economies with high productivity levels.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Sustained growth above 5% for decades is historically rare and transformative. China maintained roughly 10% annual growth from 1980 to 2010, and India is currently on a similar trajectory at 6-7%. The fastest-growing economies in any given year often include countries like Guyana (oil discovery), Libya (post-war recovery), or small economies experiencing one-time booms. For meaningful comparison, focus on the growth rates of the world&apos;s <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">top 20 economies by GDP</Link>.</p>
        </div>
        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">GDP growth rate by country in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 40).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/gdp-growth`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 0 ? 'text-green-600' : 'text-red-500'}>{formatValue(d.value, 'percent', 1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/gdp-growth" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/gdp-growth', label: 'Growth Rankings' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/inflation-by-country', label: 'Inflation by Country' }, { href: '/world-economy', label: 'World Economy' }, { href: '/us-economy', label: 'US Economy' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
