import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getIndicatorForAllCountries('IMF.LUR');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;
  const lowest = data[data.length - 1];
  return {
    title: `Unemployment Rate by Country ${year} — ${data.length} Countries Ranked`,
    description: `Unemployment by country ${year}: highest is ${data[0]?.country} (${formatValue(data[0]?.value, 'percent', 1)}), lowest is ${lowest?.country} (${formatValue(lowest?.value, 'percent', 1)}). Global avg: ${avg.toFixed(1)}%. ${data.length} countries ranked. Source: IMF.`,
    alternates: { canonical: 'https://statisticsoftheworld.com/unemployment-by-country' },
    openGraph: {
      title: `Unemployment Rate by Country ${year} — Complete Global Rankings`,
      description: `All ${data.length} countries ranked by unemployment rate. South Africa 32%+, US below 4%, global avg ${avg.toFixed(1)}%. Source: IMF World Economic Outlook.`,
      siteName: 'Statistics of the World',
      url: 'https://statisticsoftheworld.com/unemployment-by-country',
      type: 'website',
    },
  };
}

export default async function UnemploymentByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.LUR');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'Unemployment Rankings', item: 'https://statisticsoftheworld.com/ranking/unemployment-rate' },
        { '@type': 'ListItem', position: 3, name: `Unemployment by Country ${year}`, item: 'https://statisticsoftheworld.com/unemployment-by-country' },
      ],
    },
    { '@type': 'Dataset', name: `Unemployment Rate by Country ${year}`, description: `Unemployment rate for ${data.length} countries in ${year}. Global average: ${avg.toFixed(1)}%. Source: IMF.`, url: 'https://statisticsoftheworld.com/unemployment-by-country', creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `Which country has the highest unemployment in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest unemployment rate at ${formatValue(data[0]?.value, 'percent', 1)} in ${year}. South Africa's persistently high unemployment reflects structural issues including skills mismatches, inadequate infrastructure, and barriers to labor-market entry for young workers. Source: IMF.` } },
      { '@type': 'Question', name: `Which country has the lowest unemployment in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${data[data.length - 1]?.country} has the lowest unemployment rate at ${formatValue(data[data.length - 1]?.value, 'percent', 1)} in ${year}. Gulf economies and several East Asian countries consistently report unemployment below 2%, reflecting tight labor markets, large migrant worker flows, and in some cases limited recognition of informal joblessness in official statistics. Source: IMF.` } },
      { '@type': 'Question', name: 'How is unemployment rate measured?', acceptedAnswer: { '@type': 'Answer', text: 'The unemployment rate measures the percentage of the labor force that is actively seeking work but unable to find it. It excludes people who have stopped looking for work (discouraged workers) and those who are underemployed (working part-time involuntarily). The IMF harmonizes national labor force survey data to enable cross-country comparison.' } },
      { '@type': 'Question', name: `How do 2026 US tariffs affect unemployment by country?`, acceptedAnswer: { '@type': 'Answer', text: `The Trump administration's April 2026 tariff escalation is reshaping global labor markets in two opposing ways. Export-dependent economies — South Korea, Germany, Vietnam, Mexico — face reduced demand for their manufactured goods, putting upward pressure on unemployment as factories cut shifts or delay hiring. Conversely, countries that secured tariff exemptions or are capturing reshoring supply chains — India, parts of Southeast Asia, and Mexico under USMCA — are seeing increased manufacturing employment. In the United States, the tariff impact on unemployment has been modest so far: job gains in protected domestic industries (steel, aluminum, domestic electronics assembly) are partially offsetting losses in export-dependent sectors. The net effect depends heavily on how long the tariff regime lasts. Source: IMF World Economic Outlook April 2026.` } },
      { '@type': 'Question', name: 'Which developed economies have the lowest unemployment in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'Among major developed economies, Japan (2.5%), Germany (~3%), South Korea (~2.8%), and the United States (~3.8%) maintain some of the tightest labor markets in 2026. Japan and Germany face structural labor shortages driven by aging demographics and low birth rates — their challenge is finding enough workers, not too few jobs. The US labor market has stayed resilient despite tariff uncertainty, supported by strong services sector hiring. The UK (~4.2%) and France (~7.3%) have higher rates reflecting differences in labor market flexibility, welfare systems, and sectoral composition. Source: IMF.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/unemployment-rate" className="hover:text-gray-600 transition">Unemployment Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Unemployment by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Unemployment Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% · Source: IMF World Economic Outlook · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Unemployment Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Unemployment rates vary enormously across the world, from below 1% in some Gulf and East Asian economies to over 25% in parts of Southern Africa and the Middle East. The global average unemployment rate is approximately {avg.toFixed(1)}% in {year}, though this masks huge variation in how countries define and measure unemployment. Advanced economies generally have more comprehensive labor force surveys, while developing countries may have large informal sectors not captured in official statistics.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Low official unemployment doesn&apos;t necessarily mean a healthy labor market — it may reflect high underemployment, informal work, or discouraged workers who have stopped looking for jobs. Conversely, moderate unemployment in countries with strong safety nets may simply reflect workers taking longer to find suitable employment. <Link href="/ranking/youth-unemployment" className="text-[#0066cc] hover:underline">Youth unemployment</Link> (ages 15–24) is typically two to three times the overall rate and is a critical indicator of social stability, particularly in the Middle East and North Africa, where youth account for a disproportionately large share of the population.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The 2026 tariff landscape is introducing new pressures on global labor markets. The Trump administration&apos;s April 2026 tariff package — 145% on Chinese goods, 10–25% on most other imports — is accelerating supply chain relocation rather than simply reducing trade volumes. Manufacturers are shifting production from China toward Vietnam, India, Mexico, and Bangladesh, creating employment gains in those destinations while cutting factory shifts in China and export-dependent East Asian economies. In the United States, protected domestic industries (steel, aluminum, domestic EV assembly) have added jobs, but these gains are concentrated in specific regions and sectors, while import-dependent industries face cost pressures. The net effect on the US unemployment rate has been modest through mid-2026; the IMF projects the bigger labor market disruption will materialize in 2027 if tariff levels are sustained. For country-level <Link href="/ranking/gdp-growth" className="text-[#0066cc] hover:underline">GDP growth</Link> context that explains employment trends, see the full growth rankings.
          </p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Unemployment rate by country in {year}. Source: IMF.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Unemployment Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 40).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`${getCleanCountryUrl(d.countryId)}/unemployment-rate`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 10 ? 'text-red-600' : (d.value || 0) < 3 ? 'text-green-600' : ''}>{formatValue(d.value, 'percent', 1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/ranking/unemployment-rate" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link>
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/unemployment-rate', label: 'Unemployment Rankings' },
              { href: '/ranking/youth-unemployment', label: 'Youth Unemployment' },
              { href: '/inflation-by-country', label: 'Inflation by Country' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/countries', label: 'All Countries' },
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
