import type { Metadata } from 'next';
import Link from 'next/link';
import { getIndicatorForAllCountries, getAllIndicatorsForCountry, getHistoricalData, formatValue, getCountries } from '@/lib/data';
import { getCleanCountryUrl } from '@/lib/country-slugs';
import { supabase } from '@/lib/supabase';
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

// Effective tariff rates (ETR) as of April 2026 — POST-SCOTUS LANDSCAPE
//
// On Feb 20 2026, SCOTUS struck down IEEPA tariffs 6-3 (Learning Resources v. Trump).
// ALL country-specific "reciprocal" rates from Liberation Day were voided.
// ALL bilateral deals negotiated under IEEPA (India 18%, Taiwan 15%, Japan 15%, EU 15%) became moot.
// Replaced with SINGLE 10% Section 122 surcharge on ALL imports (effective Feb 24, expires Jul 24 2026).
//
// What survived SCOTUS:
// - Section 122: 10% on all imports (temporary, 150 days)
// - Section 232: Steel/aluminum 50%, autos 25%, copper 25%, pharma up to 100%
// - Section 301: China-specific tariffs (7.5-25% on ~$370B of goods, dating from 2018-2024)
// - USMCA: Duty-free for compliant goods from Canada/Mexico (~85% of imports)
// - Pre-existing MFN duties per HTS schedule
//
// Sources: Yale Budget Lab (Apr 2 2026), Penn Wharton (Mar 2026), White & Case (Feb 2026),
//          Global Trade Alert, Tax Policy Center, PIIE, tariffstool.com
// US overall average ETR: 11.0% (Yale Budget Lab). Falls to 8.2% if Section 122 expires.
//
const TARIFF_RATES: Record<string, { rate: number; headline: number; notes: string; category: string }> = {
  // --- CHINA: Layered duties survive SCOTUS ---
  CHN: { rate: 34, headline: 10, notes: 'ETR 33.9% (Penn Wharton, Jan 2026). Section 122 (10%) + Section 301 (7.5-25% on ~$370B of goods) + Section 232 (steel/aluminum 50%, semiconductors 50%). Nov 2025 deal reduced fentanyl tariff to 10%. Rate was 37.4% in Oct 2025, fell to 33.9% by Jan 2026. Highest among major partners.', category: 'max' },

  // --- USMCA PARTNERS: Largely shielded ---
  CAN: { rate: 5, headline: 10, notes: 'Section 122 (10%) applies to non-USMCA goods only. ~85% of Canadian imports claim USMCA duty-free (Penn Wharton, Jan 2026). Energy/potash at 10%. Lumber subject to separate duties. SCOTUS ruling removed the 25-35% IEEPA tariffs, leaving only Section 122 + USMCA framework.', category: 'low' },
  MEX: { rate: 5, headline: 10, notes: 'Same USMCA dynamic as Canada. ~85% exempt. Auto sector heavily uses USMCA rules of origin. SCOTUS removed IEEPA fentanyl tariffs (Penn Wharton).', category: 'low' },

  // --- SECTION 232 HEAVY COUNTRIES (autos = 25%) ---
  DEU: { rate: 15, headline: 10, notes: 'Section 122 (10%) + Section 232 autos (25%). Auto is Germany\'s largest US export — blended ETR ~15%. SCOTUS voided the EU framework deal (15% IEEPA rate), replacing with Section 122 baseline (Penn Wharton, White & Case).', category: 'medium' },
  JPN: { rate: 15, headline: 10, notes: 'Section 122 (10%) + Section 232 autos (25%). Auto is Japan\'s top US export. The Aug 2025 framework deal (15%) was negotiated under IEEPA and voided by SCOTUS. Current rate is Section 122 + 232 (Penn Wharton, Lenzo).', category: 'medium' },
  KOR: { rate: 15, headline: 10, notes: 'Section 122 (10%) on non-FTA goods + Section 232 autos at 15% (reduced from 25% under Nov 2025 US-Korea deal). Steel/aluminum/copper at 50%. KORUS FTA provides 0% on many goods. Blended ETR ~15% (tariffstool.com, S&P Global, Green Worldwide).', category: 'medium' },
  TUR: { rate: 14, headline: 10, notes: 'Section 122 (10%) + Section 232 steel/aluminum (50%). Steel is major Turkish export — blended ~14% (Yale Budget Lab).', category: 'medium' },

  // --- POST-SCOTUS: Most countries default to 10% Section 122 ---
  // SCOTUS voided ALL IEEPA reciprocal rates. Countries that had bilateral deals (India, Taiwan)
  // saw those deals become moot — they now face the same 10% as everyone else.
  IND: { rate: 10, headline: 10, notes: 'SCOTUS ruling dropped India from 18% (bilateral deal) to 10% Section 122 baseline. The Feb 2026 deal was negotiated under IEEPA authority and became moot (tariffstool.com, India Briefing). India reassessing whether to proceed with market access concessions.', category: 'baseline' },
  TWN: { rate: 10, headline: 10, notes: 'SCOTUS ruling dropped Taiwan from 15% (Jan 2026 deal) to 10% Section 122 baseline. Semiconductor exemptions no longer needed at baseline rate. Subject to Section 301 investigation (Mar 2026) (Global Trade Alert).', category: 'baseline' },
  VNM: { rate: 10, headline: 10, notes: 'SCOTUS voided the 46% reciprocal rate (later reduced to 20%). Now at 10% Section 122 baseline. Subject to Section 301 investigation (Mar 2026). May face higher rates if 301 concludes with action (White & Case, Global Trade Alert).', category: 'baseline' },
  THA: { rate: 10, headline: 10, notes: 'SCOTUS voided the 36% reciprocal rate (later 19%). Now at 10% Section 122 baseline. Subject to Section 301 investigation (Mar 2026) (Nation Thailand, Global Trade Alert).', category: 'baseline' },
  IDN: { rate: 10, headline: 10, notes: 'SCOTUS voided reciprocal rate. Now 10% Section 122. US-Indonesia trade deal signed Feb 19 2026 gave lauan plywood zero duty. Subject to Section 301 investigation (CFR, Global Trade Alert).', category: 'baseline' },
  KHM: { rate: 10, headline: 10, notes: 'SCOTUS voided the 49% reciprocal rate. Now at 10% Section 122. Transshipment concerns remain — subject to Section 301 investigation (Global Trade Alert).', category: 'baseline' },
  BGD: { rate: 10, headline: 10, notes: 'SCOTUS voided the 37% reciprocal rate. Now 10% Section 122. Garment sector benefits from lower rate. Subject to Section 301 investigation (Global Trade Alert).', category: 'baseline' },
  MYS: { rate: 10, headline: 10, notes: 'SCOTUS voided reciprocal rate. Now 10% Section 122. Electronics supply chain. Subject to Section 301 investigation (Mar 2026) (Global Trade Alert).', category: 'baseline' },
  PHL: { rate: 10, headline: 10, notes: 'SCOTUS voided reciprocal rate. Now 10% Section 122. BPO/services sector unaffected by goods tariffs (Global Trade Alert).', category: 'baseline' },
  FRA: { rate: 10, headline: 10, notes: '10% Section 122 baseline. EU framework deal (15%) voided by SCOTUS. Lower auto exposure than Germany — mostly at baseline (Yale Budget Lab).', category: 'baseline' },
  ITA: { rate: 10, headline: 10, notes: '10% Section 122 baseline. Fashion, machinery, food exports (Yale Budget Lab).', category: 'baseline' },
  GBR: { rate: 12, headline: 10, notes: '10% Section 122 baseline + UK-specific Section 232 rates: steel/aluminum 25% (reduced from 50%), auto parts 10%. UK gets preferential metal rates via Executive Order 14309 (Jun 2025). Blended ~12% (Trade Compliance Resource Hub).', category: 'baseline' },
  BRA: { rate: 10, headline: 10, notes: '10% Section 122 baseline. Agricultural trade (Yale Budget Lab).', category: 'baseline' },
  AUS: { rate: 10, headline: 10, notes: '10% baseline. Steel/aluminum at 50% Section 232 but small share of total trade (Yale Budget Lab).', category: 'baseline' },
  SGP: { rate: 10, headline: 10, notes: '10% baseline. Re-export hub. Subject to Section 301 investigation (Mar 2026) (Yale Budget Lab).', category: 'baseline' },
  CHE: { rate: 12, headline: 10, notes: '15% framework agreement on select goods (Section 232 authority, survived SCOTUS). 10% Section 122 on other goods. Pharma may face up to 100% under new Section 232 pharma tariffs (Apr 2 2026). Blended ~12% (Avalara, Grant Thornton).', category: 'baseline' },
  NOR: { rate: 10, headline: 10, notes: '10% baseline. Subject to Section 301 investigation (Mar 2026) (Yale Budget Lab).', category: 'baseline' },
  NZL: { rate: 10, headline: 10, notes: '10% baseline. Small trade volume (Yale Budget Lab).', category: 'baseline' },
  ZAF: { rate: 10, headline: 10, notes: '10% baseline. AGOA benefits under review (Yale Budget Lab).', category: 'baseline' },
  ARG: { rate: 10, headline: 10, notes: '10% baseline. Agricultural exports (Yale Budget Lab).', category: 'baseline' },
  COL: { rate: 10, headline: 10, notes: '10% baseline (Yale Budget Lab).', category: 'baseline' },
  EGY: { rate: 10, headline: 10, notes: '10% baseline (Yale Budget Lab).', category: 'baseline' },

  // --- SPECIAL CASES ---
  RUS: { rate: 35, headline: 35, notes: 'Column 2 (non-MFN) tariff rates apply due to suspension of PNTR. Not affected by SCOTUS ruling — these are statutory, not IEEPA. Minimal bilateral trade since 2022 (Congress.gov).', category: 'high' },
  MMR: { rate: 35, headline: 35, notes: 'Column 2 rates + sanctions-related restrictions. Minimal trade volume (Penn Wharton).', category: 'high' },

  // --- LOW ETR (FTA/energy exemptions) ---
  ISR: { rate: 8, headline: 10, notes: 'US-Israel FTA (not IEEPA-dependent) provides duty exemptions on qualifying goods. Effective rate below baseline (Avalara).', category: 'low' },
  SAU: { rate: 3, headline: 10, notes: 'Energy imports (~95% of Saudi exports to US) exempt from Section 122. Effective rate very low (Penn Wharton).', category: 'low' },
  NGA: { rate: 3, headline: 10, notes: 'Oil imports (>90% of exports to US) exempt. Effective rate very low (Penn Wharton).', category: 'low' },
  PAK: { rate: 10, headline: 10, notes: 'SCOTUS voided the 29% reciprocal rate. Now 10% Section 122. Textile sector now at much lower rate (Global Trade Alert).', category: 'baseline' },
  LKA: { rate: 10, headline: 10, notes: 'SCOTUS voided the 44% reciprocal rate. Now 10% Section 122. Small trade volume (Global Trade Alert).', category: 'baseline' },
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

  // Fetch tariff rates from Supabase (auto-updated by ETL script)
  const { data: dbTariffs } = await supabase
    .from('sotw_tariff_rates')
    .select('*')
    .order('effective_rate', { ascending: false });

  // Fallback to hardcoded if DB is empty
  const tariffSource = dbTariffs && dbTariffs.length > 0
    ? Object.fromEntries(dbTariffs.map(r => [r.country_id, {
        rate: Number(r.effective_rate),
        headline: Number(r.headline_rate),
        notes: r.notes,
        category: r.category,
      }]))
    : TARIFF_RATES;

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
  const rows = Object.entries(tariffSource)
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
          { '@type': 'Question', name: 'What are the current US tariff rates by country in April 2026?', acceptedAnswer: { '@type': 'Answer', text: `As of April 2026, the US average effective tariff rate is 11.0%, the highest since 1943 (Yale Budget Lab). After SCOTUS struck down all IEEPA tariffs in February 2026, most countries face a uniform 10% Section 122 surcharge — but with 1,655 product exemptions (critical minerals, energy, select agriculture, electronics, pharma, aerospace). China is the outlier at ~30% due to layered Section 301 duties that survived SCOTUS. Canada and Mexico effectively pay ~5% because 85% of imports use USMCA duty-free status. Countries with major steel/auto exports (Germany, Japan, Korea) face blended rates of 15-25% due to Section 232 tariffs. The Section 122 surcharge expires July 24, 2026. Sources: Yale Budget Lab, Penn Wharton Budget Model.` } },
          { '@type': 'Question', name: 'Which country faces the highest US tariffs?', acceptedAnswer: { '@type': 'Answer', text: `Among major trading partners, China faces the highest effective tariff rate at ~30% (Penn Wharton). This is down from a peak of 164% in April 2025. The rate reflects 10% Section 122 + Section 301 tariffs (7.5-25% on ~$370B of goods dating from 2018-2024) + Section 232 (steel/aluminum 50%). Russia and Myanmar face ~35% due to Column 2 (non-MFN) statutory rates. South Korea faces ~25% due to Section 232 auto tariffs after failing to ratify its trade deal. Most other countries face the 10% baseline with significant product exemptions.` } },
          { '@type': 'Question', name: 'What products are exempt from the 10% Section 122 tariff?', acceptedAnswer: { '@type': 'Answer', text: 'The Section 122 proclamation includes 1,655 product exemptions in Annex II. Key exempt categories include: critical minerals, energy and energy products, select agricultural products, certain pharmaceuticals and ingredients, specified electronics, certain vehicles and auto parts already subject to Section 232, aerospace products, metals used in currency/bullion, and natural resources not produced in sufficient US quantities. Additionally, USMCA-compliant goods from Canada/Mexico and CAFTA-DR qualifying textile/apparel from Central America are exempt. Products already subject to Section 232 tariffs are also excluded from the surcharge to avoid double-stacking. Source: Global Trade Alert, GingerControl, White & Case.' } },
          { '@type': 'Question', name: 'What happened with the Supreme Court tariff ruling?', acceptedAnswer: { '@type': 'Answer', text: 'On February 20, 2026, the Supreme Court ruled 6-3 in Learning Resources v. Trump that IEEPA cannot be used to impose tariffs. This voided ALL "Liberation Day" reciprocal tariffs and ALL bilateral deals negotiated under IEEPA (India 18%, Taiwan 15%, Japan/EU 15%). The administration replaced them with a 10% Section 122 surcharge under the Trade Act of 1974, effective February 24, expiring July 24, 2026 (150-day limit). Section 232 tariffs (steel, aluminum, autos, pharma) and Section 301 tariffs (China) were unaffected because they use different legal authorities. Sources: White & Case, Global Trade Alert, PIIE.' } },
          { '@type': 'Question', name: 'How have tariffs affected global GDP growth?', acceptedAnswer: { '@type': 'Answer', text: 'The IMF estimates the 2025-2026 tariff escalation reduced global GDP growth by 0.3-0.5 percentage points. The SCOTUS ruling partially reversed this — dropping most countries from 20-50% reciprocal rates to a 10% baseline significantly reduced trade friction. However, uncertainty persists because Section 122 expires July 24 2026 and Section 301 investigations launched in March 2026 could reimpose country-specific rates. China remains most affected. The US effective tariff rate of 11% is its highest since 1943 but far below the 23% peak reached in mid-2025.' } },
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

        {/* Tariff structure explainer */}
        <div className="max-w-[800px] space-y-4 mb-10">
          <h2 className="text-[22px] font-bold text-[#0d1b2a]">Current Tariff Structure (Post-SCOTUS)</h2>
          <p className="text-[15px] text-[#374151] leading-[1.8]">
            After the Supreme Court voided all IEEPA tariffs on February 20, 2026, the US tariff regime simplified dramatically. Four legal authorities now determine what importers actually pay:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <div className="text-[14px] font-bold text-[#0d1b2a] mb-1">Section 122 — 10% Global Surcharge</div>
              <div className="text-[13px] text-[#64748b]">Applies to all imports. Expires Jul 24, 2026. Has <strong>1,655 product exemptions</strong> including critical minerals, energy, select agriculture, electronics, pharma, aerospace. USMCA and CAFTA-DR goods exempt.</div>
            </div>
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <div className="text-[14px] font-bold text-[#0d1b2a] mb-1">Section 232 — Sector Tariffs</div>
              <div className="text-[13px] text-[#64748b]">Steel: <strong>50%</strong> (25% UK). Aluminum: <strong>50%</strong> (25% UK, 200% Russia). Copper: <strong>25-50%</strong>. Autos: <strong>25%</strong> (15% for EU/Japan/Korea). Auto parts: <strong>25%</strong> (10% UK). Lumber: <strong>10%</strong>. Pharma (patented): <strong>up to 100%</strong> (phasing in 120-180 days from Apr 2). Rates restructured Apr 6, 2026 — now apply to full customs value.</div>
            </div>
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <div className="text-[14px] font-bold text-[#0d1b2a] mb-1">Section 301 — China + Pending</div>
              <div className="text-[13px] text-[#64748b]">China: 7.5-25% on ~$370B of goods. Semiconductors: <strong>50%</strong>. Maritime cranes: <strong>100%</strong> (delayed to Nov 2026). New Section 301 investigations (Mar 2026) targeting <strong>16 countries</strong> for excess capacity and forced labor — could reimpose country-specific rates after Jul 2026.</div>
            </div>
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <div className="text-[14px] font-bold text-[#0d1b2a] mb-1">USMCA — Duty Free</div>
              <div className="text-[13px] text-[#64748b]">~85% of Canada/Mexico imports qualify for <strong>0% duty</strong> under USMCA rules of origin. Coverage surged from ~50% to 85% as importers reclassified goods. CAFTA-DR textiles also exempt.</div>
            </div>
          </div>
          <p className="text-[13px] text-[#94a3b8]">
            Sources: <a href="https://www.tradecomplianceresourcehub.com/2026/04/08/trump-2-0-tariff-tracker/" className="hover:underline" target="_blank" rel="noopener">Trade Compliance Resource Hub</a> · <a href="https://budgetlab.yale.edu/research/state-us-tariffs-april-2-2026" className="hover:underline" target="_blank" rel="noopener">Yale Budget Lab</a> · <a href="https://budgetmodel.wharton.upenn.edu/p/2026-03-16-effective-tariff-rates-and-revenues-updated-march-16-2026/" className="hover:underline" target="_blank" rel="noopener">Penn Wharton</a> · <a href="https://www.whitecase.com/insight-alert/trump-administration-imposes-10-section-122-tariff-plan-replace-ieepa-tariffs" className="hover:underline" target="_blank" rel="noopener">White &amp; Case</a> · <a href="https://globaltradealert.org/blog/s122-exemption-structure-explained" className="hover:underline" target="_blank" rel="noopener">Global Trade Alert</a>
          </p>
        </div>

        {/* Upcoming risks */}
        <div className="max-w-[800px] mb-10 border border-orange-200 bg-orange-50 rounded-xl p-5">
          <h3 className="text-[16px] font-bold text-orange-800 mb-2">Upcoming Tariff Risks</h3>
          <ul className="text-[14px] text-[#374151] space-y-1.5 list-disc pl-5">
            <li><strong>Jul 24, 2026:</strong> Section 122 (10% baseline) expires. Must be renewed by Congress or rates drop to pre-Section 122 levels.</li>
            <li><strong>Section 301 investigations (Mar 2026):</strong> Excess capacity investigation targeting China, EU, Singapore, Switzerland, Norway, Indonesia, Malaysia, Cambodia, Thailand, Korea, Vietnam, Taiwan, Bangladesh, Mexico, Japan, India. Could reimpose country-specific rates.</li>
            <li><strong>Forced labor investigation (Mar 2026):</strong> Targeting 60+ countries. Rates TBD.</li>
            <li><strong>Pharma tariffs:</strong> 100% on patented imports phasing in — large companies in ~120 days (Aug 2026), smaller in 180 days (Oct 2026).</li>
            <li><strong>Nov 10, 2026:</strong> Chinese maritime equipment tariffs (100% on cranes, chassis) take effect.</li>
            <li><strong>Semiconductor investigation:</strong> Section 232 investigation on integrated circuits initiated Apr 1, 2026. Threatened rate: 100%.</li>
          </ul>
          <p className="text-[12px] text-[#94a3b8] mt-2">Source: <a href="https://www.tradecomplianceresourcehub.com/2026/04/08/trump-2-0-tariff-tracker/" className="hover:underline" target="_blank" rel="noopener">Trade Compliance Resource Hub (Apr 8, 2026)</a></p>
        </div>

        {/* Main data table */}
        <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-4">Effective Tariff Rates &amp; Economic Impact by Country</h2>
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
