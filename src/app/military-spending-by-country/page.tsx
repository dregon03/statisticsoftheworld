import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Military Spending by Country 2026 — Defense Budgets Ranked | Statistics of the World',
  description: 'Military spending by country 2026: global total hit a record $2.7 trillion. US leads at $900B+, Poland tops NATO at 4.1% of GDP, Ukraine spends 35%+ of GDP. All countries ranked. Source: SIPRI / World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/military-spending-by-country' },
  openGraph: {
    title: 'Military Spending by Country 2026 — Defense Budgets Ranked',
    description: 'Global military spending reached a record $2.7 trillion in 2026. US leads in absolute terms; Ukraine tops 35% of GDP. All countries ranked by defense expenditure. Source: SIPRI.',
    siteName: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com/military-spending-by-country',
    type: 'website',
  },
};

export default async function MilitarySpendingByCountryPage() {
  const data = await getIndicatorForAllCountries('MS.MIL.XPND.GD.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'Military Rankings', item: 'https://statisticsoftheworld.com/ranking/military-spending' },
        { '@type': 'ListItem', position: 3, name: 'Military Spending by Country', item: 'https://statisticsoftheworld.com/military-spending-by-country' },
      ],
    },
    { '@type': 'Dataset', name: `Military Spending by Country ${year}`, description: `Military expenditure as % of GDP for ${data.length} countries. Global average: ${avg.toFixed(1)}%. Source: SIPRI / World Bank.`, url: 'https://statisticsoftheworld.com/military-spending-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country spends the most on military as % of GDP?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} allocates the highest share of GDP to defense at ${formatValue(data[0]?.value, 'percent', 1)}. Countries in conflict zones or facing security threats consistently spend the most relative to their economy. Ukraine, if counted separately, spends an extraordinary 35%+ of GDP on defense in 2026.` } },
      { '@type': 'Question', name: 'How much does the US spend on military?', acceptedAnswer: { '@type': 'Answer', text: 'The United States spends approximately 3.5% of GDP on defense — over $900 billion annually, more than the next 10 countries combined in absolute terms. The US accounts for roughly 40% of global military spending. By comparison, China spends an estimated $300 billion (official figures likely understate actual expenditure), and Russia spends 6–8% of GDP following its full-scale invasion of Ukraine. Source: SIPRI.' } },
      { '@type': 'Question', name: 'What is the NATO 2% spending target?', acceptedAnswer: { '@type': 'Answer', text: "NATO members have committed to spending at least 2% of GDP on defense. Most European members failed to meet this target for decades but are now rapidly approaching or exceeding it following Russia's 2022 invasion of Ukraine. As of 2026, Poland leads NATO at 4.1% of GDP, Germany crossed 2% for the first time, and all Baltic states exceed the threshold. The UK, France, and Greece also meet the target. Source: NATO." } },
      { '@type': 'Question', name: 'Which countries spend the most on defense in absolute dollar terms in 2026?', acceptedAnswer: { '@type': 'Answer', text: "The top 10 defense spenders in absolute terms in 2026 are: (1) United States $900B+, (2) China ~$300B (estimated), (3) Russia ~$130B+ (surging), (4) India ~$80B, (5) Saudi Arabia ~$75B, (6) United Kingdom ~$70B, (7) Germany ~$65B, (8) France ~$60B, (9) Japan ~$55B, (10) South Korea ~$50B. Together these 10 nations account for approximately 75% of global military spending. Source: SIPRI Annual Report." } },
      { '@type': 'Question', name: 'How has the Russia-Ukraine war affected global defense spending?', acceptedAnswer: { '@type': 'Answer', text: "Russia's 2022 invasion of Ukraine triggered the largest peacetime military buildup in Europe since the Cold War. All European NATO members have raised or committed to raise spending to 2% of GDP. Germany passed a €100B special defense fund — reversing decades of restraint. Poland reached 4.1% of GDP — the highest in NATO. Finland and Sweden, newly admitted to NATO, rapidly increased defense budgets. Ukraine itself allocates over 35% of GDP to defense, funded partly by $100B+ in Western military assistance. SIPRI data shows 2022–2026 as the steepest multi-year NATO spending surge since the alliance's founding. Global military spending hit a record $2.7 trillion in 2024. Source: SIPRI." } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/military-spending" className="hover:text-gray-600 transition">Military Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Military Spending by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Military Spending by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% of GDP · Source: SIPRI / World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avg.toFixed(1)}%</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest (% GDP)</div>
            <div className="text-[24px] font-bold text-red-600">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Lowest (% GDP)</div>
            <div className="text-[24px] font-bold text-green-600">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Military Expenditure</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Global military spending exceeded $2.4 trillion in 2024, with the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link> accounting for roughly 40% of the total. The US spends approximately 3.5% of GDP on defense — over $900 billion annually, more than the next 10 countries combined in absolute terms. China is the second-largest spender at an estimated $300 billion, though exact figures are difficult to verify due to opaque defense budgets. Russia, despite its smaller economy, allocates an estimated 6-8% of GDP to military following its invasion of Ukraine.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Military spending trends are a barometer of geopolitical tensions. NATO members committed to spending at least 2% of GDP on defense — a target most European members missed for decades but are now rapidly approaching after Russia&apos;s 2022 invasion of Ukraine triggered a fundamental reassessment of European security. <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link> announced a &euro;100 billion special defense fund, and Nordic countries accelerated their defense buildups. Middle Eastern countries like Saudi Arabia, Israel, and the UAE consistently spend 4-6% of GDP due to regional security threats.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]"><Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> maintained spending below 1% of GDP for decades under its post-WWII pacifist constitution but has recently increased toward 2% in response to China&apos;s military buildup and North Korean missile threats. For developing countries, excessive military spending creates a &quot;guns versus butter&quot; trade-off — resources devoted to defense cannot be invested in <Link href="/ranking/health-spending" className="text-[#0066cc] hover:underline">healthcare</Link>, <Link href="/ranking/education-spending" className="text-[#0066cc] hover:underline">education</Link>, or infrastructure that drives long-term economic growth.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">In 2026, global military spending reached a record $2.7 trillion — the highest in modern history and the ninth consecutive year of real-terms growth, according to SIPRI. Europe is driving the surge: Germany crossed the NATO 2% threshold for the first time since reunification, Poland is spending 4.1% of GDP (the highest in the alliance), and Finland, Sweden, Estonia, and Latvia have dramatically expanded budgets following Russia&apos;s full-scale invasion of Ukraine. Ukraine itself allocates over 35% of GDP to defense — the highest share in the world — funded partly by more than $100 billion in Western military assistance. Russia&apos;s defense budget has surged to an estimated 6–8% of GDP, crowding out civilian investment and contributing to domestic inflation above 8%. The Asia-Pacific is also rearming: Japan targets 2% of GDP by 2027 (up from a decades-long 1% cap), Australia is expanding submarine and missile capacity, and South Korea is accelerating domestic weapons production. The geopolitical signal is unambiguous: the post-Cold War &quot;peace dividend&quot; is fully spent. See our analysis: <Link href="/blog/global-defense-spending-2026-record" className="text-[#0066cc] hover:underline">Global Defense Spending Hits Record $2.7 Trillion</Link>.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Military spending as % of GDP by country. Source: SIPRI / World Bank.</caption>
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
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/military-spending`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/military-spending" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/military-spending', label: 'Military Rankings' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/debt-by-country', label: 'Debt by Country' },
              { href: '/ranking/government-debt', label: 'Government Debt' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/russia-economy', label: 'Russia Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/germany-economy', label: 'Germany Economy' },
              { href: '/ukraine-economy', label: 'Ukraine Economy' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/blog/global-defense-spending-2026-record', label: 'Defense Spending Analysis' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
