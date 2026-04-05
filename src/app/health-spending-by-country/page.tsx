import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Health Spending by Country 2026 — Healthcare Expenditure Ranked',
  description: 'Health spending by country as % of GDP: all countries ranked by healthcare expenditure. The US spends 17% while some countries spend under 3%. Source: World Bank / WHO.',
  alternates: { canonical: 'https://statisticsoftheworld.com/health-spending-by-country' },
  openGraph: {
    title: 'Health Spending by Country 2026 — Global Rankings',
    description: 'All countries ranked by healthcare expenditure as % of GDP. Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function HealthSpendingByCountryPage() {
  const data = await getIndicatorForAllCountries('SH.XPD.CHEX.GD.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Health Spending by Country ${year}`, description: `Healthcare expenditure as % of GDP for ${data.length} countries. Global average: ${avg.toFixed(1)}%. Source: World Bank / WHO.`, url: 'https://statisticsoftheworld.com/health-spending-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country spends the most on healthcare?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} spends the most on healthcare at ${formatValue(data[0]?.value, 'percent', 1)} of GDP. The United States is a dramatic outlier at roughly 17% of GDP — nearly double the OECD average — yet has lower life expectancy than most wealthy nations.` } },
      { '@type': 'Question', name: 'Does more health spending mean better outcomes?', acceptedAnswer: { '@type': 'Answer', text: 'Not necessarily. Japan and South Korea achieve world-class health outcomes (84+ year life expectancy) while spending only 8-9% of GDP. The US spends 17% but has lower life expectancy than peers, reflecting inefficiencies in administrative costs, pharmaceutical pricing, and insurance fragmentation.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/health-spending" className="hover:text-gray-600 transition">Health Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Health Spending by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Health Spending by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% of GDP · Source: World Bank / WHO · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avg.toFixed(1)}%</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest Spender</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Lowest Spender</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Healthcare Expenditure Across the World</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Health expenditure as a percentage of GDP measures how much of a country&apos;s economic output is devoted to healthcare, including both public spending (government budgets, social insurance) and private spending (out-of-pocket payments, private insurance). The <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> is a dramatic outlier: it spends roughly 17% of GDP on healthcare — nearly double the OECD average of 9%. Despite this, the US has lower <Link href="/life-expectancy-by-country" className="text-[#0066cc] hover:underline">life expectancy</Link> and higher infant mortality than most wealthy nations.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">This paradox reflects the inefficiency of the US healthcare system, where administrative costs, pharmaceutical pricing, and fragmented insurance markets consume resources without proportionally improving outcomes. In contrast, countries like <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> and South Korea achieve some of the world&apos;s best health outcomes while spending only 8-9% of GDP. Nordic countries spend 10-12% and deliver universal coverage with excellent outcomes.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">For developing countries, health spending below 5% of GDP typically signals inadequate healthcare infrastructure. Sub-Saharan African countries often spend 3-4%, resulting in doctor-to-patient ratios far below WHO recommendations. The COVID-19 pandemic exposed these disparities: countries with robust health spending weathered the crisis far better than those with underfunded systems. International health financing through Gavi, the Global Fund, and bilateral aid fills part of the gap, but sustainable improvement requires domestic resource mobilization.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Health spending as % of GDP by country. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">% of GDP</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/health-spending`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/health-spending" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/health-spending', label: 'Health Rankings' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/ranking/infant-mortality', label: 'Infant Mortality' }, { href: '/education-spending-by-country', label: 'Education Spending' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/population-by-country', label: 'Population' }, { href: '/us-economy', label: 'US Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
