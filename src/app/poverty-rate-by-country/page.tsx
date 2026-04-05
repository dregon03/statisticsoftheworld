import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Poverty Rate by Country 2026 — Extreme Poverty Rankings',
  description: 'Poverty rate by country: all countries ranked by the share of population living on less than $2.15/day. Global poverty trends and extreme poverty data. Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/poverty-rate-by-country' },
  openGraph: {
    title: 'Poverty Rate by Country 2026 — Global Rankings',
    description: 'All countries ranked by extreme poverty rate ($2.15/day). Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function PovertyRateByCountryPage() {
  const data = await getIndicatorForAllCountries('SI.POV.DDAY');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Poverty Rate by Country ${year}`, description: `Extreme poverty rate ($2.15/day) for ${data.length} countries. Source: World Bank PovcalNet.`, url: 'https://statisticsoftheworld.com/poverty-rate-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest poverty rate?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest extreme poverty rate at ${formatValue(data[0]?.value, 'percent', 1)} of its population living on less than $2.15 per day. Sub-Saharan Africa accounts for over 60% of the world's extreme poor.` } },
      { '@type': 'Question', name: 'How many people live in extreme poverty?', acceptedAnswer: { '@type': 'Answer', text: 'Approximately 700 million people live on less than $2.15 per day (2017 PPP). Global extreme poverty has declined from 36% in 1990 to under 9% today, driven primarily by China\'s growth which lifted 800 million people above the poverty line.' } },
      { '@type': 'Question', name: 'What is the international poverty line?', acceptedAnswer: { '@type': 'Answer', text: 'The World Bank\'s international poverty line is $2.15 per day in 2017 purchasing power parity (PPP) terms. This threshold represents the minimum needed to meet basic nutritional needs. The Bank also tracks higher thresholds: $3.65/day (lower-middle-income) and $6.85/day (upper-middle-income).' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/poverty-rate" className="hover:text-gray-600 transition">Poverty Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Poverty Rate by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Poverty Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Poverty line: $2.15/day · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Poverty Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The decline of extreme poverty is one of humanity&apos;s greatest achievements. In 1990, 36% of the world&apos;s population — nearly 2 billion people — lived on less than $2.15 per day (2017 PPP). Today, that figure has fallen below 9%, representing approximately 700 million people. This reduction was driven primarily by <Link href="/china-economy" className="text-[#0066cc] hover:underline">China&apos;s</Link> extraordinary economic growth, which lifted 800 million people above the poverty line in three decades — the largest poverty reduction in human history.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">However, progress has been deeply uneven. Sub-Saharan Africa now accounts for over 60% of the world&apos;s extreme poor, a concentration that reflects slower economic growth, high <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population growth</Link>, conflict, and weak institutions. Several countries — including Madagascar, the DRC, Mozambique, and South Sudan — have poverty rates exceeding 70%, meaning the vast majority of their population lives on less than what would buy a basic meal in a wealthy country. The COVID-19 pandemic reversed years of progress, pushing an estimated 70 million additional people into extreme poverty.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Measuring poverty through income alone misses important dimensions. Access to healthcare, education, clean water, and social protection can make the real experience of poverty better or worse than the $2.15 threshold suggests. The World Bank also tracks higher poverty lines: $3.65/day (relevant for lower-middle-income countries) and $6.85/day (upper-middle-income). By the $6.85 threshold, nearly half the world&apos;s population is poor. Poverty data is inherently lagged — many countries only conduct household surveys every 3-5 years — so the rankings should be interpreted as the best available estimates rather than real-time measurements.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Poverty rate by country (% living on less than $2.15/day). Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Poverty Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/poverty-rate`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 30 ? 'text-red-600' : (d.value || 0) > 10 ? 'text-amber-600' : 'text-green-600'}>{formatValue(d.value, 'percent', 1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/poverty-rate" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/poverty-rate', label: 'Poverty Rankings' }, { href: '/ranking/gini-index', label: 'Inequality (Gini)' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/population-by-country', label: 'Population' }, { href: '/ranking/infant-mortality', label: 'Infant Mortality' }, { href: '/india-economy', label: 'India Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
