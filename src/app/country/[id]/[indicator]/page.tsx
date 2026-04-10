import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { getCountry, getHistoricalData, getHistoricalStats, getYoYChange, getIndicatorForAllCountries, getIndicatorMeta, INDICATORS, formatValue } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../../Flag';
import IndicatorDetailCharts from './IndicatorDetailCharts';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import StatsRow from '@/components/StatsRow';
import HistoryExportButton from '@/components/HistoryExportButton';
import EmbedButton from '@/components/EmbedButton';
import IndicatorContext from './IndicatorContext';
import { getCountryFromSlug, getCleanCountryIndicatorUrl, getCleanCountryUrl, isIso3, getIndicatorFromSlug } from '@/lib/country-slugs';

type Props = { params: Promise<{ id: string; indicator: string }> };

/** Resolve [id] param — ISO3 or slug */
function resolveCountryId(rawId: string): string {
  const fromSlug = getCountryFromSlug(rawId);
  return fromSlug || rawId;
}

/** Resolve [indicator] param — encoded ID or slug */
function resolveIndicatorId(raw: string): string {
  const fromSlug = getIndicatorFromSlug(raw);
  return fromSlug || decodeURIComponent(raw);
}

// SEO-friendly labels for top-traffic indicators — matches how people actually search
const SEO_LABELS: Record<string, string> = {
  'IS.AIR.PSGR': 'Air Passengers',
  'IS.AIR.GOOD.MT.K1': 'Air Freight',
  'NY.GNP.MKTP.CD': 'Gross National Income (GNI)',
  'NY.GNP.PCAP.CD': 'GNI per Capita',
  'VC.IHR.PSRC.P5': 'Homicide Rate',
  'SP.POP.DPND.YG': 'Youth Dependency Ratio',
  'RL.PER.RNK': 'Rule of Law Index',
  'SH.DYN.MORT': 'Infant Mortality Rate',
  'SE.XPD.TOTL.GD.ZS': 'Education Spending (% of GDP)',
  'NE.IMP.GNFS.CD': 'Total Imports',
  'NE.IMP.GNFS.ZS': 'Imports (% of GDP)',
  'NE.CON.PRVT.ZS': 'Household Consumption (% of GDP)',
  'WHO.ROAD_DEATHS': 'Road Traffic Death Rate',
  'SP.POP.0014.TO.ZS': 'Population Under 15',
  'SP.POP.65UP.TO.ZS': 'Population Over 65',
  'IMF.NGDP_RPCH': 'GDP Growth Rate',
  'IMF.NGDPDPC': 'GDP per Capita',
  'IMF.PPPGDP': 'GDP (PPP)',
  'GB.XPD.RSDV.GD.ZS': 'R&D Spending (% of GDP)',
  'SL.UEM.1524.ZS': 'Youth Unemployment Rate',
  'SP.DYN.LE00.IN': 'Life Expectancy',
  'SP.POP.GROW': 'Population Growth Rate',
  'SP.URB.TOTL.IN.ZS': 'Urban Population (%)',
  'SH.STA.SUIC.P5': 'Suicide Rate',
  'VA.EST': 'Voice & Accountability Index',
  'SM.POP.NETM': 'Net Migration',
  'GC.TAX.TOTL.GD.ZS': 'Tax Revenue (% of GDP)',
  'IP.JRN.ARTC.SC': 'Scientific Publications',
  'GE.PER.RNK': 'Government Effectiveness Index',
  'CC.PER.RNK': 'Corruption Control Index',
  'IMF.NGDPD': 'GDP (Nominal)',
  'IMF.PCPIPCH': 'Inflation Rate',
  'IMF.LUR': 'Unemployment Rate',
  'IMF.GGXWDG_NGDP': 'Government Debt (% of GDP)',
  'SP.POP.TOTL': 'Population',
  'SP.DYN.TFRT.IN': 'Fertility Rate',
  'SL.UEM.TOTL.ZS': 'Unemployment Rate',
  'EN.GHG.CO2.PC.CE.AR5': 'CO₂ Emissions per Capita',
  'NE.TRD.GNFS.ZS': 'Trade Openness (% of GDP)',
  'BX.KLT.DINV.WD.GD.ZS': 'Foreign Direct Investment (% of GDP)',
  'SH.XPD.CHEX.GD.ZS': 'Health Spending (% of GDP)',
  'MS.MIL.XPND.GD.ZS': 'Military Spending (% of GDP)',
  'SI.POV.GINI': 'Gini Index',
  'EG.FEC.RNEW.ZS': 'Renewable Energy (%)',
  'IT.NET.USER.ZS': 'Internet Users (%)',
  'SG.GEN.PARL.ZS': 'Women in Parliament (%)',
  'NE.EXP.GNFS.CD': 'Total Exports',
  'NV.IND.TOTL.ZS': 'Industry (% of GDP)',
  'SH.XPD.CHEX.PC.CD': 'Health Spending per Capita',
};

