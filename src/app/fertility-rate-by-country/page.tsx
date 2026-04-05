import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Fertility Rate by Country 2026 — Birth Rates Ranked',
  description: 'Total fertility rate by country: all countries ranked from highest to lowest birth rates. From Niger (6.5+ children/woman) to South Korea (<0.8). Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/fertility-rate-by-country' },
  openGraph: {
    title: 'Fertility Rate by Country 2026 — Global Rankings',
    description: 'All countries ranked by total fertility rate (births per woman). Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function FertilityRateByCountryPage() {
  const data = await getIndicatorForAllCountries('SP.DYN.TFRT.IN');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Fertility Rate by Country ${year}`, description: `Total fertility rate for ${data.length} countries. Global average: ${avg.toFixed(2)} children per woman. Source: World Bank / UN.`, url: 'https://statisticsoftheworld.com/fertility-rate-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest fertility rate?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest fertility rate at ${data[0]?.value ? Number(data[0].value).toFixed(2) : '—'} children per woman. Sub-Saharan African countries dominate the top of the rankings due to limited contraception access, lower female education, and agricultural economies where children provide labor.` } },
      { '@type': 'Question', name: 'What is the replacement-level fertility rate?', acceptedAnswer: { '@type': 'Answer', text: 'The replacement-level fertility rate is approximately 2.1 children per woman — the rate needed to maintain a stable population without immigration. Below this level, populations shrink over time. Most developed countries are well below replacement.' } },
      { '@type': 'Question', name: 'Which country has the lowest fertility rate?', acceptedAnswer: { '@type': 'Answer', text: `${data[data.length - 1]?.country} has the lowest fertility rate at ${data[data.length - 1]?.value ? Number(data[data.length - 1].value).toFixed(2) : '—'}. South Korea's rate below 0.8 is the lowest ever recorded for any country, creating an acute demographic crisis.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/fertility-rate" className="hover:text-gray-600 transition">Fertility Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Fertility Rate by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Fertility Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(2)} children/woman · Replacement level: 2.1 · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avg.toFixed(2)}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Lowest</div>
            <div className="text-[24px] font-bold text-red-600">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The Global Fertility Transition</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The global fertility transition is one of the most consequential demographic shifts in human history. In 1960, the average woman worldwide had 5 children; today the global total fertility rate (TFR) is approximately {avg.toFixed(1)} and falling. Every major world region has experienced fertility decline, including sub-Saharan Africa where rates have dropped from 6.7 to about 4.5. The drivers are remarkably consistent across cultures: female education, urbanization, access to contraception, declining child mortality (parents need fewer births to achieve desired family size), and the economic shift from agricultural to service economies.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The replacement-level fertility rate — 2.1 children per woman — is the threshold needed to maintain a stable <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population</Link> without immigration. Most of Europe, East Asia, and the Americas are now below replacement. South Korea&apos;s TFR has fallen below 0.8 — the lowest ever recorded for any country — creating an acute demographic crisis with a rapidly shrinking workforce and exploding elderly dependency ratio. <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link>, Italy, Spain, and much of Eastern Europe face similar trajectories.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">At the other extreme, {data[0]?.country}&apos;s TFR above {data[0]?.value ? Number(data[0].value).toFixed(1) : '6.0'} means its population will roughly triple by 2050, creating enormous pressure on education, employment, and resources. The fertility divide between sub-Saharan Africa (high) and East Asia/Europe (ultra-low) is reshaping the global demographic landscape. Today&apos;s birth rates determine tomorrow&apos;s labor force, consumer markets, and pension obligations — making fertility data crucial for long-term <Link href="/world-economy" className="text-[#0066cc] hover:underline">economic</Link> planning.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Total fertility rate by country. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Fertility Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/fertility-rate`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 4 ? 'text-amber-600' : (d.value || 0) < 1.5 ? 'text-red-600' : 'text-[#0d1b2a]'}>{d.value ? Number(d.value).toFixed(2) : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/fertility-rate" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/fertility-rate', label: 'Fertility Rankings' }, { href: '/population-by-country', label: 'Population' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/ranking/infant-mortality', label: 'Infant Mortality' }, { href: '/ranking/population-growth', label: 'Population Growth' }, { href: '/ranking/population-over-65', label: 'Aging Population' }, { href: '/world-population', label: 'World Population' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
