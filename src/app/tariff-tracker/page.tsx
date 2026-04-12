import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, getAllIndicatorsForCountry, getHistoricalData, formatValue, getCountries } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'US Tariff Impact Tracker 2026 — Economic Effects by Country',
  description: 'Track the economic impact of US tariffs on 218 countries. GDP growth, inflation, trade balance, and currency changes since April 2025 Liberation Day tariffs. Updated with live IMF & World Bank data.',
  alternates: { canonical: 'https://statisticsoftheworld.com/tariff-tracker' },
  openGraph: {
    title: 'US Tariff Impact Tracker 2026 — Country-by-Country Economic Effects',
    description: 'How have US tariffs reshaped the global economy? GDP, inflation, trade, and currency data for 218 countries. Live data from IMF & World Bank.',
    siteName: 'Statistics of the World',
  },
};

// Effective tariff rates as of April 2026
// "Headline" = statutory/announced rate. "Effective" = actual rate paid after exemptions, USMCA, FTAs.
// Sources: Yale Budget Lab, Penn Wharton, Tax Foundation, USTR, bilateral deal announcements.
// US average effective tariff: 11.0% (highest since 1943). Section 122 baseline: 10%, expires Jul 24 2026.
const TARIFF_RATES: Record<string, { rate: number; headline: number; notes: string; category: string }> = {
  CHN: { rate: 34, headline: 34, notes: 'Highest ETR. Nov 2025 deal reduced reciprocal tariffs from 125% to 10%, but layered Section 301 + fentanyl + Section 232 duties bring effective rate to ~34%.', category: 'max' },
  KHM: { rate: 49, headline: 49, notes: 'Among highest headline rates. Transshipment concerns from China. Small trade volume.', category: 'max' },
  VNM: { rate: 46, headline: 46, notes: 'High headline rate. China+1 diversification initially boosted Vietnam, but tariffs followed.', category: 'max' },
  LKA: { rate: 44, headline: 44, notes: 'High headline rate, very small trade volume with US.', category: 'max' },
  MMR: { rate: 44, headline: 44, notes: 'High headline rate. Minimal enforcement due to sanctions.', category: 'max' },
  BGD: { rate: 37, headline: 37, notes: 'Garment industry heavily affected. Major RMG exporter.', category: 'high' },
  THA: { rate: 36, headline: 36, notes: 'Manufacturing hub. Electronics and auto parts affected.', category: 'high' },
  RUS: { rate: 35, headline: 35, notes: 'Elevated due to sanctions-adjacent policy. Minimal bilateral trade.', category: 'high' },
  TWN: { rate: 15, headline: 15, notes: 'Reduced from 20% to 15% in Jan 2026 bilateral deal. Semiconductor exemptions.', category: 'baseline' },
  IDN: { rate: 32, headline: 32, notes: 'Nickel and manufacturing. High headline rate.', category: 'high' },
  PAK: { rate: 29, headline: 29, notes: 'Textile sector affected. Small overall trade volume.', category: 'high' },
  KOR: { rate: 25, headline: 25, notes: 'Auto sector tariffs 25% under Section 232. Other goods at baseline.', category: 'high' },
  MYS: { rate: 24, headline: 24, notes: 'Electronics supply chain. Semiconductor-related exemptions under discussion.', category: 'high' },
  IND: { rate: 18, headline: 18, notes: 'Negotiated down from 25% to 18% in Feb 2026 bilateral deal. Market access concessions.', category: 'medium' },
  PHL: { rate: 17, headline: 17, notes: 'BPO/services sector less affected. Goods trade at moderate rate.', category: 'medium' },
  DEU: { rate: 15, headline: 15, notes: 'EU baseline 10% Section 122 + auto tariff 25% (Section 232). Blended ~15%.', category: 'baseline' },
  FRA: { rate: 12, headline: 10, notes: 'EU baseline. Wine/luxury goods face 10% Section 122. Lower auto exposure than Germany.', category: 'baseline' },
  ITA: { rate: 12, headline: 10, notes: 'EU baseline. Fashion, food exports at 10%.', category: 'baseline' },
  GBR: { rate: 10, headline: 10, notes: '10% Section 122 baseline. UK-US mini-deal under negotiation.', category: 'baseline' },
  JPN: { rate: 14, headline: 10, notes: '10% baseline + 25% auto tariff (Section 232). Auto is major export — blended ~14%.', category: 'baseline' },
  CAN: { rate: 5, headline: 25, notes: 'Headline 25% (35% some goods), but ~85% of imports use USMCA duty-free. Effective rate ~5%. Energy at 10%.', category: 'low' },
  MEX: { rate: 5, headline: 25, notes: 'Headline 25%, but ~85% USMCA-compliant and exempt. Effective rate ~5%.', category: 'low' },
  BRA: { rate: 10, headline: 10, notes: '10% Section 122 baseline. Agricultural trade flows both ways.', category: 'baseline' },
  AUS: { rate: 10, headline: 10, notes: '10% baseline. AUKUS ally. Steel/aluminum at 25% (Section 232).', category: 'baseline' },
  ISR: { rate: 8, headline: 10, notes: 'US-Israel FTA provides significant exemptions. Effective rate below baseline.', category: 'low' },
  SAU: { rate: 3, headline: 10, notes: 'Energy imports largely exempt from tariffs. Effective rate very low.', category: 'low' },
  SGP: { rate: 10, headline: 10, notes: '10% baseline. Re-export hub — many goods transshipped, not consumed.', category: 'baseline' },
  CHE: { rate: 10, headline: 10, notes: '10% baseline. Pharma sector may face up to 100% under new Section 232 pharma tariffs.', category: 'baseline' },
  NOR: { rate: 10, headline: 10, notes: '10% baseline. Energy/fish exports.', category: 'baseline' },
  NZL: { rate: 10, headline: 10, notes: '10% baseline. Small trade volume.', category: 'baseline' },
  ZAF: { rate: 10, headline: 10, notes: '10% baseline. AGOA status under review — could change.', category: 'baseline' },
  NGA: { rate: 3, headline: 10, notes: 'Oil imports largely exempt. Effective rate very low.', category: 'low' },
  TUR: { rate: 14, headline: 10, notes: '10% baseline + steel/aluminum 50% (Section 232). Blended ~14%.', category: 'baseline' },
  ARG: { rate: 10, headline: 10, notes: '10% baseline. Agricultural exports.', category: 'baseline' },
  COL: { rate: 10, headline: 10, notes: '10% baseline.', category: 'baseline' },
  EGY: { rate: 10, headline: 10, notes: '10% baseline.', category: 'baseline' },
};

