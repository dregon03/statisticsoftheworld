import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Most Populous Countries in the World 2026 — Population Rankings',
  description: 'The most populous countries in the world in 2026: from India (1.44B) and China (1.42B) to the top 50 largest countries by population. Source: World Bank / UN.',
  alternates: { canonical: 'https://statisticsoftheworld.com/most-populous-countries' },
  openGraph: {
    title: 'Most Populous Countries 2026',
    description: 'Top 50 most populous countries. Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function MostPopulousCountriesPage() {
  const data = await getIndicatorForAllCountries('SP.POP.TOTL');
  const year = data[0]?.year || '2024';
  const totalPop = data.reduce((s, d) => s + (d.value || 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Most Populous Countries ${year}`, description: `Countries ranked by population. World total: ${(totalPop / 1e9).toFixed(2)} billion. Source: World Bank.`, url: 'https://statisticsoftheworld.com/most-populous-countries', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the most populous country in the world?', acceptedAnswer: { '@type': 'Answer', text: `India is the most populous country with approximately ${data[0]?.value ? (Number(data[0].value) / 1e9).toFixed(2) : '1.44'} billion people, having surpassed China in 2023. The top 10 most populous countries contain roughly 60% of the world's population. Source: World Bank / UN.` } },
      { '@type': 'Question', name: 'When did India surpass China in population?', acceptedAnswer: { '@type': 'Answer', text: 'India overtook China as the world\'s most populous country in mid-2023. This milestone was driven by China\'s decades-old one-child policy (which suppressed births) and India\'s higher fertility rate, though India\'s fertility has also been declining.' } },
      { '@type': 'Question', name: 'What will be the most populous country in 2050?', acceptedAnswer: { '@type': 'Answer', text: 'India will remain the most populous country through 2050 and beyond. Nigeria is projected to overtake the United States as the third most populous country by the 2040s. The world population is expected to peak at about 10.4 billion in the 2080s.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/population-by-country" className="hover:text-gray-600 transition">Population</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Most Populous Countries</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Most Populous Countries ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · World: {(totalPop / 1e9).toFixed(2)}B · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">#1</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div>
            <div className="text-[13px] text-[#94a3b8]">{data[0]?.value ? (Number(data[0].value) / 1e9).toFixed(2) : '—'}B</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">#2</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[1]?.country}</div>
            <div className="text-[13px] text-[#94a3b8]">{data[1]?.value ? (Number(data[1].value) / 1e9).toFixed(2) : '—'}B</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">World Total</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{(totalPop / 1e9).toFixed(2)}B</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The World&apos;s Most Populous Nations</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]"><Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> surpassed <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> as the world&apos;s most populous country in 2023 — a historic demographic milestone. Together, these two nations account for over 35% of all people on Earth. The top 10 most populous countries — also including the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>, <Link href="/indonesia-economy" className="text-[#0066cc] hover:underline">Indonesia</Link>, Pakistan, <Link href="/brazil-economy" className="text-[#0066cc] hover:underline">Brazil</Link>, <Link href="/nigeria-economy" className="text-[#0066cc] hover:underline">Nigeria</Link>, Bangladesh, <Link href="/russia-economy" className="text-[#0066cc] hover:underline">Russia</Link>, and <Link href="/mexico-economy" className="text-[#0066cc] hover:underline">Mexico</Link> — contain roughly 60% of the global population.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The demographic future is being reshaped by diverging <Link href="/fertility-rate-by-country" className="text-[#0066cc] hover:underline">fertility rates</Link>. Sub-Saharan Africa is the only region still experiencing rapid population growth — Nigeria is projected to become the world&apos;s third most populous country by the 2040s, surpassing the United States. Meanwhile, China&apos;s population is already declining due to its ultra-low fertility rate, and Japan, South Korea, and much of Europe face shrinking populations. The UN projects the world will reach about 10.4 billion by the 2080s before beginning a gradual decline.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Population size alone doesn&apos;t determine economic power — what matters is the interaction between population, age structure, and productivity. Countries with young, growing populations have the potential for a &quot;demographic dividend&quot; if they can educate and employ their youth. Countries with aging, shrinking populations face labor shortages and pension system strain. See our <Link href="/world-population" className="text-[#0066cc] hover:underline">world population analysis</Link> for deeper demographic trends.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Most populous countries in {year}. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Population</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/population`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'number')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/population-by-country" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/population-by-country', label: 'All Countries' }, { href: '/world-population', label: 'World Population' }, { href: '/fertility-rate-by-country', label: 'Fertility Rate' }, { href: '/ranking/population-growth', label: 'Population Growth' }, { href: '/largest-economies', label: 'Largest Economies' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/india-economy', label: 'India Economy' }, { href: '/china-economy', label: 'China Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
