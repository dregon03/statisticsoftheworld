import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gini Index by Country 2026 — Income Inequality Rankings',
  description: 'Gini index by country: all countries ranked by income inequality. From the most equal (Nordic countries, ~25) to the most unequal (South Africa, ~63). Source: World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/gini-index-by-country' },
};

export default async function GiniIndexByCountryPage() {
  const data = await getIndicatorForAllCountries('SI.POV.GINI');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Gini Index by Country ${year}`, description: `Income inequality (Gini coefficient) for ${data.length} countries. Source: World Bank.`, url: 'https://statisticsoftheworld.com/gini-index-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest income inequality?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest Gini coefficient at ${data[0]?.value ? Number(data[0].value).toFixed(1) : '—'}, reflecting extreme income concentration. South Africa, Namibia, and several Latin American countries consistently rank among the most unequal.` } },
      { '@type': 'Question', name: 'What does the Gini index measure?', acceptedAnswer: { '@type': 'Answer', text: 'The Gini index measures income inequality on a scale from 0 (perfect equality) to 100 (perfect inequality). A Gini of 25-30 is typical of egalitarian Nordic societies; 35-40 is common in the US and China; 50+ indicates extreme inequality.' } },
      { '@type': 'Question', name: 'Which country has the lowest inequality?', acceptedAnswer: { '@type': 'Answer', text: `${data[data.length - 1]?.country} has the lowest Gini at ${data[data.length - 1]?.value ? Number(data[data.length - 1].value).toFixed(1) : '—'}. Czech Republic, Slovakia, Slovenia, and Nordic countries typically rank as the most equal due to progressive taxation and strong safety nets.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Gini Index by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Gini Index by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · 0 = perfect equality, 100 = perfect inequality · Source: World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Income Inequality</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The Gini index is the most widely used single-number measure of income distribution. South Africa consistently records one of the world&apos;s highest coefficients — around 63 — reflecting the lasting economic legacy of apartheid. <Link href="/brazil-economy" className="text-[#0066cc] hover:underline">Brazil</Link>, Colombia, and Central American countries also show values above 50. In contrast, the lowest Gini values (below 30) are found in Czech Republic, Slovakia, Slovenia, and Nordic countries, where progressive taxation and strong social safety nets compress the distribution.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Income inequality matters for economic growth, social stability, and health outcomes. High inequality reduces social mobility, concentrates political power, and is associated with lower <Link href="/life-expectancy-by-country" className="text-[#0066cc] hover:underline">life expectancy</Link>, higher crime, and worse educational outcomes. The Gini index captures income but not wealth inequality, which is typically much more extreme. Global wealth inequality is far higher than income inequality.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Gini index by country. Source: World Bank.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">Gini Index</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/gini-index`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 45 ? 'text-red-600' : (d.value || 0) < 30 ? 'text-green-600' : 'text-amber-600'}>{d.value ? Number(d.value).toFixed(1) : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/gini-index" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/gini-index', label: 'Gini Rankings' }, { href: '/poverty-rate-by-country', label: 'Poverty Rate' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/richest-countries', label: 'Richest Countries' }, { href: '/poorest-countries', label: 'Poorest Countries' }, { href: '/homicide-rate-by-country', label: 'Homicide Rate' }, { href: '/corruption-by-country', label: 'Corruption' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
