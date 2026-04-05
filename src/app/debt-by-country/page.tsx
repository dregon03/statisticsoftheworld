import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Government Debt by Country 2026 — Debt-to-GDP Ratios Ranked',
  description: 'Government debt to GDP ratio by country in 2026: all countries ranked from highest to lowest national debt. From Japan (250%+) to debt-free nations. Source: IMF.',
  alternates: { canonical: 'https://statisticsoftheworld.com/debt-by-country' },
  openGraph: {
    title: 'Government Debt by Country 2026 — Debt-to-GDP Rankings',
    description: 'All countries ranked by government debt as % of GDP. Source: IMF.',
    siteName: 'Statistics of the World',
  },
};

export default async function DebtByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.GGXWDG_NGDP');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Government Debt by Country ${year}`, description: `Government debt as % of GDP for ${data.length} countries. Global average: ${avg.toFixed(1)}%. Source: IMF.`, url: 'https://statisticsoftheworld.com/debt-by-country', creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `Which country has the highest debt-to-GDP ratio?`, acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest government debt at ${formatValue(data[0]?.value, 'percent', 1)} of GDP. Japan has sustained ultra-high debt levels due to domestic savings, a current account surplus, and the Bank of Japan holding roughly half of all government bonds.` } },
      { '@type': 'Question', name: 'What is a safe level of government debt?', acceptedAnswer: { '@type': 'Answer', text: 'There is no universal "safe" level. The IMF considers 60% of GDP a common benchmark for advanced economies, but sustainability depends on interest rates, growth rates, currency, and institutional credibility. The US sustains 120%+ because of dollar reserve status; Greece needed bailouts at similar levels.' } },
      { '@type': 'Question', name: 'How does government debt affect the economy?', acceptedAnswer: { '@type': 'Answer', text: 'High debt can crowd out private investment through higher interest rates, reduce fiscal flexibility during crises, and create vulnerability to market sentiment shifts. However, debt-financed productive investment can accelerate growth if the return exceeds the borrowing cost.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/government-debt" className="hover:text-gray-600 transition">Debt Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Debt by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Government Debt by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked by debt-to-GDP · Global average: {avg.toFixed(1)}% · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avg.toFixed(1)}%</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest Debt</div>
            <div className="text-[24px] font-bold text-red-600">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Lowest Debt</div>
            <div className="text-[24px] font-bold text-green-600">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Government Debt Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Government debt as a percentage of GDP is the standard measure of fiscal sustainability — it tells you how much a government owes relative to the size of its economy. The global debt landscape has shifted dramatically since the 2008 financial crisis and especially since the COVID-19 pandemic, when governments worldwide borrowed trillions to fund stimulus packages, vaccine rollouts, and economic relief programs. Advanced economy debt-to-GDP ratios jumped from an average of about 70% before 2008 to over 110% by {year}.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">{data[0]?.country} leads with government debt exceeding {data[0]?.value ? Number(data[0].value).toFixed(0) : '250'}% of GDP — a level that would be unsustainable for most countries but is managed through Japan&apos;s unique combination of massive domestic savings, a persistent current account surplus, and a central bank that holds roughly half of all government bonds. The <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> sustains debt above 120% of GDP because the dollar is the world&apos;s reserve currency and Treasury securities are the global safe asset. Greece, with similar nominal debt levels, required multiple bailouts because it couldn&apos;t print its own currency.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">For emerging markets, the sustainability threshold is typically lower — the IMF considers debt above 60% of GDP a warning signal for developing countries because they face higher borrowing costs, greater currency risk, and more volatile capital flows. The key variables determining whether debt is dangerous are the interest rate paid on the debt versus the economy&apos;s <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">growth rate</Link>, the currency denomination of borrowing, and the credibility of fiscal institutions. Countries borrowing in their own currency with independent central banks have far more room to maneuver than those borrowing in dollars or euros.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Government debt to GDP by country in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Debt (% of GDP)</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/government-debt`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 100 ? 'text-red-600' : (d.value || 0) > 60 ? 'text-amber-600' : 'text-green-600'}>{formatValue(d.value, 'percent', 1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/government-debt" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/government-debt', label: 'Debt Rankings' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/inflation-by-country', label: 'Inflation Rates' }, { href: '/ranking/current-account', label: 'Current Account' }, { href: '/ranking/tax-revenue', label: 'Tax Revenue' }, { href: '/us-economy', label: 'US Economy' }, { href: '/japan-economy', label: 'Japan Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
