import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Corruption by Country 2026 — Control of Corruption Index Ranked',
  description: 'Corruption by country: all countries ranked by the World Bank Control of Corruption index. From the least corrupt (Nordic countries) to the most corrupt. Source: World Bank Governance Indicators.',
  alternates: { canonical: 'https://statisticsoftheworld.com/corruption-by-country' },
  openGraph: {
    title: 'Corruption by Country 2026 — Global Rankings',
    description: 'All countries ranked by corruption control index. Source: World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function CorruptionByCountryPage() {
  const data = await getIndicatorForAllCountries('CC.EST');
  const year = data[0]?.year || '2024';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Corruption Index by Country ${year}`, description: `Control of Corruption index for ${data.length} countries. Higher scores indicate better governance. Source: World Bank Worldwide Governance Indicators.`, url: 'https://statisticsoftheworld.com/corruption-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which is the least corrupt country?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} scores highest on the Control of Corruption index. Nordic countries (Denmark, Finland, Sweden, Norway) consistently rank as the least corrupt due to transparent institutions, strong rule of law, free press, and high public sector salaries.` } },
      { '@type': 'Question', name: 'How is corruption measured?', acceptedAnswer: { '@type': 'Answer', text: 'The World Bank Control of Corruption index aggregates data from surveys of firms, citizens, and expert assessments. It captures perceptions of corruption, bribery, patronage, and the extent to which public power is exercised for private gain. Scores range from approximately -2.5 (most corrupt) to +2.5 (least corrupt).' } },
      { '@type': 'Question', name: 'Does corruption affect economic growth?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — research consistently shows corruption reduces GDP growth by 0.5-1% annually through misallocation of resources, reduced foreign investment, higher transaction costs, and brain drain. Countries that improved corruption control (Georgia, Rwanda, Estonia) saw corresponding economic gains.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/corruption-control" className="hover:text-gray-600 transition">Corruption Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Corruption by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Corruption by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Higher scores = less corruption · Source: World Bank Governance Indicators · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Corruption Landscape</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Corruption — the abuse of public power for private gain — is one of the most significant barriers to economic development. The World Bank&apos;s Control of Corruption index measures perceptions of corruption across countries using a composite of surveys, expert assessments, and institutional data. Scores range from approximately -2.5 (most corrupt) to +2.5 (least corrupt). Nordic countries consistently top the rankings: Denmark, Finland, Sweden, and Norway benefit from transparent institutions, strong <Link href="/ranking/rule-of-law" className="text-[#0066cc] hover:underline">rule of law</Link>, free press, and cultural norms that make corruption socially unacceptable.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Research consistently shows that corruption reduces <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">GDP growth</Link> by 0.5-1% annually through multiple channels: misallocation of resources (contracts go to the best-connected, not the most efficient), reduced foreign direct investment (investors avoid unpredictable environments), higher transaction costs for businesses, and brain drain as talented individuals emigrate to cleaner governance environments. The correlation between corruption and <Link href="/gdp-per-capita-by-country" className="text-[#0066cc] hover:underline">GDP per capita</Link> is striking — virtually no country has achieved high-income status while remaining highly corrupt.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Countries that have successfully improved corruption control offer valuable lessons. Georgia transformed from one of the most corrupt post-Soviet states to a governance success story through radical institutional reform. Rwanda, Estonia, and Chile have similarly demonstrated that sustained political will can improve corruption perceptions significantly. However, anti-corruption progress is fragile — political transitions can reverse decades of gains, as seen in several Latin American and Southeast Asian countries.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Control of Corruption index by country. Source: World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/corruption-control`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 1 ? 'text-green-600' : (d.value || 0) < -0.5 ? 'text-red-600' : 'text-amber-600'}>{d.value ? Number(d.value).toFixed(2) : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/corruption-control" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/corruption-control', label: 'Full Rankings' }, { href: '/ranking/rule-of-law', label: 'Rule of Law' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/homicide-rate-by-country', label: 'Homicide Rate' }, { href: '/ranking/fdi-inflows', label: 'FDI Inflows' }, { href: '/gdp-growth-by-country', label: 'GDP Growth' }, { href: '/world-economy', label: 'World Economy' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
