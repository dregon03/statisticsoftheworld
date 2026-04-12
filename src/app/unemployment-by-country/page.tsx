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
  };
}

export default async function UnemploymentByCountryPage() {
  const data = await getIndicatorForAllCountries('IMF.LUR');
  const year = data[0]?.year || '2026';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Unemployment Rate by Country ${year}`, description: `Unemployment rate for ${data.length} countries in ${year}. Global average: ${avg.toFixed(1)}%. Source: IMF.`, url: 'https://statisticsoftheworld.com/unemployment-by-country', creator: { '@type': 'Organization', name: 'IMF', url: 'https://www.imf.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `Which country has the highest unemployment in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest unemployment rate at ${formatValue(data[0]?.value, 'percent', 1)} in ${year}. Source: IMF.` } },
      { '@type': 'Question', name: `Which country has the lowest unemployment in ${year}?`, acceptedAnswer: { '@type': 'Answer', text: `${data[data.length - 1]?.country} has the lowest unemployment rate at ${formatValue(data[data.length - 1]?.value, 'percent', 1)} in ${year}. Source: IMF.` } },
      { '@type': 'Question', name: 'How is unemployment rate measured?', acceptedAnswer: { '@type': 'Answer', text: 'The unemployment rate measures the percentage of the labor force that is actively seeking work but unable to find it. It excludes people who have stopped looking for work (discouraged workers) and those who are underemployed (working part-time involuntarily).' } },
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
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(1)}% · Source: IMF · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Unemployment Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Unemployment rates vary enormously across the world, from below 1% in some Gulf and East Asian economies to over 25% in parts of Southern Africa and the Middle East. The global average unemployment rate is approximately {avg.toFixed(1)}% in {year}, though this masks huge variation in how countries define and measure unemployment. Advanced economies generally have more comprehensive labor force surveys, while developing countries may have large informal sectors not captured in official statistics.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Low official unemployment doesn&apos;t necessarily mean a healthy labor market — it may reflect high underemployment, informal work, or discouraged workers who have stopped looking for jobs. Conversely, moderate unemployment in countries with strong safety nets may simply reflect workers taking longer to find suitable employment. Youth unemployment (ages 15-24) is typically two to three times the overall rate and is a critical indicator of social stability, particularly in the Middle East and North Africa.</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/ranking/unemployment-rate', label: 'Unemployment Rankings' },
              { href: '/ranking/youth-unemployment', label: 'Youth Unemployment' },
              { href: '/inflation-by-country', label: 'Inflation by Country' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth' },
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
