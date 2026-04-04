import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCountry, getCountries, getAllIndicatorsForCountry, getHistoricalData, INDICATORS, CATEGORIES, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';
import CountryCharts from './CountryCharts';
import CountryNarrative from './CountryNarrative';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCountryFromSlug, getCleanCountryUrl, getCleanCountryIndicatorUrl, isIso3 } from '@/lib/country-slugs';

type Props = { params: Promise<{ id: string }> };

/** Resolve the [id] param — could be ISO3 (USA) or slug (united-states) */
function resolveCountryId(rawId: string): string {
  // If it's a slug, resolve to ISO3
  const fromSlug = getCountryFromSlug(rawId);
  if (fromSlug) return fromSlug;
  // Otherwise assume it's an ISO3 code
  return rawId;
}

const KEY_STATS = [
  { id: 'IMF.NGDPD', label: 'GDP' },
  { id: 'SP.POP.TOTL', label: 'Population' },
  { id: 'IMF.NGDPDPC', label: 'GDP per Capita' },
  { id: 'SP.DYN.LE00.IN', label: 'Life Expectancy' },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = resolveCountryId(rawId);
  const country = await getCountry(id);
  if (!country) return { title: 'Country Not Found' };

  const indicators = await getAllIndicatorsForCountry(id);
  const gdp = indicators['IMF.NGDPD'];
  const pop = indicators['SP.POP.TOTL'];

  const parts = [country.name];
  if (gdp) parts.push(`GDP: ${formatValue(gdp.value, 'currency')}`);
  if (pop) parts.push(`Population: ${formatValue(pop.value, 'number')}`);

  const canonicalUrl = getCleanCountryUrl(id);

  return {
    title: `${country.name} Economy & Data 2026 — GDP, Population & More`,
    description: `${parts.join(' · ')}. Explore ${country.name}'s economy, demographics, trade, health, and 400+ indicators with interactive charts and historical data from IMF and World Bank. Free API.`,
    alternates: {
      canonical: `https://statisticsoftheworld.com${canonicalUrl}`,
    },
    openGraph: {
      title: `${country.name} — Economy & Key Statistics 2026`,
      description: `${parts.join(' · ')}. 400+ indicators with charts.`,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = resolveCountryId(rawId);

  // 301 redirect ISO3 codes to clean slug URLs
  if (isIso3(rawId)) {
    const cleanUrl = getCleanCountryUrl(rawId);
    if (cleanUrl !== `/country/${rawId}`) {
      redirect(cleanUrl);
    }
  }

  const country = await getCountry(id);
  if (!country) notFound();

  const indicators = await getAllIndicatorsForCountry(id);

  // Fetch historical data for key stats (for charts)
  const historyPromises = KEY_STATS.map(stat => getHistoricalData(stat.id, id));
  const histories = await Promise.all(historyPromises);
  const keyStatsHistory: Record<string, { year: number; value: number | null }[]> = {};
  KEY_STATS.forEach((stat, i) => {
    keyStatsHistory[stat.id] = histories[i];
  });

  const gdp = indicators['IMF.NGDPD'];
  const pop = indicators['SP.POP.TOTL'];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Country',
        name: country.name,
        url: `https://statisticsoftheworld.com${getCleanCountryUrl(id)}`,
        ...(country.capitalCity && { containsPlace: { '@type': 'City', name: country.capitalCity } }),
        additionalProperty: [
          ...(gdp ? [{ '@type': 'PropertyValue', name: 'GDP (USD Billions)', value: gdp.value, unitCode: 'USD' }] : []),
          ...(pop ? [{ '@type': 'PropertyValue', name: 'Population', value: pop.value }] : []),
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Countries', item: 'https://statisticsoftheworld.com/countries' },
          { '@type': 'ListItem', position: 3, name: country.name, item: `https://statisticsoftheworld.com${getCleanCountryUrl(id)}` },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-4 text-[14px] text-[#94a3b8]">
          <Link href="/" className="hover:text-[#0d1b2a] transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-[#0d1b2a] transition">Countries</Link>
          <span className="mx-2">/</span>
          <span className="text-[#64748b]">{country.name}</span>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[34px] font-extrabold text-[#0d1b2a] mb-2 flex items-center gap-3 tracking-tight">
              <Flag iso2={country.iso2} size={40} />
              {country.name}
            </h1>
            <div className="flex gap-4 text-[14px] text-[#64748b]">
              {country.capitalCity && <span>Capital: {country.capitalCity}</span>}
              <span>Region: {country.region}</span>
              <span>Income: {country.incomeLevel}</span>
            </div>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex gap-1 mb-6 border-b border-[#d5dce6]">
          <span className="px-4 py-2.5 text-[14px] font-semibold text-[#0d1b2a] border-b-2 border-[#0d1b2a]">
            Overview
          </span>
          <Link href={`${getCleanCountryUrl(id)}/forecast`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            Forecasts
          </Link>
          <Link href={`${getCleanCountryUrl(id)}/trade-data`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            Trade
          </Link>
          <Link href={`/calendar`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            Calendar
          </Link>
          <Link href={`/indicators`} className="px-4 py-2.5 text-[14px] text-[#64748b] hover:text-[#0d1b2a] transition">
            All Indicators
          </Link>
        </div>

        {/* AI-generated country profile */}
        <CountryNarrative countryId={id} />

        {/* Key stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {KEY_STATS.map(stat => {
            const ind = INDICATORS.find(i => i.id === stat.id);
            const d = indicators[stat.id];
            return (
              <Link
                key={stat.id}
                href={getCleanCountryIndicatorUrl(id, stat.id)}
                className="bg-white border border-[#d5dce6] rounded-xl p-5 hover:border-[#b0bdd0] hover:shadow-md transition-all group"
              >
                <div className="text-[14px] text-[#64748b] mb-1">{stat.label}</div>
                <div className="text-[24px] font-extrabold text-[#0d1b2a] group-hover:text-[#0066cc] transition">
                  {d && ind ? formatValue(d.value, ind.format, ind.decimals) : 'N/A'}
                </div>
                {d && <div className="text-[14px] text-[#94a3b8] mt-1">{d.year}</div>}
              </Link>
            );
          })}
        </div>

        {/* Key stats charts */}
        <CountryCharts
          keyStats={KEY_STATS}
          indicators={indicators}
          history={keyStatsHistory}
        />

        {/* All indicators by category */}
        <div className="space-y-8 mt-12">
          {CATEGORIES.map(category => {
            const categoryIndicators = INDICATORS.filter(ind => ind.category === category);
            const hasData = categoryIndicators.some(ind => indicators[ind.id]);
            if (!hasData) return null;

            return (
              <div key={category}>
                <h2 className="text-[18px] font-bold mb-3 text-[#0d1b2a]">{category}</h2>
                <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[14px] text-[#64748b] border-b border-[#d5dce6] bg-[#f4f6f9]">
                        <th className="px-5 py-2.5">Indicator</th>
                        <th className="px-5 py-2.5 text-right">Value</th>
                        <th className="px-5 py-2.5 text-right">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryIndicators.map(ind => {
                        const d = indicators[ind.id];
                        if (!d) return null;
                        return (
                          <tr key={ind.id} className="border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition">
                            <td className="px-5 py-2.5 text-[14px]">
                              <Link
                                href={getCleanCountryIndicatorUrl(id, ind.id)}
                                className="text-[#0d1b2a] hover:text-[#0066cc] transition"
                              >
                                {ind.label}
                              </Link>
                            </td>
                            <td className="px-5 py-2.5 text-right font-mono text-[14px]">{formatValue(d.value, ind.format, ind.decimals)}</td>
                            <td className="px-5 py-2.5 text-right text-[#94a3b8] text-[14px]">{d.year}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore Rankings — internal cross-links for SEO */}
        <div className="mt-12">
          <h2 className="text-[18px] font-bold mb-3 text-[#0d1b2a]">Explore Rankings</h2>
          <p className="text-[13px] text-[#64748b] mb-4">See where {country.name} ranks globally across key indicators</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/ranking/gdp', label: 'GDP' },
              { href: '/ranking/gdp-per-capita', label: 'GDP per Capita' },
              { href: '/ranking/gdp-growth', label: 'GDP Growth' },
              { href: '/ranking/population', label: 'Population' },
              { href: '/ranking/inflation-rate', label: 'Inflation' },
              { href: '/ranking/unemployment-rate', label: 'Unemployment' },
              { href: '/ranking/life-expectancy', label: 'Life Expectancy' },
              { href: '/ranking/government-debt', label: 'Debt-to-GDP' },
              { href: '/ranking/gini-index', label: 'Inequality' },
              { href: '/ranking/co2-emissions', label: 'CO₂ Emissions' },
            ].map(r => (
              <Link key={r.href} href={r.href} className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#d5dce6] rounded-lg text-[12px] text-[#475569] hover:text-[#0d1b2a] transition">
                {r.label} Rankings →
              </Link>
            ))}
          </div>
        </div>

        {/* Country Comparisons — cross-links for SEO */}
        <CountryComparisons countryId={id} countryName={country.name} />

        {/* Similar Economies — internal linking mesh */}
        <SimilarCountries countryId={id} region={country.region} incomeLevel={country.incomeLevel} />
      </section>

      <Footer />
    </main>
  );
}

const COMPARISON_PAIRS: Record<string, { slug: string; label: string }[]> = {
  USA: [
    { slug: 'united-states-vs-china', label: 'US vs China' },
    { slug: 'united-states-vs-japan', label: 'US vs Japan' },
    { slug: 'united-states-vs-germany', label: 'US vs Germany' },
    { slug: 'united-states-vs-india', label: 'US vs India' },
    { slug: 'united-states-vs-united-kingdom', label: 'US vs UK' },
    { slug: 'united-states-vs-canada', label: 'US vs Canada' },
  ],
  CHN: [
    { slug: 'united-states-vs-china', label: 'China vs US' },
    { slug: 'china-vs-india', label: 'China vs India' },
    { slug: 'china-vs-japan', label: 'China vs Japan' },
    { slug: 'china-vs-russia', label: 'China vs Russia' },
  ],
  JPN: [
    { slug: 'united-states-vs-japan', label: 'Japan vs US' },
    { slug: 'japan-vs-germany', label: 'Japan vs Germany' },
    { slug: 'japan-vs-south-korea', label: 'Japan vs South Korea' },
  ],
  DEU: [
    { slug: 'united-states-vs-germany', label: 'Germany vs US' },
    { slug: 'germany-vs-france', label: 'Germany vs France' },
    { slug: 'germany-vs-united-kingdom', label: 'Germany vs UK' },
  ],
  GBR: [
    { slug: 'united-states-vs-united-kingdom', label: 'UK vs US' },
    { slug: 'germany-vs-united-kingdom', label: 'UK vs Germany' },
    { slug: 'united-kingdom-vs-france', label: 'UK vs France' },
    { slug: 'united-kingdom-vs-canada', label: 'UK vs Canada' },
  ],
  IND: [
    { slug: 'united-states-vs-india', label: 'India vs US' },
    { slug: 'china-vs-india', label: 'India vs China' },
    { slug: 'india-vs-brazil', label: 'India vs Brazil' },
    { slug: 'india-vs-pakistan', label: 'India vs Pakistan' },
  ],
  FRA: [
    { slug: 'germany-vs-france', label: 'France vs Germany' },
    { slug: 'united-kingdom-vs-france', label: 'France vs UK' },
    { slug: 'france-vs-italy', label: 'France vs Italy' },
  ],
  BRA: [
    { slug: 'united-states-vs-brazil', label: 'Brazil vs US' },
    { slug: 'india-vs-brazil', label: 'Brazil vs India' },
    { slug: 'brazil-vs-mexico', label: 'Brazil vs Mexico' },
    { slug: 'brazil-vs-argentina', label: 'Brazil vs Argentina' },
  ],
  CAN: [
    { slug: 'united-states-vs-canada', label: 'Canada vs US' },
    { slug: 'united-kingdom-vs-canada', label: 'Canada vs UK' },
    { slug: 'canada-vs-australia', label: 'Canada vs Australia' },
  ],
  AUS: [
    { slug: 'united-states-vs-australia', label: 'Australia vs US' },
    { slug: 'canada-vs-australia', label: 'Australia vs Canada' },
    { slug: 'australia-vs-new-zealand', label: 'Australia vs NZ' },
  ],
  RUS: [
    { slug: 'united-states-vs-russia', label: 'Russia vs US' },
    { slug: 'china-vs-russia', label: 'Russia vs China' },
    { slug: 'russia-vs-india', label: 'Russia vs India' },
  ],
  KOR: [
    { slug: 'japan-vs-south-korea', label: 'South Korea vs Japan' },
    { slug: 'united-states-vs-south-korea', label: 'South Korea vs US' },
    { slug: 'south-korea-vs-australia', label: 'South Korea vs Australia' },
  ],
  MEX: [
    { slug: 'united-states-vs-mexico', label: 'Mexico vs US' },
    { slug: 'brazil-vs-mexico', label: 'Mexico vs Brazil' },
    { slug: 'canada-vs-mexico', label: 'Mexico vs Canada' },
  ],
  ITA: [
    { slug: 'germany-vs-italy', label: 'Italy vs Germany' },
    { slug: 'france-vs-italy', label: 'Italy vs France' },
    { slug: 'italy-vs-spain', label: 'Italy vs Spain' },
  ],
  ARG: [{ slug: 'brazil-vs-argentina', label: 'Argentina vs Brazil' }],
  NGA: [{ slug: 'nigeria-vs-south-africa', label: 'Nigeria vs South Africa' }, { slug: 'nigeria-vs-kenya', label: 'Nigeria vs Kenya' }],
  SAU: [{ slug: 'saudi-arabia-vs-uae', label: 'Saudi Arabia vs UAE' }],
  SGP: [{ slug: 'singapore-vs-switzerland', label: 'Singapore vs Switzerland' }],
  TUR: [{ slug: 'turkey-vs-mexico', label: 'Turkey vs Mexico' }, { slug: 'turkey-vs-brazil', label: 'Turkey vs Brazil' }],
  ESP: [{ slug: 'france-vs-spain', label: 'Spain vs France' }, { slug: 'italy-vs-spain', label: 'Spain vs Italy' }, { slug: 'united-states-vs-spain', label: 'Spain vs US' }],
  IDN: [{ slug: 'indonesia-vs-india', label: 'Indonesia vs India' }, { slug: 'indonesia-vs-brazil', label: 'Indonesia vs Brazil' }, { slug: 'indonesia-vs-mexico', label: 'Indonesia vs Mexico' }],
  POL: [{ slug: 'poland-vs-germany', label: 'Poland vs Germany' }, { slug: 'poland-vs-united-kingdom', label: 'Poland vs UK' }],
  THA: [{ slug: 'thailand-vs-vietnam', label: 'Thailand vs Vietnam' }, { slug: 'thailand-vs-indonesia', label: 'Thailand vs Indonesia' }],
  VNM: [{ slug: 'vietnam-vs-indonesia', label: 'Vietnam vs Indonesia' }, { slug: 'vietnam-vs-india', label: 'Vietnam vs India' }, { slug: 'thailand-vs-vietnam', label: 'Vietnam vs Thailand' }],
  PHL: [{ slug: 'philippines-vs-vietnam', label: 'Philippines vs Vietnam' }, { slug: 'philippines-vs-indonesia', label: 'Philippines vs Indonesia' }],
  EGY: [{ slug: 'egypt-vs-saudi-arabia', label: 'Egypt vs Saudi Arabia' }, { slug: 'egypt-vs-nigeria', label: 'Egypt vs Nigeria' }, { slug: 'south-africa-vs-egypt', label: 'Egypt vs South Africa' }],
  PAK: [{ slug: 'india-vs-pakistan', label: 'Pakistan vs India' }, { slug: 'pakistan-vs-bangladesh', label: 'Pakistan vs Bangladesh' }],
  BGD: [{ slug: 'india-vs-bangladesh', label: 'Bangladesh vs India' }, { slug: 'pakistan-vs-bangladesh', label: 'Bangladesh vs Pakistan' }],
  CHE: [{ slug: 'singapore-vs-switzerland', label: 'Switzerland vs Singapore' }, { slug: 'switzerland-vs-norway', label: 'Switzerland vs Norway' }, { slug: 'switzerland-vs-germany', label: 'Switzerland vs Germany' }],
  NLD: [{ slug: 'italy-vs-netherlands', label: 'Netherlands vs Italy' }, { slug: 'netherlands-vs-belgium', label: 'Netherlands vs Belgium' }],
  NOR: [{ slug: 'switzerland-vs-norway', label: 'Norway vs Switzerland' }, { slug: 'sweden-vs-norway', label: 'Norway vs Sweden' }],
  SWE: [{ slug: 'sweden-vs-norway', label: 'Sweden vs Norway' }],
  COL: [{ slug: 'argentina-vs-colombia', label: 'Colombia vs Argentina' }],
  CHL: [{ slug: 'chile-vs-argentina', label: 'Chile vs Argentina' }],
  ETH: [{ slug: 'kenya-vs-ethiopia', label: 'Ethiopia vs Kenya' }],
  KEN: [{ slug: 'nigeria-vs-kenya', label: 'Kenya vs Nigeria' }, { slug: 'kenya-vs-ethiopia', label: 'Kenya vs Ethiopia' }],
};

function CountryComparisons({ countryId, countryName }: { countryId: string; countryName: string }) {
  const pairs = COMPARISON_PAIRS[countryId];
  if (!pairs || pairs.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-[18px] font-bold mb-3 text-[#0d1b2a]">Compare {countryName}</h2>
      <p className="text-[13px] text-[#64748b] mb-4">Side-by-side economic comparison with other major economies</p>
      <div className="flex flex-wrap gap-2">
        {pairs.map(p => (
          <Link key={p.slug} href={`/compare/${p.slug}`} className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#d5dce6] rounded-lg text-[12px] text-[#475569] hover:text-[#0d1b2a] transition">
            {p.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}

async function SimilarCountries({ countryId, region, incomeLevel }: { countryId: string; region: string; incomeLevel: string }) {
  const allCountries = await getCountries();
  const sameRegion = allCountries
    .filter(c => c.id !== countryId && c.region === region)
    .slice(0, 6);
  const sameIncome = allCountries
    .filter(c => c.id !== countryId && c.incomeLevel === incomeLevel && c.region !== region)
    .slice(0, 6);
  const peers = [...sameRegion, ...sameIncome].slice(0, 8);

  if (peers.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-[18px] font-bold mb-3 text-[#0d1b2a]">Similar Economies</h2>
      <p className="text-[13px] text-[#64748b] mb-4">Countries in the same region ({region}) or income group ({incomeLevel})</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {peers.map(c => (
          <Link
            key={c.id}
            href={`/country/${c.id}`}
            className="border border-[#d5dce6] rounded-lg p-3 hover:border-[#b0bdd0] hover:bg-[#fafbfd] transition group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flag iso2={c.iso2} size={18} />
              <span className="text-[14px] font-medium text-[#0d1b2a] group-hover:text-[#0066cc] transition">{c.name}</span>
            </div>
            <div className="text-[12px] text-[#94a3b8]">{c.region}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
