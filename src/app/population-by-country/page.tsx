import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getIndicatorForAllCountries('SP.POP.TOTL');
  const year = data[0]?.year || '2026';
  const totalPop = data.reduce((s, d) => s + (d.value || 0), 0);
  return {
    title: `Population by Country ${year} — ${data.length} Countries Ranked`,
    description: `World population: ${(totalPop / 1e9).toFixed(2)}B across ${data.length} countries. #1 ${data[0]?.country} (${formatValue(data[0]?.value, 'number')}), #2 ${data[1]?.country} (${formatValue(data[1]?.value, 'number')}), #3 ${data[2]?.country}. Source: World Bank.`,
    alternates: { canonical: 'https://statisticsoftheworld.com/population-by-country' },
  };
}

export default async function PopulationByCountryPage() {
  const data = await getIndicatorForAllCountries('SP.POP.TOTL');
  const year = data[0]?.year || '2024';
  const totalPop = data.reduce((s, d) => s + (d.value || 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Population by Country ${year}`, description: `Population for ${data.length} countries. World total: ${(totalPop / 1e9).toFixed(2)} billion. Source: World Bank.`, url: 'https://statisticsoftheworld.com/population-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the most populous country in the world?', acceptedAnswer: { '@type': 'Answer', text: `India is the most populous country with approximately ${data[0]?.value ? (Number(data[0].value) / 1e9).toFixed(2) : '1.44'} billion people, having overtaken China in 2023. Together, India and China account for over 35% of the world\'s population.` } },
      { '@type': 'Question', name: `What is the world population in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The world population in ${year} is approximately ${(totalPop / 1e9).toFixed(2)} billion people. Global population growth has slowed to about 0.8% per year and is projected to peak around 10.4 billion in the 2080s before beginning a gradual decline.` } },
      { '@type': 'Question', name: 'Which country has the smallest population?', acceptedAnswer: { '@type': 'Answer', text: `Among sovereign states tracked by the World Bank, ${data[data.length - 1]?.country} has the smallest population at approximately ${formatValue(data[data.length - 1]?.value, 'number')}.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/population" className="hover:text-gray-600 transition">Population Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Population by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Population by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · World total: {(totalPop / 1e9).toFixed(2)} billion · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">World Population</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{(totalPop / 1e9).toFixed(2)}B</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Most Populous</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Least Populous</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">World Population by Country</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The world&apos;s population has grown from 2.5 billion in 1950 to over 8 billion today, one of the most dramatic transformations in human history. However, this growth is profoundly uneven. India surpassed China as the world&apos;s most populous country in 2023, a milestone driven by China&apos;s decades-old one-child policy and India&apos;s younger demographic profile. Together, these two nations account for more than a third of all people on Earth. The top 10 most populous countries — including the United States, Indonesia, Pakistan, Brazil, Nigeria, Bangladesh, Russia, and Mexico — contain roughly 60% of the global population.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Global population growth has decelerated sharply, from over 2% annually in the 1960s to approximately 0.8% today. The UN projects the world will reach about 10.4 billion by the 2080s before beginning a gradual decline. The drivers of this slowdown are universal: rising female education, urbanization, access to contraception, and the economic transition from agriculture to services all reduce <Link href="/fertility-rate-by-country" className="text-[#0066cc] hover:underline">fertility rates</Link>. Sub-Saharan Africa remains the fastest-growing region, with countries like Niger, Chad, and the Democratic Republic of Congo growing at 3% per year — doubling every 23 years.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Population size alone doesn&apos;t determine economic power. The critical factors are age structure, productivity, and human capital. Countries with large working-age populations relative to dependents (children and elderly) enjoy a &quot;demographic dividend&quot; that can turbocharge growth — this is the opportunity facing India, Indonesia, and parts of Africa. Countries with aging, shrinking populations — <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link>, South Korea, much of <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Europe</Link> — face the opposite challenge: fewer workers supporting more retirees. For a deeper view of demographic trends, see our <Link href="/world-population" className="text-[#0066cc] hover:underline">world population overview</Link> and <Link href="/life-expectancy-by-country" className="text-[#0066cc] hover:underline">life expectancy rankings</Link>.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Population by country. Source: World Bank.</caption>
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
          <div className="mt-3 text-right"><Link href="/ranking/population" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/population', label: 'Full Rankings' }, { href: '/ranking/population-growth', label: 'Population Growth' }, { href: '/fertility-rate-by-country', label: 'Fertility Rates' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/world-population', label: 'World Population' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/ranking/urban-population', label: 'Urbanization' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