// Indicator ID → SEO ranking slug (for cross-linking to /ranking/ pages)
const RANKING_SLUGS: Record<string, string> = {
  'IMF.NGDPD': 'gdp', 'IMF.NGDP_RPCH': 'gdp-growth', 'IMF.NGDPDPC': 'gdp-per-capita',
  'IMF.PPPGDP': 'gdp-ppp', 'IMF.PPPPC': 'gdp-per-capita-ppp', 'IMF.PCPIPCH': 'inflation-rate',
  'IMF.LUR': 'unemployment-rate', 'IMF.GGXWDG_NGDP': 'government-debt',
  'IMF.BCA_NGDPD': 'current-account', 'SP.POP.TOTL': 'population',
  'SP.POP.GROW': 'population-growth', 'SP.DYN.LE00.IN': 'life-expectancy',
  'SP.DYN.TFRT.IN': 'fertility-rate', 'EN.ATM.CO2E.PC': 'co2-emissions',
  'IT.NET.USER.ZS': 'internet-users', 'SH.XPD.CHEX.GD.ZS': 'health-spending',
  'SE.XPD.TOTL.GD.ZS': 'education-spending', 'MS.MIL.XPND.GD.ZS': 'military-spending',
  'NE.TRD.GNFS.ZS': 'trade-openness', 'BX.KLT.DINV.WD.GD.ZS': 'fdi-inflows',
  'SI.POV.GINI': 'gini-index', 'SI.POV.DDAY': 'poverty-rate',
  'SH.DYN.MORT': 'infant-mortality', 'SP.URB.TOTL.IN.ZS': 'urban-population',
  'EG.FEC.RNEW.ZS': 'renewable-energy', 'AG.LND.FRST.ZS': 'forest-area',
  'CC.EST': 'corruption-control', 'RL.EST': 'rule-of-law', 'ST.INT.ARVL': 'tourism-arrivals',
  'IS.AIR.PSGR': 'air-passengers', 'IS.AIR.GOOD.MT.K1': 'air-freight',
  'NY.GNP.MKTP.CD': 'gni', 'NY.GNP.PCAP.CD': 'gni-per-capita',
  'VC.IHR.PSRC.P5': 'homicide-rate', 'SP.POP.DPND.YG': 'youth-dependency-ratio',
  'RL.PER.RNK': 'rule-of-law-percentile', 'NE.IMP.GNFS.CD': 'imports',
  'NE.CON.PRVT.ZS': 'household-consumption', 'WHO.ROAD_DEATHS': 'road-traffic-deaths',
  'SP.POP.0014.TO.ZS': 'population-under-15', 'GB.XPD.RSDV.GD.ZS': 'rd-spending',
  'SP.POP.65UP.TO.ZS': 'population-over-65', 'SL.UEM.1524.ZS': 'youth-unemployment',
  'SH.STA.SUIC.P5': 'suicide-rate', 'SM.POP.NETM': 'net-migration',
  'GC.TAX.TOTL.GD.ZS': 'tax-revenue',
};

