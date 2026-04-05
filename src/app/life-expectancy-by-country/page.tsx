import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Life Expectancy by Country 2026 — Complete Global Rankings',
  description: 'Life expectancy by country in 2026: all countries ranked from highest to lowest. From Japan (84+ years) to sub-Saharan Africa. Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/life-expectancy-by-country' },
};

export default async function LifeExpectancyByCountryPage() {
  const data = await getIndicatorForAllCountries('SP.DYN.LE00.IN');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Life Expectancy by Country ${year}`, description: `Life expectancy at birth for ${data.length} countries. Global average: ${avg.toFixed(1)} years. Source: World Bank.`, url: 'https://statisticsoftheworld.com/life-expectancy-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `Which country has the highest life expectancy?`, acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest life expectancy at ${data[0]?.value ? Number(data[0].value).toFixed(1) : '—'} years. Source: World Bank.` } },
      { '@type': 'Question', name: 'What is the global average life expectancy?', acceptedAnswer: { '@type': 'Answer', text: `The global average life expectancy is approximately ${avg.toFixed(1)} years. Life expectancy has increased dramatically from 47 years in 1950 to over 73 years today, driven by reductions in infant mortality, control of infectious diseases, and better nutrition.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/life-expectancy" className="hover:text-gray-600 transition">Life Expectancy Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Life Expectancy by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Life Expectancy by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)} years · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Life Expectancy</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Life expectancy at birth estimates the average number of years a newborn would live if current mortality rates persisted. It is one of the most powerful measures of a country&apos;s health and development. {data[0]?.country} leads at {data[0]?.value ? Number(data[0].value).toFixed(1) : '—'} years, while {data[data.length-1]?.country} has the lowest at {data[data.length-1]?.value ? Number(data[data.length-1].value).toFixed(1) : '—'} years — a gap of roughly 30 years reflecting vast differences in healthcare access, nutrition, and living conditions.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">COVID-19 caused the first significant global decline in life expectancy in decades, with severe impacts in Latin America, South Asia, and Eastern Europe. Most countries have since recovered, though the US has seen slower recovery than peers. Beyond infectious disease, the main determinants of life expectancy are access to healthcare, nutrition, environmental quality, and behavioral factors. Life expectancy data is sourced from the <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank</a>.</p>
        </div>
        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Life expectancy at birth by country. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Life Expectancy</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 40).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/life-expectancy`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{d.value ? `${Number(d.value).toFixed(1)} years` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/life-expectancy" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/life-expectancy', label: 'Full Rankings' }, { href: '/ranking/infant-mortality', label: 'Infant Mortality' }, { href: '/ranking/health-spending', label: 'Health Spending' }, { href: '/ranking/fertility-rate', label: 'Fertility Rate' }, { href: '/world-population', label: 'World Population' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
