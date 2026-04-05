import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Internet Users by Country 2026 — Digital Penetration Ranked',
  description: 'Internet users by country: all countries ranked by percentage of population using the internet. From near-universal access to under 10%. Source: World Bank / ITU.',
  alternates: { canonical: 'https://statisticsoftheworld.com/internet-users-by-country' },
};

export default async function InternetUsersByCountryPage() {
  const data = await getIndicatorForAllCountries('IT.NET.USER.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Internet Users by Country ${year}`, description: `Internet penetration for ${data.length} countries. Global average: ${avg.toFixed(0)}%. Source: World Bank / ITU.`, url: 'https://statisticsoftheworld.com/internet-users-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest internet penetration?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest internet penetration at ${formatValue(data[0]?.value, 'percent', 0)}. Scandinavian countries, South Korea, Japan, and the US all have near-universal access above 95%.` } },
      { '@type': 'Question', name: 'How many people in the world use the internet?', acceptedAnswer: { '@type': 'Answer', text: 'Global internet penetration crossed 60% in the early 2020s and continues climbing. However, deep divides remain — in much of sub-Saharan Africa and South Asia, penetration is below 40%. Mobile broadband has leapfrogged fixed-line infrastructure in most developing countries.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Internet Users by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Internet Users by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Global average: {avg.toFixed(0)}% · Source: World Bank / ITU · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The Global Digital Divide</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Internet penetration measures the percentage of a country&apos;s population using the internet. Advanced economies have near-universal access: over 95% in Scandinavia, <Link href="/south-korea-economy" className="text-[#0066cc] hover:underline">South Korea</Link>, <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link>, and the <Link href="/us-economy" className="text-[#0066cc] hover:underline">United States</Link>. But in much of sub-Saharan Africa and South Asia, penetration remains below 40%. The digital divide has enormous economic consequences — countries with high internet penetration benefit from e-commerce, digital financial services, and remote work capability.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Mobile broadband has leapfrogged fixed-line infrastructure in most developing countries. M-Pesa in Kenya demonstrated how mobile technology can revolutionize financial access. The pandemic dramatically accelerated digital adoption even in lower-income countries. <Link href="/gdp-per-capita-by-country" className="text-[#0066cc] hover:underline">GDP per capita</Link> correlates strongly with internet access — there is no wealthy, low-connectivity country.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Internet users by country. Source: World Bank / ITU.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">% Using Internet</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/internet-users`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, 'percent', 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/internet-users" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/internet-users', label: 'Full Rankings' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/education-spending-by-country', label: 'Education' }, { href: '/population-by-country', label: 'Population' }, { href: '/south-korea-economy', label: 'South Korea Economy' }, { href: '/richest-countries', label: 'Richest Countries' }, { href: '/poorest-countries', label: 'Poorest Countries' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