// Top comparison pairs by country for cross-linking
const COMPARISON_MAP: Record<string, string[]> = {
  USA: ['united-states-vs-china', 'united-states-vs-japan', 'united-states-vs-germany', 'united-states-vs-india'],
  CHN: ['united-states-vs-china', 'china-vs-india', 'china-vs-japan', 'china-vs-russia'],
  JPN: ['united-states-vs-japan', 'japan-vs-germany', 'japan-vs-south-korea', 'china-vs-japan'],
  DEU: ['united-states-vs-germany', 'germany-vs-france', 'germany-vs-united-kingdom', 'japan-vs-germany'],
  GBR: ['united-states-vs-united-kingdom', 'germany-vs-united-kingdom', 'united-kingdom-vs-france', 'united-kingdom-vs-canada'],
  IND: ['united-states-vs-india', 'china-vs-india', 'india-vs-brazil', 'india-vs-pakistan'],
  FRA: ['united-states-vs-france', 'germany-vs-france', 'france-vs-italy', 'united-kingdom-vs-france'],
  BRA: ['united-states-vs-brazil', 'india-vs-brazil', 'brazil-vs-mexico', 'brazil-vs-argentina'],
  CAN: ['united-states-vs-canada', 'united-kingdom-vs-canada', 'canada-vs-australia', 'canada-vs-mexico'],
  AUS: ['united-states-vs-australia', 'canada-vs-australia', 'australia-vs-new-zealand', 'south-korea-vs-australia'],
  RUS: ['united-states-vs-russia', 'china-vs-russia', 'russia-vs-india', 'russia-vs-brazil'],
  KOR: ['united-states-vs-south-korea', 'south-korea-vs-japan', 'south-korea-vs-australia'],
  MEX: ['united-states-vs-mexico', 'brazil-vs-mexico', 'canada-vs-mexico', 'turkey-vs-mexico'],
  ITA: ['germany-vs-italy', 'france-vs-italy', 'italy-vs-spain', 'italy-vs-netherlands'],
  ESP: ['france-vs-spain', 'italy-vs-spain'],
  IDN: ['india-vs-indonesia'],
  TUR: ['turkey-vs-mexico', 'turkey-vs-brazil'],
  SAU: ['saudi-arabia-vs-uae', 'saudi-arabia-vs-iran'],
  NGA: ['nigeria-vs-south-africa', 'nigeria-vs-kenya'],
  SGP: ['singapore-vs-switzerland'],
  ARG: ['brazil-vs-argentina'],
  ZAF: ['nigeria-vs-south-africa'],
};

function getSeoTitle(country: { name: string; id: string }, ind: { id: string; label: string }, valueStr: string, latestYear: string | number) {
  const seoLabel = SEO_LABELS[ind.id] || ind.label;
  const countryName = country.id === 'WLD' ? 'Global' : country.name;
  return `${countryName} ${seoLabel}: ${valueStr} (${latestYear})`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId, indicator: rawIndicator } = await params;
  const id = resolveCountryId(rawId);
  const indicatorId = resolveIndicatorId(rawIndicator);
  const country = await getCountry(id);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!country || !ind) return { title: 'Not Found' };

  const history = await getHistoricalData(indicatorId, id);
  const latest = history.filter(d => d.value !== null).at(-1);
  const valueStr = latest ? formatValue(latest.value, ind.format, ind.decimals) : 'N/A';

  const validData = history.filter(d => d.value !== null);
  const years = validData.length;
  const source = ind.source === 'imf' ? 'IMF' : 'World Bank';
  const firstYear = history[0]?.year || '2000';
  const latestYear = latest?.year || 'present';

  // noindex pages with no data or very thin data — saves crawl budget
  if (years === 0) {
    const seoLabel = SEO_LABELS[ind.id] || ind.label;
    const countryName = id === 'WLD' ? 'Global' : country.name;
    return {
      title: `${countryName} ${seoLabel} — No Data Available | Statistics of the World`,
      robots: { index: false, follow: true },
    };
  }

  const seoLabel = SEO_LABELS[ind.id] || ind.label;
  const countryName = id === 'WLD' ? 'Global' : country.name;

  // Fetch global ranking for richer metadata
  const allCountries = await getIndicatorForAllCountries(indicatorId);
  const globalRank = allCountries.findIndex(c => c.countryId === id) + 1;
  const totalCountries = allCountries.length;

  // Title with value + rank when available
  const rankSuffix = globalRank > 0 ? ` — Ranked #${globalRank} of ${totalCountries}` : '';
  const title = `${countryName} ${seoLabel}: ${valueStr} (${latestYear})${rankSuffix}`;

  // Description that leads with the hook, adds trend context
  const firstVal = validData[0];
  const trendStr = firstVal && latest && firstVal.value !== null && latest.value !== null
    ? (latest.value > firstVal.value ? 'up' : latest.value < firstVal.value ? 'down' : 'unchanged')
    : null;
  const trendClause = trendStr && firstVal ? `, ${trendStr} from ${formatValue(firstVal.value, ind.format, ind.decimals)} in ${firstVal.year}` : '';

  const description = globalRank > 0
    ? `${countryName}'s ${seoLabel.toLowerCase()} is ${valueStr} (${latestYear}), ranking #${globalRank} of ${totalCountries} countries${trendClause}. ${years}yr history with charts & comparisons.`
    : `${countryName}'s ${seoLabel.toLowerCase()} is ${valueStr} in ${latestYear}${trendClause}. ${years} years of data with charts, rankings & country comparisons.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://statisticsoftheworld.com${getCleanCountryIndicatorUrl(id, indicatorId)}`,
    },
    ...(years < 3 ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      siteName: 'Statistics of the World',
    },
  };
}

