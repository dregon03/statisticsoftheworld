import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Safest Countries in the World 2026 — Lowest Homicide Rates',
  description: 'The safest countries in the world ranked by lowest homicide rate per 100,000 people. From Japan and Iceland to the most peaceful nations on Earth. Source: UNODC / World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/safest-countries' },
  openGraph: {
    title: 'Safest Countries in the World 2026',
    description: 'Countries with the lowest homicide rates. Source: UNODC / World Bank.',
    siteName: 'Statistics of the World',
  },
};

export default async function SafestCountriesPage() {
  const rawData = await getIndicatorForAllCountries('VC.IHR.PSRC.P5');
  const data = [...rawData].reverse();
  const year = rawData[0]?.year || '2024';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Safest Countries ${year}`, description: `Countries ranked by lowest homicide rate. Source: UNODC / World Bank.`, url: 'https://statisticsoftheworld.com/safest-countries', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is the safest country in the world?', acceptedAnswer: { '@type': 'Answer', text: `By homicide rate, ${data[0]?.country} is among the safest countries with a rate of ${data[0]?.value ? Number(data[0].value).toFixed(2) : '—'} per 100,000. Japan, Singapore, Iceland, and several East Asian and Nordic countries have rates below 0.5, making violent death statistically rare.` } },
      { '@type': 'Question', name: 'What makes a country safe?', acceptedAnswer: { '@type': 'Answer', text: 'The safest countries share common traits: strong rule of law, effective policing, low inequality, strict gun control, high social cohesion, functional judicial systems, and economic stability. Cultural factors also play a role — societies with high trust and social capital tend to have lower crime.' } },
      { '@type': 'Question', name: 'Is Europe safer than the Americas?', acceptedAnswer: { '@type': 'Answer', text: 'On average, yes. Western Europe has homicide rates below 1 per 100,000, while Latin America averages around 17. The Americas account for about 35% of global homicides despite having only 13% of the population, driven by drug trafficking and gun availability.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/homicide-rate-by-country" className="hover:text-gray-600 transition">Homicide Rate</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Safest Countries</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Safest Countries in the World ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Ranked by lowest homicide rate per 100,000 · Source: UNODC / World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The World&apos;s Most Peaceful Nations</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The safest countries in the world — measured by intentional homicide rate — are concentrated in East Asia, Western Europe, and Oceania. <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> stands out with a homicide rate of approximately 0.2 per 100,000, reflecting deep social cohesion, strict gun control, extremely low firearm ownership, and an effective police force that maintains a solve rate above 95%. Singapore, Iceland, and several Nordic countries achieve similarly low rates.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The common characteristics of safe countries include strong <Link href="/corruption-by-country" className="text-[#0066cc] hover:underline">governance and low corruption</Link>, effective judicial systems, low income <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">inequality</Link>, high social trust, restricted firearm access, and economic stability. Countries with high GDP per capita, strong education systems, and comprehensive social safety nets consistently rank among the safest. The correlation between economic development and safety is strong, though not absolute — some middle-income countries with strong social fabric outperform wealthier but more unequal nations.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Safety is multidimensional — homicide rates capture the most extreme form of violence but don&apos;t reflect property crime, cybercrime, or the subjective feeling of safety. The Global Peace Index, which incorporates military spending, political instability, and other factors, provides a broader view. For a complete picture of country risk, consider homicide alongside <Link href="/homicide-rate-by-country" className="text-[#0066cc] hover:underline">full crime data</Link>, political stability, and rule of law indicators.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Safest countries by homicide rate in {year}. Source: UNODC / World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Homicide Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/homicide-rate`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px] text-green-600">{d.value ? Number(d.value).toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/homicide-rate-by-country" className="text-[14px] text-[#0066cc] hover:underline font-medium">View full homicide rankings →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/homicide-rate-by-country', label: 'Homicide Rates' }, { href: '/corruption-by-country', label: 'Corruption Index' }, { href: '/ranking/rule-of-law', label: 'Rule of Law' }, { href: '/richest-countries', label: 'Richest Countries' }, { href: '/life-expectancy-by-country', label: 'Life Expectancy' }, { href: '/ranking/gini-index', label: 'Inequality' }, { href: '/japan-economy', label: 'Japan Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
