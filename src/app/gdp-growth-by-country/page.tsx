import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getIndicatorForAllCountries('IMF.NGDP_RPCH');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;
  const slowest = data[data.length - 1];
  return {
    title: `GDP Growth Rate by Country ${year} — Fastest & Slowest Economies Ranked`,
    description: `Real GDP growth for ${data.length} countries in ${year}. Fastest: ${data[0]?.country} (${formatValue(data[0]?.value, 'percent', 1)}). Slowest: ${slowest?.country} (${formatValue(slowest?.value, 'percent', 1)}). World avg: ${avg.toFixed(1)}%. Source: IMF.`,
    alternates: { canonical: 'https://statisticsoftheworld.com/gdp-growth-by-country' },
    openGraph: {
      title: `GDP Growth Rate by Country ${year} — Fastest & Slowest Economies`,
      description: `${data.length} countries ranked by real GDP growth. Global avg ${avg.toFixed(1)}%. Fastest: ${data[0]?.country}. Source: IMF.`,
      url: 'https://statisticsoftheworld.com/gdp-growth-by-country',
      siteName: 'Statistics of the World',
      type: 'website',
    },
  };
}

export default async function GdpGrowthByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.NGDP_RPCH');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'WebPage',
      name: `GDP Growth Rate by Country ${year} — Fastest & Slowest Economies Ranked`,
      url: 'https://statisticsoftheworld.com/gdp-growth-by-country',
      description: `Real GDP growth rates for ${data.length} countries in ${year}. Fastest: ${data[0]?.country} (${formatValue(data[0]?.value, 'percent', 1)}). Source: IMF.`,
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'GDP Growth Rankings', item: 'https://statisticsoftheworld.com/ranking/gdp-growth' },
        { '@type': 'ListItem', position: 3, name: `GDP Growth by Country ${year}`, item: 'https://statisticsoftheworld.com/gdp-growth-by-country' },
      ],
    },
    { '@type': 'Dataset', name: `GDP Growth Rate by Country ${year}`, description: `Real GDP growth rate for ${data.length} countries in ${year}. Global average: ${avg.toFixed(1)}%. Source: IMF World Economic Outlook.`, url: 'https://statisticsoftheworld.com/gdp-growth-by-country', creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `Which country has the fastest GDP growth in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest real GDP growth rate at ${formatValue(data[0]?.value, 'percent', 1)} in ${year}. Guyana's growth is driven by a massive offshore oil boom — oil production began in 2019 and has transformed one of South America's smallest economies into one of the world's fastest-growing. Source: IMF.` } },
      { '@type': 'Question', name: `What is the global average GDP growth rate in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The global average GDP growth rate is approximately ${avg.toFixed(1)}% in ${year}. Advanced economies typically grow at 1–3%, while emerging markets grow at 4–7%. The IMF projects global growth slightly below the 3.2% recorded in 2025, with US tariffs introduced in April 2026 adding downside risk. Source: IMF World Economic Outlook.` } },
      { '@type': 'Question', name: `How are US tariffs affecting GDP growth rates in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The Trump administration's April 2026 tariff package — with rates of 10–145% depending on country — is expected to reduce US growth by 0.3–0.5 percentage points while trimming growth in export-dependent economies like Germany (-0.2%), South Korea (-0.3%), and Vietnam (-0.8%). China's growth is projected to fall from 5% to 4.2% as US-China tariffs reached 145%. Economies that secured exemptions or trade deals (India, UK) are partially insulated. Source: IMF, Goldman Sachs.` } },
      { '@type': 'Question', name: `Which emerging markets have the fastest GDP growth in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `After Guyana, the fastest-growing emerging markets in ${year} include India (6.1%), the Philippines (5.7%), Vietnam (5.6%), Ethiopia (~6%), and Tanzania (~5.5%). India's growth is underpinned by domestic consumption, infrastructure spending, and the February 2026 US-India trade deal that reduced US tariffs on Indian goods from 26% to 18%. Sub-Saharan Africa's frontier markets continue to lead on percentage growth but from a low base. Source: IMF.` } },
      { '@type': 'Question', name: `What are the top 10 fastest-growing economies in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `The 10 fastest-growing economies by real GDP growth in ${year} per the IMF are: 1. Guyana (~23%, oil boom); 2. Suriname (~7%); 3. Ethiopia (~6.5%); 4. India (6.5%, fastest major economy); 5. Philippines (5.7%); 6. Vietnam (5.6%); 7. Cambodia (~5.5%); 8. Bangladesh (~5.5%); 9. Rwanda (~5.5%); 10. Indonesia (5%). Among the world's 20 largest economies, India leads by a wide margin, followed by Indonesia and China (4.2%). Advanced economies — Germany (0.9%), Japan (0.8%), UK (1.1%), and the US (2.1%) — grow far more slowly. Source: IMF World Economic Outlook April 2026.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/gdp-growth" className="hover:text-gray-600 transition">GDP Growth Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">GDP Growth by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">GDP Growth Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Growth Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Real GDP growth measures the annual change in economic output after adjusting for inflation. In {year}, the global average is approximately {avg.toFixed(1)}%, but the variation is enormous. The fastest-growing economies are typically small commodity exporters experiencing booms, post-conflict recoveries, or rapidly industrializing emerging markets. Advanced economies like the US, EU, and Japan typically grow at 1–3%, reflecting mature economies with high productivity levels.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Sustained growth above 5% for decades is historically rare and transformative. China maintained roughly 10% annual growth from 1980 to 2010, and India is currently on a similar trajectory at 6–7%. The fastest-growing economies in any given year often include countries like Guyana (oil discovery), Libya (post-war recovery), or small economies experiencing one-time booms. For meaningful comparison, focus on the growth rates of the world&apos;s <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">top 20 economies by GDP</Link>.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The defining growth story of {year} is the divergence between tariff-insulated and tariff-exposed economies. The Trump administration&apos;s April 2026 tariff package — &quot;Liberation Day&quot; — imposed rates of 10% on most trading partners and 145% on China, creating sharp winners and losers. <Link href="/india-economy" className="text-[#0066cc] hover:underline">India</Link> (6.1%) benefits from partial tariff relief under its February 2026 trade deal and manufacturing diversion from China. <Link href="/vietnam-economy" className="text-[#0066cc] hover:underline">Vietnam</Link> and the Philippines face headwinds as export-dependent electronics suppliers. Guyana (23%+) is insulated by oil — its growth rate is driven entirely by offshore Stabroek block production and is effectively immune to trade policy. In <Link href="/europe-economy" className="text-[#0066cc] hover:underline">Europe</Link>, Germany and France are growing below 1% as export demand softens and energy costs remain elevated.</p>
        </div>
        <div className="max-w-[800px] mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-4">Top 10 Fastest-Growing Economies ({year})</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8] mb-4">The following economies have the highest real GDP growth rates in {year} per the IMF April 2026 World Economic Outlook. Small commodity exporters and rapidly industrializing emerging markets dominate the top spots, while advanced economies grow far more slowly.</p>
          <ol className="space-y-2 mb-6">
            {data.slice(0, 10).map((d, i) => (
              <li key={d.countryId} className="flex gap-3 items-start text-[14px] text-[#374151]">
                <span className="font-bold text-[#0d1b2a] w-6 shrink-0">{i + 1}.</span>
                <span>
                  <Link href={`${getCleanCountryUrl(d.countryId)}/gdp-growth`} className="text-[#0066cc] hover:underline font-semibold">{d.country}</Link>
                  {' — '}
                  <span className="text-green-600 font-mono font-semibold">{formatValue(d.value, 'percent', 1)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">GDP growth rate by country in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 40).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/gdp-growth`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 0 ? 'text-green-600' : 'text-red-500'}>{formatValue(d.value, 'percent', 1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/gdp-growth" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/gdp-growth', label: 'Growth Rankings' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/inflation-by-country', label: 'Inflation by Country' }, { href: '/debt-by-country', label: 'Government Debt' }, { href: '/india-economy', label: 'India Economy' }, { href: '/china-economy', label: 'China Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