// Map futures/alternative IDs to their canonical indicator IDs
const ID_ALIASES: Record<string, string> = {
  'YF.FUT.SP500': 'YF.IDX.USA',
  'YF.FUT.NASDAQ': 'YF.IDX.USA',
  'YF.FUT.DOW': 'YF.IDX.USA',
  'YF.FUT.RUSSELL': 'YF.IDX.USA',
};

export default async function IndicatorDetailPage({ params }: Props) {
  const { id: rawCountryId, indicator: rawIndicator } = await params;
  const id = resolveCountryId(rawCountryId);
  const rawId = resolveIndicatorId(rawIndicator);
  const indicatorId = ID_ALIASES[rawId] || rawId;

  // 301 redirect old encoded URLs to clean slug URLs
  const cleanUrl = getCleanCountryIndicatorUrl(id, indicatorId);
  const currentPath = `/country/${rawCountryId}/${rawIndicator}`;
  if (cleanUrl !== currentPath && (isIso3(rawCountryId) || rawIndicator.includes('.'))) {
    permanentRedirect(cleanUrl);
  }

  const country = await getCountry(id);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!country || !ind) notFound();

  const [history, stats, yoy, allCountries, meta] = await Promise.all([
    getHistoricalData(indicatorId, id),
    getHistoricalStats(indicatorId, id),
    getYoYChange(indicatorId, id),
    getIndicatorForAllCountries(indicatorId),
    getIndicatorMeta(indicatorId),
  ]);

  const validHistory = history.filter(d => d.value !== null);

  // Show a "no data" page instead of 404 — keeps users on the site and avoids
  // Google crawl errors for valid country/indicator combos that lack data
  if (validHistory.length === 0) {
    const seoLabel = SEO_LABELS[indicatorId] || ind.label;
    const countryName = id === 'WLD' ? 'Global' : country.name;
    return (
      <main className="min-h-screen">
        <Nav />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Flag iso2={country.iso2} name={country.name} size={48} />
          <h1 className="text-2xl font-bold mt-4 mb-2">{countryName} — {seoLabel}</h1>
          <p className="text-gray-500 mb-8">
            No data is currently available for {seoLabel.toLowerCase()} in {countryName}.
            This indicator may not be tracked for this country by the IMF or World Bank.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`${getCleanCountryUrl(id)}`} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              View {countryName} Profile
            </Link>
            <Link href="/indicators" className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Browse All Indicators
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const globalRank = allCountries.findIndex(c => c.countryId === id) + 1;
  const totalCountries = allCountries.length;

  // Peer countries (same region, top 5)
  const peers = allCountries
    .filter(c => c.countryId !== id)
    .slice(0, 5);

  const sourceName = ind.source === 'imf' ? 'IMF World Economic Outlook'
    : ind.id.startsWith('UN.') ? 'United Nations'
    : 'World Bank World Development Indicators';

  // IMF indicators include forecast data (current year + future years)
  const currentYear = new Date().getFullYear();
  const isIMF = indicatorId.startsWith('IMF.');
  const forecastStartYear = isIMF ? currentYear : undefined;
  const forecastData = isIMF
    ? validHistory.filter(d => d.year >= currentYear)
    : [];
  const actualData = isIMF
    ? validHistory.filter(d => d.year < currentYear)
    : validHistory;

  const seoLabel = SEO_LABELS[indicatorId] || ind.label;
  const latestVal = validHistory.length > 0 ? validHistory[validHistory.length - 1] : null;
  const latestValueStr = latestVal ? formatValue(latestVal.value, ind.format, ind.decimals) : null;

  const sourceUrl = ind.source === 'imf'
    ? 'https://www.imf.org/en/Publications/WEO'
    : indicatorId.startsWith('WHO.') ? 'https://www.who.int/data/gho'
    : indicatorId.startsWith('UN.') ? 'https://unstats.un.org/UNSDWebsite/'
    : `https://data.worldbank.org/indicator/${indicatorId}`;

  const sourceShort = ind.source === 'imf' ? 'IMF WEO'
    : indicatorId.startsWith('WHO.') ? 'WHO GHO'
    : indicatorId.startsWith('UN.') ? 'UN'
    : 'World Bank WDI';

  // Build Dataset description — Google requires 50–5000 chars
  let datasetDesc = `Historical ${seoLabel.toLowerCase()} data for ${country.name}, covering ${validHistory.length} years from ${validHistory[0]?.year} to ${validHistory[validHistory.length - 1]?.year}. ${latestVal ? `Latest value: ${latestValueStr} (${latestVal.year}).` : ''} ${globalRank > 0 ? `Ranked #${globalRank} out of ${totalCountries} countries globally.` : ''} Source: ${sourceName}. Free to access via API at statisticsoftheworld.com.`;
  // Pad short descriptions to meet Google's 50-char minimum
  if (datasetDesc.length < 50) {
    datasetDesc += ` This dataset tracks ${seoLabel.toLowerCase()} over time for ${country.name}, sourced from ${sourceName}.`;
  }
  // Truncate overly long descriptions to stay under 5000 chars
  if (datasetDesc.length > 5000) {
    datasetDesc = datasetDesc.slice(0, 4997) + '...';
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        name: `${country.name} ${seoLabel} — Historical Data`,
        description: datasetDesc,
        url: `https://statisticsoftheworld.com${getCleanCountryIndicatorUrl(id, indicatorId)}`,
        identifier: indicatorId,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        creator: { '@type': 'Organization', name: sourceName, url: sourceUrl },
        provider: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        temporalCoverage: `${validHistory[0]?.year}/${validHistory[validHistory.length - 1]?.year}`,
        spatialCoverage: { '@type': 'Place', name: country.name },
        variableMeasured: {
          '@type': 'PropertyValue',
          name: seoLabel,
          unitText: meta?.unit || undefined,
        },
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `https://statisticsoftheworld.com/api/v2/history?indicator=${encodeURIComponent(indicatorId)}&country=${id}`,
        },
        keywords: [seoLabel, country.name, sourceShort, 'economic data', 'statistics', ind.category].filter(Boolean),
        dateModified: new Date().toISOString().split('T')[0],
      },
      ...(latestVal && globalRank > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${country.name}'s ${seoLabel.toLowerCase()} in ${latestVal.year}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${country.name}'s ${seoLabel.toLowerCase()} was ${latestValueStr} in ${latestVal.year}, ranking #${globalRank} out of ${totalCountries} countries. Source: ${sourceName}.`,
            },
          },
          {
            '@type': 'Question',
            name: `How does ${country.name}'s ${seoLabel.toLowerCase()} compare globally?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${country.name} ranks #${globalRank} out of ${totalCountries} countries for ${seoLabel.toLowerCase()}. The data covers ${validHistory.length} years from ${validHistory[0]?.year} to ${validHistory[validHistory.length - 1]?.year}. Source: ${sourceName}.`,
            },
          },
        ],
      }] : []),
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
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/countries" className="hover:text-gray-600 transition">Countries</Link>
          <span className="mx-2">/</span>
          <Link href={getCleanCountryUrl(id)} className="hover:text-gray-600 transition">{country.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{ind.label}</span>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Flag iso2={country.iso2} size={40} />
            <span>{country.name}</span>
            <span className="text-gray-400 font-normal">—</span>
            <span>{ind.label}</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>Category: {ind.category}</span>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
              Source: {sourceName} ↗
            </a>
            {globalRank > 0 && <span>Global Rank: #{globalRank} of {totalCountries}</span>}
            <span>Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Summary stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {validHistory.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Latest Value</div>
              <div className="text-xl font-bold text-blue-600">
                {formatValue(validHistory[validHistory.length - 1].value, ind.format, ind.decimals)}
              </div>
              <div className="text-xs text-gray-400">{validHistory[validHistory.length - 1].year}</div>
            </div>
          )}
          {yoy && yoy.changePercent !== null && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">YoY Change</div>
              <div className={`text-xl font-bold ${yoy.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yoy.changePercent >= 0 ? '+' : ''}{yoy.changePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">{yoy.previousYear} → {yoy.currentYear}</div>
            </div>
          )}
          {globalRank > 0 && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Global Rank</div>
              <div className="text-xl font-bold text-gray-900">#{globalRank}</div>
              <div className="text-xs text-gray-400">of {totalCountries} countries</div>
            </div>
          )}
          {stats && (
            <>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Maximum</div>
                <div className="text-lg font-bold text-gray-900">{formatValue(stats.max, ind.format, ind.decimals)}</div>
                <div className="text-xs text-gray-400">{stats.maxYear}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Minimum</div>
                <div className="text-lg font-bold text-gray-900">{formatValue(stats.min, ind.format, ind.decimals)}</div>
                <div className="text-xs text-gray-400">{stats.minYear}</div>
              </div>
              {stats.cagr !== null && (
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">CAGR</div>
                  <div className={`text-xl font-bold ${stats.cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.cagr >= 0 ? '+' : ''}{stats.cagr.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">{stats.dataPoints} years</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats row (TE style) */}
        {stats && (
          <div className="mb-6">
            <StatsRow
              last={validHistory.length > 0 ? validHistory[validHistory.length - 1].value : null}
              previous={yoy?.previousValue ?? null}
              highest={stats.max}
              lowest={stats.min}
              format={ind.format}
              decimals={ind.decimals}
              unit={meta?.unit || undefined}
              source={sourceName}
            />
          </div>
        )}

        {/* Server-rendered SEO summary — visible to Google crawlers */}
        {latestVal && (
          <p className="text-[14px] text-[#475569] leading-relaxed mb-6 max-w-[800px]">
            {country.name}&apos;s {seoLabel.toLowerCase()} was {latestValueStr} in {latestVal.year}
            {globalRank > 0 ? `, ranking #${globalRank} out of ${totalCountries} countries` : ''}.
            {yoy && yoy.changePercent !== null ? ` This represents a ${yoy.changePercent >= 0 ? '+' : ''}${yoy.changePercent.toFixed(1)}% change from ${yoy.previousYear}.` : ''}
            {stats ? ` Over the past ${stats.dataPoints} years, the highest recorded value was ${formatValue(stats.max, ind.format, ind.decimals)} (${stats.maxYear}) and the lowest was ${formatValue(stats.min, ind.format, ind.decimals)} (${stats.minYear}).` : ''}
            {' '}Data sourced from the {sourceName}.
          </p>
        )}

        {/* AI-generated context */}
        <IndicatorContext countryId={id} indicatorId={indicatorId} />

        {/* Chart */}
        <IndicatorDetailCharts
          history={validHistory as { year: number; value: number }[]}
          format={ind.format}
          decimals={ind.decimals}
          sourceName={sourceName}
          forecastStartYear={forecastStartYear}
          indicatorId={indicatorId}
          countryId={id}
        />

        {/* Historical data table */}
        {validHistory.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Historical Data</h2>
              <div className="flex items-center gap-3">
                <EmbedButton indicatorId={indicatorId} countryId={id} />
                <HistoryExportButton
                  countryName={country.name}
                  countryId={id}
                  indicatorLabel={ind.label}
                  indicatorId={indicatorId}
                  history={validHistory}
                />
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-5 py-2.5">Year</th>
                    <th className="px-5 py-2.5 text-right">Value</th>
                    <th className="px-5 py-2.5 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[...validHistory].reverse().map((d, i, arr) => {
                    const prev = arr[i + 1];
                    const change = prev && d.value !== null && prev.value !== null && prev.value !== 0
                      ? ((d.value - prev.value) / Math.abs(prev.value)) * 100
                      : null;
                    return (
                      <tr key={d.year} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-5 py-2.5 text-sm font-medium">{d.year}</td>
                        <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(d.value, ind.format, ind.decimals)}</td>
                        <td className="px-5 py-2.5 text-right text-sm">
                          {change !== null && (
                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IMF Forecast table */}
        {forecastData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">IMF Forecast</h2>
            <p className="text-[14px] text-[#64748b] mb-3">
              Projections from the IMF World Economic Outlook. These are staff estimates, not guarantees.
            </p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-[#fffbeb]">
                    <th className="px-5 py-2.5">Year</th>
                    <th className="px-5 py-2.5 text-right">Projected Value</th>
                    <th className="px-5 py-2.5 text-right">Change from Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((d, i) => {
                    const prev = i === 0
                      ? actualData[actualData.length - 1]
                      : forecastData[i - 1];
                    const change = prev && d.value !== null && prev.value !== null && prev.value !== 0
                      ? ((d.value - prev.value) / Math.abs(prev.value)) * 100
                      : null;
                    return (
                      <tr key={d.year} className="border-b border-gray-50 bg-[#fffdf5] hover:bg-[#fffbeb] transition">
                        <td className="px-5 py-2.5 text-sm font-medium">
                          {d.year}
                          <span className="ml-2 text-[14px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Forecast</span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(d.value, ind.format, ind.decimals)}</td>
                        <td className="px-5 py-2.5 text-right text-sm">
                          {change !== null && (
                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Peer comparison */}
        {peers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Top Countries — {ind.label}</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-5 py-2.5 w-8">#</th>
                    <th className="px-5 py-2.5">Country</th>
                    <th className="px-5 py-2.5 text-right">Value</th>
                    <th className="px-5 py-2.5 text-right">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show current country's row highlighted */}
                  {allCountries.slice(0, 10).map((c, i) => (
                    <tr
                      key={c.countryId}
                      className={`border-b border-gray-50 transition ${c.countryId === id ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-5 py-2.5 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-5 py-2.5 text-sm">
                        <Link href={getCleanCountryIndicatorUrl(c.countryId, indicatorId)} className="text-blue-600 hover:text-blue-800 transition">
                          {c.country}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono text-sm">{formatValue(c.value, ind.format, ind.decimals)}</td>
                      <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{c.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href={`/indicators?id=${encodeURIComponent(indicatorId)}`}
                className="block px-5 py-3 text-sm text-blue-600 hover:bg-gray-50 transition text-center border-t border-gray-100"
              >
                View all {totalCountries} countries →
              </Link>
            </div>
          </div>
        )}
        {/* Methodology & About */}
        {meta && (meta.description || meta.methodology) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">About This Indicator</h2>
            <div className="border border-gray-100 rounded-xl p-6 space-y-4">
              {meta.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Definition</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
                </div>
              )}
              {meta.methodology && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Methodology</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{meta.methodology}</p>
                </div>
              )}
              {meta.unit && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Unit</h3>
                  <p className="text-sm text-gray-600">{meta.unit}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-6 text-xs text-gray-400 pt-2 border-t border-gray-100">
                {meta.sourceName && <span>Source: {meta.sourceName}</span>}
                {meta.coverageStart && meta.coverageEnd && (
                  <span>Coverage: {meta.coverageStart}–{meta.coverageEnd}</span>
                )}
                {meta.sourceUrl && (
                  <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition">
                    View original source →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Cross-links for SEO — ranking pages, comparisons, related indicators */}
        <div className="mt-10 border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Explore More</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Link to ranking page if this indicator has one */}
            {RANKING_SLUGS[indicatorId] && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Rankings</h3>
                <Link href={`/ranking/${RANKING_SLUGS[indicatorId]}`} className="text-sm text-blue-600 hover:text-blue-800 transition block mb-1">
                  {seoLabel} by Country — Full Rankings →
                </Link>
              </div>
            )}

            {/* Country comparisons */}
            {COMPARISON_MAP[id] && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Compare</h3>
                {COMPARISON_MAP[id].slice(0, 3).map(slug => (
                  <Link key={slug} href={`/compare/${slug}`} className="text-sm text-blue-600 hover:text-blue-800 transition block mb-1">
                    {slug.split('-vs-').map(s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')).join(' vs ')} →
                  </Link>
                ))}
              </div>
            )}

            {/* Related indicators for this country */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{country.name} Data</h3>
              <Link href={getCleanCountryUrl(id)} className="text-sm text-blue-600 hover:text-blue-800 transition block mb-1">
                {country.name} — All Indicators →
              </Link>
              {indicatorId !== 'IMF.NGDPD' && (
                <Link href={getCleanCountryIndicatorUrl(id, 'IMF.NGDPD')} className="text-sm text-blue-600 hover:text-blue-800 transition block mb-1">
                  {country.name} GDP →
                </Link>
              )}
              {indicatorId !== 'SP.POP.TOTL' && (
                <Link href={getCleanCountryIndicatorUrl(id, 'SP.POP.TOTL')} className="text-sm text-blue-600 hover:text-blue-800 transition block mb-1">
                  {country.name} Population →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
