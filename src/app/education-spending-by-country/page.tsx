import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Education Spending by Country 2026 — Government Expenditure Ranked',
  description: 'Education spending by country as % of GDP: all countries ranked by government expenditure on education. From Nordic leaders (6-8%) to underfunded nations. Source: World Bank / UNESCO.',
  alternates: { canonical: 'https://statisticsoftheworld.com/education-spending-by-country' },
  openGraph: {
    title: 'Education Spending by Country 2026 — Global Rankings',
    description: 'All countries ranked by government education expenditure as % of GDP. Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function EducationSpendingByCountryPage() {
  const data = await getIndicatorForAllCountries('SE.XPD.TOTL.GD.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Education Spending by Country ${year}`, description: `Government education expenditure as % of GDP for ${data.length} countries. Global average: ${avg.toFixed(1)}%. Source: World Bank / UNESCO.`, url: 'https://statisticsoftheworld.com/education-spending-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country spends the most on education?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} spends the most on education at ${formatValue(data[0]?.value, 'percent', 1)} of GDP. Nordic countries consistently spend 6-8% of GDP on education and achieve some of the world's best educational outcomes.` } },
      { '@type': 'Question', name: 'Does more education spending mean better outcomes?', acceptedAnswer: { '@type': 'Answer', text: 'Not always. South Korea and Singapore achieve world-class educational outcomes with moderate spending through selective teacher recruitment, rigorous curricula, and cultural emphasis on education. How money is spent matters as much as how much is spent.' } },
      { '@type': 'Question', name: 'What is the global average education spending?', acceptedAnswer: { '@type': 'Answer', text: `The global average for government education spending is approximately ${avg.toFixed(1)}% of GDP. The UNESCO target is at least 4-6% of GDP or 15-20% of public expenditure. Many developing countries fall well below this threshold.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/education-spending" className="hover:text-gray-600 transition">Education Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Education Spending by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Education Spending by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% of GDP · Source: World Bank / UNESCO · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

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
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Investment in Education Worldwide</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Government expenditure on education as a percentage of GDP indicates how much priority a country places on investing in human capital development. This includes spending on schools, universities, teacher salaries, educational materials, and related infrastructure. The UNESCO target recommends countries spend at least 4-6% of GDP or 15-20% of public expenditure on education, but many developing countries fall well below this threshold due to competing priorities and limited fiscal capacity.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nordic countries consistently spend 6-8% of GDP on education and achieve some of the world&apos;s best outcomes as measured by PISA scores and tertiary attainment. However, education spending alone does not determine quality — <em>how</em> the money is spent matters as much as how much. South Korea and Singapore achieve world-class outcomes with moderate spending through highly selective teacher recruitment, rigorous curricula, and strong cultural emphasis on learning. Meanwhile, some countries with high budgets show mediocre results due to bureaucratic inefficiency or curricula misaligned with labor market needs.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Education spending is one of the strongest long-term investments a government can make. Countries that invested heavily in education during their development phase — <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link>, South Korea, Taiwan, Singapore — are now among the world&apos;s most prosperous. The return on education investment is particularly high for girls&apos; education in developing countries: each additional year of schooling increases a woman&apos;s earnings by 10-20% and reduces <Link href="/fertility-rate-by-country" className="text-[#0066cc] hover:underline">fertility rates</Link>, improving both individual and national economic outcomes.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Education spending as % of GDP by country. Source: World Bank.</caption>
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
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/education-spending`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/education-spending" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/education-spending', label: 'Education Rankings' }, { href: '/health-spending-by-country', label: 'Health Spending' }, { href: '/ranking/rd-spending', label: 'R&D Spending' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/ranking/internet-users', label: 'Internet Users' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/fertility-rate-by-country', label: 'Fertility Rate' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
