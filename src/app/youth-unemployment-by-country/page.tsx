import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, formatValue } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Youth Unemployment by Country 2026 — Ages 15-24 Ranked',
  description: 'Youth unemployment by country: all countries ranked by unemployment rate for ages 15-24. From under 5% to over 50%. A critical indicator of social stability. Source: World Bank / ILO.',
  alternates: { canonical: 'https://statisticsoftheworld.com/youth-unemployment-by-country' },
};

export default async function YouthUnemploymentByCountryPage() {
  const data = await getIndicatorForAllCountries('SL.UEM.1524.ZS');
  const year = data[0]?.year || '2024';
  const avg = data.length > 0 ? data.reduce((s, d) => s + (d.value || 0), 0) / data.length : 0;

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Dataset', name: `Youth Unemployment by Country ${year}`, description: `Youth unemployment rate (ages 15-24) for ${data.length} countries. Global average: ${avg.toFixed(1)}%. Source: World Bank / ILO.`, url: 'https://statisticsoftheworld.com/youth-unemployment-by-country', creator: { '@type': 'Organization', name: 'World Bank' }, license: 'https://creativecommons.org/licenses/by/4.0/', dateModified: new Date().toISOString().split('T')[0] },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Which country has the highest youth unemployment?', acceptedAnswer: { '@type': 'Answer', text: `${data[0]?.country} has the highest youth unemployment at ${formatValue(data[0]?.value, 'percent', 1)}. Southern Europe (Spain, Greece), North Africa, and the Middle East consistently have rates above 25%. Youth unemployment is typically 2-3x the overall rate.` } },
      { '@type': 'Question', name: 'Why is youth unemployment so important?', acceptedAnswer: { '@type': 'Answer', text: 'High youth unemployment creates long-term "scarring" — research shows entering the job market during recession permanently reduces lifetime earnings. Countries with 25%+ youth unemployment face risks of social instability, brain drain, and a lost generation with fewer skills and lower productivity.' } },
    ]},
  ]};

  return (
    <main className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">Youth Unemployment by Country</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">Youth Unemployment by Country ({year})</h1>
        <p className="text-[15px] text-[#64748b] mb-6">{data.length} countries ranked · Ages 15-24 · Global avg: {avg.toFixed(1)}% · Source: World Bank / ILO · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">The Global Youth Employment Crisis</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Youth <Link href="/unemployment-by-country" className="text-[#0066cc] hover:underline">unemployment</Link> — the rate for ages 15-24 — is typically two to three times higher than the overall rate. Countries with very high rates (above 25%) face long-term risks: a generation that enters adulthood without stable employment develops fewer skills, earns less over their lifetime, and may become politically disaffected. Southern Europe (<Link href="/spain-economy" className="text-[#0066cc] hover:underline">Spain</Link>, <Link href="/greece-economy" className="text-[#0066cc] hover:underline">Greece</Link>), North Africa, and parts of the Middle East have the highest rates globally.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">The causes are structural: skills mismatches between <Link href="/education-spending-by-country" className="text-[#0066cc] hover:underline">education</Link> and employer needs, rigid labor markets protecting existing workers, and dual labor markets where temporary contracts offer lower pay. Countries that reduced youth unemployment successfully — <Link href="/germany-economy" className="text-[#0066cc] hover:underline">Germany</Link> (apprenticeship system), <Link href="/japan-economy" className="text-[#0066cc] hover:underline">Japan</Link> (employer-coordinated hiring) — built strong bridges between education and employment.</p>
        </div>
        <div className="mb-10">
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
            <table className="w-full"><caption className="sr-only">Youth unemployment rate by country. Source: World Bank / ILO.</caption>
              <thead><tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]"><th scope="col" className="px-4 py-2.5 w-12">#</th><th scope="col" className="px-4 py-2.5">Country</th><th scope="col" className="px-4 py-2.5 text-right">Youth Unemp. Rate</th></tr></thead>
              <tbody>
                {data.slice(0, 50).map((d, i) => (
                  <tr key={d.countryId} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-2.5"><Link href={`${getCleanCountryUrl(d.countryId)}/youth-unemployment`} className="text-[#0066cc] hover:underline text-[14px]">{d.country}</Link></td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]"><span className={(d.value || 0) > 25 ? 'text-red-600' : (d.value || 0) > 15 ? 'text-amber-600' : 'text-green-600'}>{formatValue(d.value, 'percent', 1)}</span></td>
                  </tr>))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right"><Link href="/ranking/youth-unemployment" className="text-[14px] text-[#0066cc] hover:underline font-medium">View all {data.length} countries →</Link></div>
        </div>
        <div className="border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/unemployment-by-country', label: 'All Unemployment' }, { href: '/population-by-country', label: 'Population' }, { href: '/fertility-rate-by-country', label: 'Fertility Rate' }, { href: '/education-spending-by-country', label: 'Education Spending' }, { href: '/south-africa-economy', label: 'South Africa Economy' }, { href: '/spain-economy', label: 'Spain Economy' }, { href: '/greece-economy', label: 'Greece Economy' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
