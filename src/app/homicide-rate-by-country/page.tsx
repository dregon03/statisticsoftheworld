import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Homicide Rate by Country 2026 — Murder Rates Ranked',
  description: 'Homicide rate by country: all countries ranked by intentional homicides per 100,000 people. From the safest countries to the most dangerous. Source: UNODC / World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/homicide-rate-by-country' },
  openGraph: {
    title: 'Homicide Rate by Country 2026 — Global Safety Rankings',
    description: 'All countries ranked by intentional homicide rate per 100,000 people. Source: UNODC.',
    siteName: 'Statistics of the World',
  },
};

export default async function HomicideRateByCountryPage() {
  const data = await getIndicatorForAllCountries('VC.IHR.PSRC.P5');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Homicide Rate by Country ${year}`, description: `Intentional homicide rate per 100,000 for ${data.length} countries. Global average: ${avg.toFixed(1)}. Source: UNODC / World Bank.`, url: 'https://statisticsoftheworld.com/homicide-rate-by-country', creator: { '@type': 'Organization', name: 'World Bank', url: 'https://www.worldbank.org' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest homicide rate?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest intentional homicide rate at ${data[0]?.value ? Number(data[0].value).toFixed(1) : '—'} per 100,000 people. Latin America and the Caribbean account for roughly 35% of global homicides despite having only 8% of the world's population.` } },
      { '@type': 'Question', name: 'Which countries are the safest?', acceptedAnswer: { '@type': 'Answer', text: 'Japan, Singapore, Iceland, and several East Asian and Nordic countries have homicide rates below 0.5 per 100,000 — making violent death statistically rare. Japan\'s rate of approximately 0.2 reflects deep social cohesion, strict gun control, and effective policing.' } },
      { '@type': 'Question', name: 'What causes high homicide rates?', acceptedAnswer: { '@type': 'Answer', text: 'High homicide rates correlate with drug trafficking, gang violence, income inequality, weak judicial institutions, widespread firearm availability, and political instability. The most dangerous countries typically have some combination of these structural factors.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/ranking/homicide-rate" className="hover:text-gray-600 transition">Homicide Rankings</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Homicide Rate by Country</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Homicide Rate by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Per 100,000 people · Global average: {avg.toFixed(1)} · Source: UNODC / World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Global Average</div>
            <div className="text-[24px] font-bold text-[#0d1b2a]">{avg.toFixed(1)}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest Rate</div>
            <div className="text-[24px] font-bold text-red-600">{data[0]?.country}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Safest</div>
            <div className="text-[24px] font-bold text-green-600">{data[data.length - 1]?.country}</div>
          </div>
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Global Homicide Rates</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The intentional homicide rate measures unlawful deaths purposefully inflicted by another person per 100,000 population. It is the most internationally comparable crime statistic because, unlike other crimes, homicide has a relatively consistent legal definition across countries and is difficult to conceal. Latin America and the Caribbean account for roughly 35% of global homicides despite having only 8% of the world&apos;s population, driven by drug trafficking routes, gang violence, high inequality, weak judicial institutions, and widespread firearm availability.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">El Salvador, Honduras, Jamaica, and Venezuela have historically reported some of the world&apos;s highest rates, though several have seen significant declines through aggressive security policies. El Salvador&apos;s controversial state of emergency reduced homicides dramatically but raised human rights concerns. In contrast, East Asia, Western Europe, and Oceania have some of the lowest rates globally — typically below 1 per 100,000. <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan&apos;s</Link> rate is approximately 0.2, reflecting deep social cohesion, strict gun control, and effective policing.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">When analyzing homicide data, some countries may underreport due to weak statistical systems, conflict-related deaths classified separately, or political incentives to minimize crime figures. The data also doesn&apos;t capture attempted murders or broader violent crime. For a fuller picture of country safety, consider homicide rates alongside <Link href="/corruption-by-country" className="text-[#0066cc] hover:underline">corruption levels</Link>, <Link href="/ranking/rule-of-law" className="text-[#0066cc] hover:underline">rule of law</Link>, and <Link href="/ranking/gini-index" className="text-[#0066cc] hover:underline">income inequality</Link> — all of which correlate strongly with violent crime.</p>
        </div>

        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">Homicide rate per 100,000 by country. Source: UNODC / World Bank.</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Rate (per 100k)</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/homicide-rate`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      <span className={(d.value || 0) > 20 ? 'text-red-600' : (d.value || 0) > 5 ? 'text-amber-600' : 'text-green-600'}>{d.value ? Number(d.value).toFixed(1) : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/homicide-rate" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/ranking/homicide-rate', label: 'Full Rankings' }, { href: '/corruption-by-country', label: 'Corruption Index' }, { href: '/ranking/rule-of-law', label: 'Rule of Law' }, { href: '/ranking/gini-index', label: 'Inequality (Gini)' }, { href: '/poverty-rate-by-country', label: 'Poverty Rate' }, { href: '/population-by-country', label: 'Population' }, { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' }, { href: '/countries', label: 'All Countries' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
