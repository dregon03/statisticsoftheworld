import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Inflation Rate by Country 2026 — Complete Global Rankings',
  description: 'Inflation rate by country 2026: all 218 countries ranked by CPI — from deflation to hyperinflation. Includes global average, regional trends, and links to country-level data. Source: IMF World Economic Outlook.',
  alternates: { canonical: 'https://statisticsoftheworld.com/inflation-by-country' },
  openGraph: {
    title: 'Inflation Rate by Country 2026 — World Rankings',
    description: 'All 218 countries ranked by CPI inflation. Venezuela 680%+, global avg ~8.7%, US above target, China in deflation. Source: IMF World Economic Outlook.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/inflation-by-country',
    type: 'website',
  },
};

export default async function InflationByCountryPage() {
  const inflData = await getIndicatorForAllCountries('IMF.PCPIPCH');
  const year = inflData[0]?.year || '2026';
  const avgInfl = inflData.length > 0 ? inflData.reduce((s, d) => s + (d.value || 0), 0) / inflData.length : 0;
  const medianInfl = inflData.length > 0 ? inflData[Math.floor(inflData.length / 2)]?.value || 0 : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Inflation Rankings', item: 'https://statisticsoftheworld.com/ranking/inflation-rate' },
          { '@type': 'ListItem', position: 3, name: `Inflation by Country ${year}`, item: 'https://statisticsoftheworld.com/inflation-by-country' },
        ],
      },
      {
        '@type': 'Dataset',
        name: `Inflation Rate by Country ${year}`,
        description: `Consumer price inflation for ${inflData.length} countries in ${year}. Average inflation: ${avgInfl.toFixed(1)}%. Source: IMF World Economic Outlook.`,
        url: 'https://statisticsoftheworld.com/inflation-by-country',
        creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `Which country has the highest inflation in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${inflData[0]?.country} has the highest inflation rate at ${formatValue(inflData[0]?.value, 'percent', 1)} in ${year}. Countries with very high inflation typically face currency crises, fiscal deficits, or political instability. Source: IMF.` } },
          { '@type': 'Question', name: `What is the global average inflation rate in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The global average inflation rate in ${year} is approximately ${avgInfl.toFixed(1)}%, with a median of ${Number(medianInfl).toFixed(1)}%. Advanced economies typically target 2% inflation. Source: IMF World Economic Outlook.` } },
          { '@type': 'Question', name: 'What causes high inflation?', acceptedAnswer: { '@type': 'Answer', text: 'High inflation is typically caused by excessive money supply growth, supply chain disruptions, currency depreciation, fiscal deficits financed by money printing, or demand outstripping supply. Central banks use interest rate policy as the primary tool to control inflation.' } },
          { '@type': 'Question', name: `How do 2026 US tariffs affect inflation by country?`, acceptedAnswer: { '@type': 'Answer', text: `The Trump administration's April 2026 tariff escalation is creating divergent inflation effects across countries. In the United States, import tariffs of 10–145% are feeding directly into consumer goods prices — economists estimate the tariff package adds 0.5–1.5 percentage points to US core PCE inflation, complicating the Federal Reserve's path to its 2% target and keeping the Fed in a "higher for longer" posture. For China, the tariffs are deflationary: blocked from its largest export market, Chinese manufacturers are absorbing costs and discounting aggressively in other markets, contributing to China's existing deflationary pressure. Export-dependent economies in Southeast Asia and Europe face currency depreciation (which raises import costs domestically) alongside softening export revenues — a stagflationary squeeze. India, which secured relative tariff exemptions through its February 2026 US trade deal, is largely insulated. Source: IMF World Economic Outlook April 2026.` } },
          { '@type': 'Question', name: 'Which countries have the lowest inflation in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'The countries with the lowest (or negative) inflation in 2026 include China, which is experiencing mild deflation (-0.1% to 0%) driven by weak domestic demand, overcapacity in manufacturing, and the deflationary effect of tariff-redirected exports flooding other markets. Japan (~2.5%) and Switzerland (~1.8%) maintain very low inflation rates anchored by credible central banks and strong currencies. Within the Gulf, the UAE and Saudi Arabia run near-2% inflation tied to their dollar pegs and energy subsidy systems. Panama and several Central American economies dollarized to the US dollar also maintain low inflation as a structural feature. Source: IMF World Economic Outlook April 2026.' } },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ranking/inflation-rate" className="hover:text-gray-600 transition">Inflation Rankings</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Inflation by Country</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Inflation Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">
          {inflData.length} countries ranked by consumer price inflation · Global average: {avgInfl.toFixed(1)}% · Source: IMF World Economic Outlook · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avgInfl.toFixed(1)}%</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest</div>
            <div className="text-[24px] font-bold text-red-600">{inflData[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Lowest</div>
            <div className="text-[24px] font-bold text-green-600">{inflData[inflData.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Inflation Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Inflation measures the annual rate of change in consumer prices. In {year}, the global average inflation rate is {avgInfl.toFixed(1)}%, down from the post-pandemic peaks of 2022-2023 when supply chain disruptions and energy price shocks pushed inflation to levels not seen in decades. Central banks worldwide responded with aggressive interest rate hikes — the US Federal Reserve, European Central Bank, and Bank of England all raised rates to multi-decade highs.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The variation across countries is enormous. Advanced economies with credible central banks typically maintain inflation near their 2% targets, while many emerging markets face double-digit inflation driven by currency depreciation, fiscal deficits, or structural supply constraints. At the extreme end, countries experiencing hyperinflation or currency crises can see prices double in months. The <Link href="/ranking/inflation-rate" className="text-[#0066cc] hover:underline">full inflation ranking</Link> shows every country from highest to lowest.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            Regionally, G7 economies have largely converged near their 2% targets following the aggressive tightening cycles of 2022–2024. The US Federal Reserve and European Central Bank both raised rates to multi-decade highs to break the post-pandemic inflation surge, and headline CPI in most advanced economies has since returned to or near target. Emerging markets present a more varied picture: countries with strong institutions and formal inflation-targeting frameworks — Chile, Brazil, Mexico, India — have broadly returned to single-digit rates, while those facing currency instability or fiscal pressure continue to run elevated inflation. Food inflation deserves particular attention in low-income countries, where food accounts for 40–60% of household spending; even moderate global food price shocks translate into acute cost-of-living crises. For analysts and investors, <Link href="/ranking/inflation-rate" className="text-[#0066cc] hover:underline">country-level CPI data</Link> serves as an early indicator of currency risk, central bank policy direction, and real purchasing power trends.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The 2026 US tariff escalation is creating one of the most unusual inflation environments in decades: inflationary in the United States, deflationary in China, and stagflationary for many export-dependent economies in between. US import tariffs of 10–145% are flowing through supply chains into consumer prices — import-intensive goods categories (electronics, apparel, household goods) are already showing accelerated price increases. The Federal Reserve faces a genuine dilemma: inflation is above target partly because of supply-side tariff costs that rate hikes cannot easily address without triggering unnecessary labor market damage. China, meanwhile, is exporting deflation: manufacturers blocked from the US market are discounting heavily into Europe, Southeast Asia, and emerging markets, keeping prices suppressed in those destinations even as their own currencies weaken. Turkey, Argentina, and Egypt continue to run double-digit inflation driven by structural fiscal and monetary factors unrelated to global trade. For a full picture of how inflation interacts with <Link href="/ranking/government-debt" className="text-[#0066cc] hover:underline">government debt</Link> and <Link href="/ranking/gdp-growth" className="text-[#0066cc] hover:underline">GDP growth</Link>, see the related indicators.
          </p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Inflation rate by country in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Inflation Rate</th>
                </tr>
              </thead>
              <tbody>
                {inflData.slice(0, 40).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`${getCleanCountryUrl(d.countryId)}/inflation-rate`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 5 ? 'text-red-600' : (d.value || 0) < 0 ? 'text-blue-600' : 'text-[#0d1b2a]'}>
                        {formatValue(d.value, 'percent', 1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/ranking/inflation-rate" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {inflData.length} countries →</Link>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/inflation-rate', label: 'Inflation Rankings' },
              { href: '/ranking/unemployment-rate', label: 'Unemployment' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth' },
              { href: '/ranking/government-debt', label: 'Government Debt' },
              { href: '/ranking/current-account', label: 'Current Account' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/countries', label: 'All Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
