import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Tourism by Country 2026 — International Arrivals Ranked',
  description: 'Tourism by country: all countries ranked by international tourist arrivals. France leads with 90M+ visitors. Source: UNWTO / World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/tourism-by-country' },
};

export default async function TourismByCountryPage() {
  const data = await getIndicatorForAllCountries('ST.INT.ARVL');
  const year = data[0]?.year || '2024';
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Tourism by Country ${year}`, description: `International tourism arrivals for ${data.length} countries. Source: UNWTO / World Bank.`, url: 'https://statisticsoftheworld.com/tourism-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country receives the most tourists?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} receives the most international tourists with ${formatValue(data[0]?.value, 'number')} arrivals. France consistently leads with roughly 90 million visitors per year — more than its own population. Spain, the US, Italy, and Turkey round out the top five.` } },
      { '@type': 'Question', name: 'How much does tourism contribute to the global economy?', acceptedAnswer: { '@type': 'Answer', text: 'Tourism generates over 10% of global GDP when direct, indirect, and induced effects are counted. For many island nations and developing countries, tourism is the primary source of foreign exchange and employment.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Tourism by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Tourism by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · International arrivals · Source: UNWTO / World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Tourism Rankings</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]"><Link href="/france-economy" className="text-[#0066cc] hover:underline">France</Link> consistently leads with roughly 90 million international visitors per year — more than its own population. <Link href="/spain-economy" className="text-[#0066cc] hover:underline">Spain</Link>, the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>, <Link href="/italy-economy" className="text-[#0066cc] hover:underline">Italy</Link>, and <Link href="/turkey-economy" className="text-[#0066cc] hover:underline">Turkey</Link> round out the top five. Tourism generates over 10% of global GDP when all effects are counted, and for many island nations and developing countries it is the primary economic lifeline.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The COVID-19 pandemic devastated international tourism, with arrivals falling 73% in 2020. Recovery has been uneven: European tourism rebounded fastest, while Asian markets recovered more slowly. Climate change poses a long-term threat — rising sea levels threaten island destinations, extreme heat is making summer Mediterranean travel less attractive, and snow-dependent ski resorts face shorter seasons.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">International tourism arrivals by country. Source: UNWTO / World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">Arrivals</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/tourism-arrivals`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'number')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/tourism-arrivals" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/tourism-arrivals', label: 'Full Rankings' }, { href: '/france-economy', label: 'France Economy' }, { href: '/spain-economy', label: 'Spain Economy' }, { href: '/italy-economy', label: 'Italy Economy' }, { href: '/turkey-economy', label: 'Turkey Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/largest-economies', label: 'Largest Economies' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
