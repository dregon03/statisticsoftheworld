import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getIndicatorForAllCountries('IMF.PCPIPCH');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;
  const lowest = data[data.length - 1];
  return {
    title: `Inflation Rate by Country ${year} — ${data.length} Countries Ranked`,
    description: `Inflation by country ${year}: highest is ${data[0]?.country} (${formatValue(data[0]?.value, 'percent', 1)}), lowest is ${lowest?.country} (${formatValue(lowest?.value, 'percent', 1)}). Global avg: ${avg.toFixed(1)}%. ${data.length} countries. Source: IMF.`,
    alternates: { canonical: 'https://statisticsoftheworld.com/inflation-by-country' },
  };
}

export default async function InflationByCountryPage() {
  const inflData = await getIndicatorForAllCountries('IMF.PCPIPCH');
  const year = inflData[0]?.year || '2026';
  const avgInfl = inflData.length > 0 ? inflData.reduce((s, d) => s + (d.value || 0), 0) / inflData.length : 0;
  const medianInfl = inflData.length > 0 ? inflData[Math.floor(inflData.length / 2)]?.value || 0 : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
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
          { '@type': 'Question', name: `How have US tariffs affected global inflation in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The sweeping US tariffs introduced in April 2025 — including 145% rates on Chinese goods — have had asymmetric inflation effects. In the US, import prices rose sharply, keeping consumer inflation above the 2% target. In China, the collapse in export demand drove deflation as unsold inventory flooded domestic markets. Countries that negotiated early trade deals with the US, such as India (tariffs reduced to 18% in February 2026), saw more stable inflation outcomes. Structural inflators like Turkey and Argentina face separate pressures from currency depreciation and fiscal deficits. Source: IMF.` } },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Inflation Rankings', item: 'https://statisticsoftheworld.com/ranking/inflation-rate' },
          { '@type': 'ListItem', position: 3, name: 'Inflation by Country', item: 'https://statisticsoftheworld.com/inflation-by-country' },
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
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mt-2">{year} Inflation Drivers: Trade Wars and Diverging Central Banks</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The {year} inflation picture has been shaped by two conflicting forces: continued monetary tightening bringing advanced economy inflation back toward target, and trade-war-driven cost pressures threatening to reignite price growth. The sweeping US tariffs introduced in April 2025 — including 145% rates on Chinese goods and broad &quot;reciprocal&quot; tariffs on other trade partners — created supply chain disruptions that feed directly into consumer prices. In the US, import costs rose sharply, keeping inflation above the Federal Reserve&apos;s 2% target longer than expected. In China, the opposite dynamic is playing out: export demand collapsed, driving deflation as excess inventory flooded domestic markets. Countries that secured early trade deals with the US — notably India, which negotiated tariff cuts from 25% to 18% in February 2026 — have seen more stable inflation outcomes as their currencies held up better against the dollar. Meanwhile, structural inflators like Turkey, Argentina, and several sub-Saharan economies continue to face inflation above 20%, driven by currency depreciation and fiscal deficits rather than external trade shocks. See <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">GDP by country</Link> for the economic context behind these inflation differences.
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
