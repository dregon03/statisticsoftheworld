import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllIndicatorsForCountry, formatValue } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Nigeria Economy 2026 — GDP, Oil, Population & Key Data',
  description: 'Nigeria economy in 2026: GDP, growth, inflation, oil revenue, and key indicators. Africa\'s largest economy and most populous country. Source: IMF & World Bank.',
  alternates: { canonical: 'https://statisticsoftheworld.com/nigeria-economy' },
};

export default async function NigeriaEconomyPage() {
  const indicators = await getAllIndicatorsForCountry('NGA');
  const gdp = indicators['IMF.NGDPD']; const gdpGrowth = indicators['IMF.NGDP_RPCH'];
  const gdpPerCapita = indicators['IMF.NGDPDPC']; const inflation = indicators['IMF.PCPIPCH'];
  const unemployment = indicators['IMF.LUR']; const debt = indicators['IMF.GGXWDG_NGDP'];
  const pop = indicators['SP.POP.TOTL']; const lifeExp = indicators['SP.DYN.LE00.IN'];
  const year = gdp?.year || '2026';

  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: `Nigeria Economy ${year}`, dateModified: new Date().toISOString().split('T')[0], author: { '@type': 'Organization', name: 'Statistics of the World' } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `What is Nigeria's GDP?`, acceptedAnswer: { '@type': 'Answer', text: `Nigeria's GDP is approximately ${formatValue(gdp?.value, 'currency')} in ${year}, making it Africa's largest economy. Nigeria is also Africa's most populous country with over 220 million people. Source: IMF.` } },
      { '@type': 'Question', name: `What is Nigeria's inflation rate?`, acceptedAnswer: { '@type': 'Answer', text: `Nigeria's inflation rate is ${formatValue(inflation?.value, 'percent', 1)} in ${year}. Nigeria has experienced persistent high inflation driven by currency depreciation, fuel subsidy removal, and structural supply constraints. Source: IMF.` } },
    ]},
  ]};

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span>
          <Link href="/country/nigeria" className="hover:text-gray-600 transition">Nigeria</Link><span className="mx-2">/</span>
          <span className="text-gray-600">Nigeria Economy</span>
        </nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">The Nigeria Economy in {year}</h1>
        <p className="text-[15px] text-[#64748b] mb-6">Africa&apos;s largest economy · 220M+ people · Source: IMF & World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'GDP (Nominal)', value: formatValue(gdp?.value, 'currency') },
            { label: 'GDP Growth', value: formatValue(gdpGrowth?.value, 'percent', 1) },
            { label: 'Inflation Rate', value: formatValue(inflation?.value, 'percent', 1) },
            { label: 'Unemployment', value: formatValue(unemployment?.value, 'percent', 1) },
            { label: 'GDP per Capita', value: formatValue(gdpPerCapita?.value, 'currency') },
            { label: 'Population', value: formatValue(pop?.value, 'number') },
            { label: 'Govt Debt (% GDP)', value: formatValue(debt?.value, 'percent', 1) },
            { label: 'Life Expectancy', value: lifeExp?.value ? `${Number(lifeExp.value).toFixed(1)} years` : '—' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-[#d5dce6] rounded-xl p-5">
              <div className="text-[13px] text-[#94a3b8] mb-1">{m.label}</div>
              <div className="text-[22px] font-bold text-[#0d1b2a]">{m.value || '—'}</div>
            </div>
          ))}
        </div>

        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Nigeria Economic Overview</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nigeria is Africa&apos;s largest economy by GDP and its most populous country with over 220 million people — projected to become the world&apos;s third most populous by 2050. The economy is dominated by oil and gas, which account for over 90% of export earnings and roughly 50% of government revenue, despite contributing only about 10% of GDP. The non-oil economy — agriculture, services, telecommunications, and a vibrant informal sector — employs the vast majority of Nigerians.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nigeria&apos;s tech ecosystem, centered in Lagos (&quot;Silicon Lagoon&quot;), has emerged as Africa&apos;s most dynamic. Fintech companies like Flutterwave and Paystack (acquired by Stripe) have attracted significant venture capital, and Nigeria leads Africa in startup funding. Lagos, with a metro population exceeding 20 million, is Africa&apos;s commercial capital. The creative industries — Nollywood (the world&apos;s second-largest film industry by volume), Afrobeats music, and fashion — have become significant cultural and economic exports.</p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">Nigeria faces formidable challenges. <Link href="/inflation-by-country" className="text-[#0066cc] hover:underline">Inflation</Link> has been persistently high, driven by naira depreciation, fuel subsidy removal, and food supply disruptions from insecurity in agricultural regions. GDP per capita at {formatValue(gdpPerCapita?.value, 'currency')} is among the lowest of major economies, reflecting both rapid <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population growth</Link> and inadequate economic diversification. Youth unemployment exceeds 40% — a critical concern given Nigeria&apos;s extremely young population (median age ~18). Power infrastructure is severely inadequate, with most businesses relying on private generators.</p>
        </div>

        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Compare Nigeria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/compare/nigeria-vs-south-africa', label: 'vs South Africa' },
              { href: '/compare/nigeria-vs-kenya', label: 'vs Kenya' },
              { href: '/compare/egypt-vs-nigeria', label: 'vs Egypt' },
              { href: '/compare/pakistan-vs-nigeria', label: 'vs Pakistan' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/country/nigeria', label: 'Full Profile →' }, { href: '/india-economy', label: 'India Economy' }, { href: '/brazil-economy', label: 'Brazil Economy' }, { href: '/population-by-country', label: 'Population' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/world-economy', label: 'World Economy' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label}</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
