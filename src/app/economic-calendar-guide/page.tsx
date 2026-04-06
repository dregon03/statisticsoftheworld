import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Economic Calendar Guide 2026 — Key Data Releases, Central Bank Meetings & Events',
  description: 'Complete guide to the global economic calendar: IMF WEO releases, Fed/ECB/BoJ meetings, GDP reports, jobs data, CPI releases, and major economic events in 2026. When macroeconomic data is published.',
  alternates: { canonical: 'https://statisticsoftheworld.com/economic-calendar-guide' },
};

export default function EconomicCalendarGuidePage() {
  return (
    <main className="min-h-screen"><Nav />
      <section className="max-w-[800px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">Economic Calendar Guide</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-4">Economic Calendar Guide — 2026</h1>
        <p className="text-[15px] text-[#64748b] mb-8">When the world&apos;s most important macroeconomic data is released</p>

        <div className="space-y-8 text-[15px] text-[#374151] leading-[1.8]">
          <p>The global economic calendar determines when markets move, when forecasts are revised, and when the data powering <Link href="/" className="text-[#0066cc] hover:underline">Statistics of the World</Link> is updated. Understanding the release schedule helps researchers, investors, and policymakers anticipate data availability and market impact.</p>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">IMF World Economic Outlook (April & October)</h2>
            <p>The most important data release for international macroeconomic comparisons. The IMF publishes comprehensive <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">GDP</Link>, <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">growth</Link>, <Link href="/inflation-by-country" className="text-[#0066cc] hover:underline">inflation</Link>, <Link href="/unemployment-by-country" className="text-[#0066cc] hover:underline">unemployment</Link>, and <Link href="/debt-by-country" className="text-[#0066cc] hover:underline">debt</Link> data for 193 countries. The April edition typically contains more significant revisions than October. Our database updates within 48 hours of each release.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Central Bank Meetings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">US Federal Reserve (FOMC)</h3>
                <p className="text-[14px]">8 meetings per year (~every 6 weeks). Sets the federal funds rate, the world&apos;s most important interest rate. Press conference and dot plot after each meeting. Minutes released 3 weeks later.</p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">European Central Bank (ECB)</h3>
                <p className="text-[14px]">6 rate-setting meetings per year. Sets rates for the 20 eurozone countries. Press conference after each meeting. Staff projections published quarterly.</p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">Bank of Japan (BoJ)</h3>
                <p className="text-[14px]">8 meetings per year. Historically maintained ultra-loose policy (negative rates, yield curve control) but began normalizing in 2024. Outlook Report published quarterly.</p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">Bank of England (BoE)</h3>
                <p className="text-[14px]">8 meetings per year. Sets rates for the UK economy. Monetary Policy Report published quarterly with updated projections.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Key US Data Releases (Monthly)</h2>
            <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
              <table className="w-full text-[14px]">
                <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th className="px-4 py-2.5">Release</th><th className="px-4 py-2.5">Timing</th><th className="px-4 py-2.5">Why It Matters</th></tr></thead>
                <tbody>
                  <tr className="border-b border-[#edf0f5]"><td className="px-4 py-2.5 font-medium">Nonfarm Payrolls (Jobs Report)</td><td className="px-4 py-2.5">1st Friday of month</td><td className="px-4 py-2.5">The most market-moving US data release</td></tr>
                  <tr className="border-b border-[#edf0f5]"><td className="px-4 py-2.5 font-medium">CPI (Inflation)</td><td className="px-4 py-2.5">~10th-14th of month</td><td className="px-4 py-2.5">Directly affects Fed rate decisions</td></tr>
                  <tr className="border-b border-[#edf0f5]"><td className="px-4 py-2.5 font-medium">GDP (Quarterly)</td><td className="px-4 py-2.5">Advance: ~4 weeks after quarter end</td><td className="px-4 py-2.5">Broadest measure of economic activity</td></tr>
                  <tr className="border-b border-[#edf0f5]"><td className="px-4 py-2.5 font-medium">PCE Deflator</td><td className="px-4 py-2.5">Last week of month</td><td className="px-4 py-2.5">The Fed&apos;s preferred inflation measure</td></tr>
                  <tr className="border-b border-[#edf0f5]"><td className="px-4 py-2.5 font-medium">ISM Manufacturing PMI</td><td className="px-4 py-2.5">1st business day of month</td><td className="px-4 py-2.5">Leading indicator of economic direction</td></tr>
                  <tr><td className="px-4 py-2.5 font-medium">Retail Sales</td><td className="px-4 py-2.5">Mid-month</td><td className="px-4 py-2.5">Consumer spending = 70% of US GDP</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">World Bank Data Updates</h2>
            <p>The World Bank updates its <Link href="/data-sources" className="text-[#0066cc] hover:underline">World Development Indicators</Link> on a rolling basis, with major annual updates typically in April-June. Health indicators from the WHO are updated annually. <Link href="/population-by-country" className="text-[#0066cc] hover:underline">Population</Link> data comes from the UN Population Division, updated biennially. Our pipeline checks for new data weekly.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Major Annual Events</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>January</strong>: World Economic Forum (Davos) — sets global policy agenda</li>
              <li><strong>April</strong>: IMF/World Bank Spring Meetings + WEO release</li>
              <li><strong>June</strong>: <Link href="/g7-economy" className="text-[#0066cc] hover:underline">G7</Link> Summit</li>
              <li><strong>September</strong>: UN General Assembly + <Link href="/g20-economy" className="text-[#0066cc] hover:underline">G20</Link> Summit</li>
              <li><strong>October</strong>: IMF/World Bank Annual Meetings + WEO October release</li>
              <li><strong>November</strong>: COP Climate Conference — economic implications of climate commitments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">How We Use the Calendar</h2>
            <p>Statistics of the World updates its database according to source release schedules. IMF data refreshes within 48 hours of WEO publication. World Bank indicators update weekly as new series become available. Financial market data updates daily. See our <Link href="/methodology" className="text-[#0066cc] hover:underline">methodology page</Link> for complete details on our data pipeline.</p>
          </section>
        </div>

        <div className="mt-10 border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/calendar', label: 'Live Calendar' }, { href: '/methodology', label: 'Methodology' }, { href: '/data-sources', label: 'Data Sources' }, { href: '/world-economy', label: 'World Economy' }, { href: '/us-economy', label: 'US Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/inflation-by-country', label: 'Inflation' }, { href: '/glossary', label: 'Glossary' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
