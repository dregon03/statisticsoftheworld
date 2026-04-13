import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Trade Openness by Country 2026 — Most & Least Trade-Dependent Economies',
  description: 'Trade openness (imports + exports as % of GDP) for all countries in 2026. Singapore leads at 300%+. See how US tariffs are reshaping global trade integration. Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/trade-by-country' },
  openGraph: {
    title: 'Trade Openness by Country 2026 — Most & Least Trade-Dependent Economies',
    description: 'All countries ranked by trade as % of GDP. See which economies are most exposed to the 2026 US tariff regime. Source: World Bank.',
    url: 'https://statisticsoftheworld.com/trade-by-country',
    siteName: 'Statistics of the World',
    type: 'website',
  },
};

export default async function TradeByCountryPage() {
  const data = await getIndicatorForAllCountries('NE.TRD.GNFS.ZS');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'Trade Rankings', item: 'https://statisticsoftheworld.com/ranking/trade-openness' },
        { '@type': 'ListItem', position: 3, name: `Trade by Country ${year}`, item: 'https://statisticsoftheworld.com/trade-by-country' },
      ],
    },
    { '@type': 'Dataset', name: `Trade Openness by Country ${year}`, description: `Trade (% of GDP) for ${data.length} countries. Global average: ${avg.toFixed(0)}%. Source: World Bank.`, url: 'https://statisticsoftheworld.com/trade-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country is the most trade-open in 2026?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest trade openness at approximately ${formatValue(data[0]?.value, 'percent', 0)} of GDP. Small entrepôt economies like Singapore, Luxembourg, and Hong Kong have trade exceeding 300% of GDP because re-exports and entrepôt activity inflate the ratio far beyond their domestic output. Their physical location, port infrastructure, and rule of law make them indispensable trade hubs. Source: World Bank.` } },
      { '@type': 'Question', name: 'What does trade openness measure?', acceptedAnswer: { '@type': 'Answer', text: 'Trade openness is total trade (exports + imports of goods and services) as a percentage of GDP. Higher values indicate greater integration with the global economy. The US has approximately 25% (low for its income level due to a large domestic market), while Singapore exceeds 300%. A country can have very high trade openness but still be domestically self-sufficient if re-export activity inflates the numerator.' } },
      { '@type': 'Question', name: 'Which countries are most exposed to the 2026 US tariff regime?', acceptedAnswer: { '@type': 'Answer', text: 'Countries most exposed to US tariffs are those with (1) high trade-to-GDP ratios, (2) significant export share to the US, and (3) limited ability to redirect exports. Vietnam (trade openness ~185% of GDP, US the top destination for electronics exports) faces severe exposure. South Korea (electronics, autos), Taiwan (semiconductors), and Mexico (manufacturing supply chains) are also heavily affected. China, facing 145% tariffs, is aggressively redirecting exports to Southeast Asia, Africa, and Europe. Source: IMF, WTO.' } },
      { '@type': 'Question', name: 'How is "friend-shoring" changing trade patterns in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Friend-shoring — routing supply chains through geopolitically aligned countries to avoid tariffs — is accelerating in 2026. Mexico and Canada benefit from USMCA exemptions. India is gaining electronics and pharmaceutical manufacturing. Vietnam, despite its own US tariff exposure, is absorbing some Chinese production moving offshore. The net effect is a fragmentation of the global trade system into blocs, with trade costs rising for every country that must now maintain parallel supply chains.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/trade-openness" className="hover:text-gray-600 transition">Trade Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Trade by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Trade Openness by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(0)}% of GDP · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Trade Integration</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Trade openness measures how integrated a country is with the global economy. Small, open economies like Singapore (trade exceeding 300% of GDP), Luxembourg, and Hong Kong are extremely trade-dependent — their domestic markets are too small to sustain the variety of production their economies support. Large economies like the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> (about 25% of GDP), <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> (about 37%), and <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> (about 35%) appear less open in percentage terms, but their absolute trade volumes are the largest in the world.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The relationship between trade openness and growth is well-established: countries that liberalized trade while investing in education, infrastructure, and institutional quality — East Asia, Eastern Europe — benefited enormously. The correlation between openness and income is strong at the country level, though causality runs in both directions. Wealthier countries attract more trade, and more trade generates more wealth through specialization and economies of scale.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The defining shift in global trade in {year} is the reshaping of patterns under the Trump administration&apos;s April 2026 tariff regime — widely called &quot;Liberation Day.&quot; Tariffs of 10% on most countries and 145% on <Link href="/china-economy" className="text-[#0066cc] hover:underline">China</Link> are accelerating the &quot;friend-shoring&quot; trend: manufacturers are routing supply chains through tariff-exempt allies, particularly under USMCA. Mexico and Canada, shielded by the trade agreement, have seen increased US-bound manufacturing investment. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link>, partially insulated by its February 2026 bilateral trade deal, is absorbing pharmaceutical and electronics production. The WTO projects global merchandise trade volume growth to slow from 3% to below 2% in 2026 as a direct result. Countries with trade openness above 100% of GDP — Vietnam, Singapore, Netherlands — face the sharpest adjustment as global value chains fragment.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Trade openness by country. Source: World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">Trade (% GDP)</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/trade-openness`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/trade-openness" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/trade-openness', label: 'Trade Rankings' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/gdp-growth-by-country', label: 'GDP Growth' }, { href: '/ranking/fdi-inflows', label: 'FDI Inflows' }, { href: '/ranking/current-account', label: 'Current Account' }, { href: '/inflation-by-country', label: 'Inflation by Country' }, { href: '/china-economy', label: 'China Economy' }, { href: '/us-economy', label: 'US Economy' }, { href: '/india-economy', label: 'India Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