type CategoryColor = 'max' | 'high' | 'medium' | 'baseline' | 'low';
const CATEGORY_COLORS: Record<CategoryColor, string> = {
  max: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  baseline: 'bg-gray-100 text-gray-700 border-gray-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

export default async function TariffTrackerPage() {
  const countries = await getCountries();

  // Fetch key economic indicators for tariffed countries
  const [gdpGrowthData, inflationData, tradeData] = await Promise.all([
    getIndicatorForAllCountries('IMF.NGDP_RPCH'),
    getIndicatorForAllCountries('IMF.PCPIPCH'),
    getIndicatorForAllCountries('NE.TRD.GNFS.ZS'),
  ]);

  const gdpMap = Object.fromEntries(gdpGrowthData.map(d => [d.countryId, d]));
  const inflMap = Object.fromEntries(inflationData.map(d => [d.countryId, d]));
  const tradeMap = Object.fromEntries(tradeData.map(d => [d.countryId, d]));
  const countryMap = Object.fromEntries(countries.map(c => [c.id, c]));

  // Build rows sorted by effective tariff rate descending
  const rows = Object.entries(TARIFF_RATES)
    .map(([id, t]) => ({
      id,
      name: countryMap[id]?.name || id,
      iso2: countryMap[id]?.iso2 || '',
      rate: t.rate,
      headline: t.headline,
      notes: t.notes,
      category: t.category as CategoryColor,
      gdpGrowth: gdpMap[id]?.value,
      inflation: inflMap[id]?.value,
      tradeOpenness: tradeMap[id]?.value,
    }))
    .sort((a, b) => b.rate - a.rate);

  const avgTariff = rows.reduce((s, r) => s + r.rate, 0) / rows.length;
  const maxRate = rows[0];
  const totalCountries = Object.keys(TARIFF_RATES).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        name: 'US Tariff Rates and Economic Impact by Country (2026)',
        description: `US tariff rates and economic impact data for ${totalCountries} major trading partners in 2026. Includes tariff rates, GDP growth, inflation, and trade openness. Sources: USTR, IMF World Economic Outlook, World Bank WDI.`,
        url: 'https://statisticsoftheworld.com/tariff-tracker',
        creator: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        dateModified: new Date().toISOString().split('T')[0],
        keywords: ['tariffs', 'trade war', 'US tariffs', 'Liberation Day', 'economic impact', 'GDP growth', 'inflation', 'trade policy'],
      },
      {
        '@type': 'Article',
        headline: 'US Tariff Impact Tracker 2026 — Economic Effects by Country',
        description: `Tracking the economic impact of US tariffs across ${totalCountries} countries. Average tariff rate: ${avgTariff.toFixed(0)}%. Highest: ${maxRate.name} at ${maxRate.rate}%.`,
        datePublished: '2026-04-12',
        dateModified: new Date().toISOString().split('T')[0],
        author: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What are the current US tariff rates by country?', acceptedAnswer: { '@type': 'Answer', text: `As of April 2026, US tariff rates range from 15% (Section 122 baseline for most countries) to 145% (China). The average across major trading partners is approximately ${avgTariff.toFixed(0)}%. Following the Supreme Court ruling in February 2026 that struck down IEEPA tariffs, the administration replaced them with a 15% baseline under Section 122, with higher rates maintained for China and select countries through other authorities.` } },
          { '@type': 'Question', name: 'Which country faces the highest US tariffs?', acceptedAnswer: { '@type': 'Answer', text: `China faces the highest US tariff rate at 145%, comprising 125% "reciprocal" tariffs plus a 20% fentanyl-related surcharge. This is followed by Cambodia (49%), Vietnam (46%), Sri Lanka (44%), and Myanmar (44%). These rates have dramatically reshaped global supply chains, with many manufacturers relocating from China to India, Mexico, and other countries with lower tariff exposure.` } },
          { '@type': 'Question', name: 'How have tariffs affected global GDP growth?', acceptedAnswer: { '@type': 'Answer', text: 'The IMF estimates the 2025-2026 tariff escalation reduced global GDP growth by 0.3-0.5 percentage points. China has been the most affected large economy, with growth slowing from 5.2% in 2023 to approximately 4.2% in 2026. Southeast Asian economies initially benefited from supply chain diversion but now face their own elevated tariff rates. India negotiated a bilateral deal reducing its tariff to 18%, helping maintain growth above 6%.' } },
          { '@type': 'Question', name: 'What happened with the Supreme Court tariff ruling?', acceptedAnswer: { '@type': 'Answer', text: 'On February 20, 2026, the Supreme Court ruled 6-3 in Learning Resources v. Trump that the use of IEEPA (International Emergency Economic Powers Act) to impose tariffs was unlawful. The court found that tariff authority falls outside IEEPA\'s scope. The administration responded by replacing IEEPA tariffs with a 15% baseline tariff under Section 122, which allows temporary import surcharges of up to 15% for 150 days to address balance-of-payments issues.' } },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Trade', item: 'https://statisticsoftheworld.com/trade' },
          { '@type': 'ListItem', position: 3, name: 'Tariff Impact Tracker', item: 'https://statisticsoftheworld.com/tariff-tracker' },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[1100px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/trade" className="hover:text-gray-600 transition">Trade</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Tariff Impact Tracker</span>
        </nav>

        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-2">US Tariff Impact Tracker (2026)</h1>
        <p className="text-[15px] text-[#64748b] mb-8">
          How US tariffs are reshaping the global economy · {totalCountries} countries tracked · Sources: USTR, IMF, World Bank · Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Highest Tariff</div>
            <div className="text-[22px] font-bold text-red-600">{maxRate.rate}%</div>
            <div className="text-[13px] text-[#94a3b8]">{maxRate.name}</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Section 122 Baseline</div>
            <div className="text-[22px] font-bold text-[#0d1b2a]">10%</div>
            <div className="text-[13px] text-[#94a3b8]">Expires Jul 24, 2026</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Avg. Tariff Rate</div>
            <div className="text-[22px] font-bold text-[#0d1b2a]">{avgTariff.toFixed(0)}%</div>
            <div className="text-[13px] text-[#94a3b8]">{totalCountries} countries</div>
          </div>
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5">
            <div className="text-[13px] text-[#94a3b8] mb-1">Countries &gt;25%</div>
            <div className="text-[22px] font-bold text-orange-600">{rows.filter(r => r.rate > 25).length}</div>
            <div className="text-[13px] text-[#94a3b8]">above-baseline</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Timeline</h2>
          <div className="space-y-3 text-[15px] text-[#374151] leading-[1.8]">
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Apr 2, 2025</div>
              <div><strong>&quot;Liberation Day&quot;</strong> — Executive order imposes 10% baseline tariff on all imports + country-specific &quot;reciprocal&quot; tariffs up to 145% (China) under IEEPA authority.</div>
            </div>
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Apr–Dec 2025</div>
              <div>Retaliatory tariffs from China (125% on US goods), EU (targeted tariffs on US agriculture, bourbon, motorcycles), Canada (matching 25% on US goods).</div>
            </div>
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Nov 2025</div>
              <div><strong>US-China deal</strong> — reciprocal tariffs reduced from 125% to 10% on each other&apos;s goods (other layered tariffs remain). Extended through Nov 2026.</div>
            </div>
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Jan 2026</div>
              <div><strong>US-Taiwan deal</strong> — Taiwan&apos;s reciprocal tariff reduced from 20% to 15%. Semiconductor exemptions.</div>
            </div>
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Feb 2026</div>
              <div><strong>Supreme Court ruling</strong> — <em>Learning Resources v. Trump</em>: IEEPA tariffs struck down 6-3. Administration replaces with 10% baseline under Section 122 (expires Jul 24, 2026).</div>
            </div>
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Feb 2026</div>
              <div><strong>US-India mini-deal</strong> — India&apos;s tariff reduced from 26% to 18% in exchange for market access concessions in technology and agriculture.</div>
            </div>
            <div className="flex gap-3">
              <div className="text-[13px] text-[#94a3b8] w-24 shrink-0 pt-0.5">Apr 2026</div>
              <div>One year on: US effective tariff rate at 11% (highest since 1943). USMCA shields ~85% of Canada/Mexico trade. New Section 232 tariffs on pharma (up to 100%). Section 122 baseline expires Jul 24.</div>
            </div>
          </div>
        </div>

        {/* Main data table */}
        <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-4">Tariff Rates &amp; Economic Impact by Country</h2>
        <div className="border border-[#d5dce6] rounded-xl overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">US tariff rates and economic indicators by country, 2026</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#94a3b8] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-4 py-2.5 w-12">#</th>
                  <th scope="col" className="px-4 py-2.5">Country</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Effective Rate</th>
                  <th scope="col" className="px-4 py-2.5 text-right">GDP Growth</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Inflation</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Trade (% GDP)</th>
                  <th scope="col" className="px-4 py-2.5">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition">
                    <td className="px-4 py-2.5 text-[#94a3b8] text-[13px]">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <Link href={getCleanCountryUrl(row.id)} className="text-[#0066cc] hover:underline text-[14px] font-medium">
                        {row.iso2 && <img src={`https://flagcdn.com/16x12/${row.iso2.toLowerCase()}.png`} alt="" className="inline mr-1.5 -mt-0.5" width={16} height={12} />}
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[13px] font-semibold border ${CATEGORY_COLORS[row.category]}`}>
                        {row.rate}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      {row.gdpGrowth != null ? (
                        <span className={row.gdpGrowth < 0 ? 'text-red-600' : row.gdpGrowth < 2 ? 'text-yellow-600' : 'text-green-600'}>
                          {row.gdpGrowth > 0 ? '+' : ''}{row.gdpGrowth.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      {row.inflation != null ? `${row.inflation.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[14px]">
                      {row.tradeOpenness != null ? `${row.tradeOpenness.toFixed(0)}%` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[#64748b] max-w-[250px]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis */}
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Key Findings</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The US tariff regime that began with &quot;Liberation Day&quot; on April 2, 2025 represents the most significant shift in US trade policy since Smoot-Hawley. One year on, the picture is more nuanced than the initial shock suggested. The US average effective tariff rate stands at 11.0% — the highest since 1943, but far below the headline rates announced in April 2025. The gap between headline and effective rates is the story: Canada and Mexico face announced tariffs of 25-35%, but ~85% of their exports enter duty-free under USMCA, producing effective rates of just ~5%. China&apos;s effective rate of ~34% is the highest of any major partner, but well below the initial 145% — a November 2025 deal reduced the reciprocal tariff from 125% to 10%, though layered Section 301 and fentanyl duties keep the blended rate high.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The February 2026 Supreme Court ruling in <em>Learning Resources v. Trump</em> fundamentally changed the legal landscape. By striking down the use of IEEPA for tariffs, the court forced the administration to fall back on Section 122 of the Trade Act of 1974, which limits import surcharges to 10% for 150 days. This creates rolling legal uncertainty — the current 10% baseline expires on July 24, 2026 and must be renewed or replaced with congressional action. Meanwhile, Section 232 tariffs (steel 50%, aluminum 50%, autos 25%, pharma up to 100%) remain legally distinct and unaffected by the ruling.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            The macroeconomic effects are asymmetric. US inflation remains above the Fed&apos;s 2% target, partly driven by higher import costs. China has experienced deflationary pressure as export demand shifted. Countries with high trade-to-GDP ratios (Singapore, Vietnam, Malaysia) are most exposed to tariff shocks. India emerged as a relative winner, negotiating its rate down to 18% in exchange for market access concessions. The biggest surprise is USMCA&apos;s resilience — the free trade agreement has proven far more durable than initial rhetoric suggested, with importers aggressively leveraging rules of origin to maintain duty-free access. The IMF estimates the tariff escalation reduced global GDP growth by 0.3-0.5 percentage points relative to baseline.
          </p>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            All economic data on this page is sourced from the <a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">IMF World Economic Outlook</a>, the <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">World Bank</a>, and the <a href="https://ustr.gov" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">Office of the US Trade Representative</a>. Tariff rates reflect the post-Supreme Court legal framework as of April 2026.
          </p>
        </div>

        {/* Related */}
        <div className="border-t border-[#d5dce6] pt-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-4">Explore Related Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { href: '/trade', label: 'Global Trade Data' },
              { href: '/blog/liberation-day-tariffs-one-year-later', label: 'Liberation Day Analysis' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/india-economy', label: 'India Economy' },
              { href: '/inflation-by-country', label: 'Inflation by Country' },
              { href: '/gdp-growth-by-country', label: 'GDP Growth by Country' },
              { href: '/compare/united-states-vs-china', label: 'US vs China' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/countries', label: 'All 218 Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
