import Link from 'next/link';
import { getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCleanCountryIndicatorUrl } from '@/lib/country-slugs';

// Expert editorial content for top ranking pages — what FedPay does well
const EDITORIAL: Record<string, string[]> = {
  'gdp': [
    'Gross Domestic Product (GDP) measures the total monetary value of all goods and services produced within a country\'s borders in a given year. It is the single most widely used indicator of economic size and is published by the International Monetary Fund (IMF) in their World Economic Outlook, released biannually in April and October. The nominal GDP figures on this page are expressed in current US dollars — meaning they reflect both real output changes and exchange rate movements against the dollar.',
    'The global economy is heavily concentrated: the United States and China together account for over 40% of world GDP, and the top 10 economies produce roughly two-thirds of all global output. This concentration has deepened over the past two decades as the US economy grew through technology-led productivity gains and China industrialized at an unprecedented pace. India, now the fourth or fifth largest economy depending on the data vintage, has emerged as the fastest-growing major economy.',
    'When comparing GDP across countries, it\'s important to understand what the number does and doesn\'t capture. Nominal GDP in US dollars is sensitive to exchange rate fluctuations — a country\'s GDP can shrink in dollar terms even if its domestic economy is growing, simply because its currency weakened. For a fairer cross-country comparison of living standards, economists prefer GDP per capita adjusted for purchasing power parity (PPP). GDP also does not measure wealth distribution, environmental sustainability, or quality of life — a country can have a high GDP while most citizens remain poor.',
  ],
  'population': [
    'Population figures represent the total number of people living within a country\'s borders as of mid-year, based on estimates from the World Bank using United Nations Population Division data. These figures include all residents regardless of citizenship status but exclude refugees not permanently settled. The data is revised annually as countries conduct censuses and update vital statistics.',
    'Global population crossed 8 billion in late 2022 and is projected to reach 8.5 billion by 2030. However, growth rates have slowed dramatically: the world population growth rate has fallen from over 2% in the 1960s to about 0.8% today. This deceleration is driven by falling fertility rates across virtually every region — even sub-Saharan Africa, the last region with high fertility, is now seeing declines. India overtook China as the most populous country in 2023, a milestone that reflects China\'s decades-old one-child policy and its lasting demographic consequences.',
    'Population size alone tells you little about a country\'s economic capacity or quality of life. Nigeria has a larger population than Germany but a fraction of its GDP. What matters for economic analysis is the interaction between population, age structure, and productivity. Countries with large working-age populations (the "demographic dividend") can grow faster if they can productively employ their youth — this is the opportunity facing India, Indonesia, and parts of Africa. Countries with aging populations (Japan, South Korea, much of Europe) face the opposite challenge: shrinking labor forces and rising dependency ratios.',
  ],
  'inflation-rate': [
    'Inflation rate measures the annual percentage change in consumer prices — how much more (or less) expensive a typical basket of goods and services has become compared to the previous year. The figures on this page come from the IMF\'s World Economic Outlook, which compiles consumer price index (CPI) data from national statistical agencies and produces projections for current and future years.',
    'After decades of low and stable inflation in advanced economies, the post-pandemic period brought a global inflation shock. Supply chain disruptions, energy price spikes driven by Russia\'s invasion of Ukraine, and the lingering effects of massive fiscal stimulus combined to push inflation to levels not seen since the 1970s in many countries. Central banks responded with aggressive interest rate hikes — the US Federal Reserve raised rates from near-zero to over 5% in 18 months, and the European Central Bank followed a similar trajectory.',
    'When comparing inflation across countries, context matters enormously. A 3% inflation rate in Switzerland represents a different economic reality than 3% in Turkey, because Switzerland is coming from a baseline of decades of price stability while Turkey has experienced chronic inflation. Similarly, headline inflation numbers can be misleading if driven by volatile food and energy prices — core inflation (excluding food and energy) is often a better guide to underlying price pressures. Countries with inflation consistently above 10% typically have structural fiscal or monetary policy problems that simple interest rate adjustments cannot fix.',
  ],
  'unemployment-rate': [
    'The unemployment rate measures the percentage of the labor force that is actively seeking work but unable to find it. It is perhaps the most politically sensitive economic indicator — high unemployment affects real people\'s lives in ways that abstract GDP numbers don\'t. The figures on this page come from the IMF, which harmonizes data from national labor force surveys to enable cross-country comparison.',
    'Unemployment rates vary enormously across countries, from below 2% in some East Asian and Gulf economies to over 25% in parts of Southern Africa and the Middle East. However, the headline number can be misleading. Countries with very low official unemployment may have high underemployment (people working part-time who want full-time work) or large informal sectors not captured in official statistics. Conversely, some countries with moderate unemployment rates have robust safety nets that allow people to search longer for suitable work rather than accepting the first available job.',
    'Youth unemployment — the unemployment rate for ages 15-24 — is typically two to three times higher than the overall rate, and is one of the most important indicators of social stability. Countries with very high youth unemployment (Southern Europe, North Africa, parts of the Middle East) face long-term risks: a generation that enters adulthood without stable employment develops fewer skills, earns less over their lifetime, and may become politically disaffected. The IMF tracks youth unemployment separately, and we provide dedicated rankings for it on this site.',
  ],
  'gdp-per-capita': [
    'GDP per capita divides a country\'s total GDP by its population, yielding a rough measure of average economic output per person. It is the most commonly used proxy for comparing living standards across countries, though it has significant limitations. The nominal GDP per capita figures on this page are in current US dollars and come from the IMF World Economic Outlook.',
    'The range in GDP per capita across countries is staggering: the richest countries (Luxembourg, Ireland, Switzerland, Norway) report figures above $80,000 per person, while the poorest (Burundi, South Sudan, Central African Republic) fall below $500. This 100x+ gap reflects not just differences in natural resources or geography, but accumulated differences in institutions, education, infrastructure, and governance built over decades or centuries.',
    'Two important caveats apply when interpreting these numbers. First, nominal GDP per capita is distorted by exchange rates and doesn\'t reflect local purchasing power — a salary of $10,000 goes much further in India than in Switzerland. For a fairer comparison, use GDP per capita in purchasing power parity (PPP) terms. Second, GDP per capita is an average, not a measure of how income is distributed. Qatar has one of the highest GDP per capita figures in the world, but most of that GDP accrues to a small citizen population while a large migrant labor force earns far less. The Gini index provides a complementary view of inequality within countries.',
  ],
  'life-expectancy': [
    'Life expectancy at birth estimates the average number of years a newborn would live if current mortality rates persisted throughout their lifetime. It is one of the most powerful single-number summaries of a country\'s health and development status. The data comes from the World Bank, which compiles mortality data from national vital registration systems, censuses, and WHO estimates.',
    'Global average life expectancy has increased dramatically over the past century — from about 47 years in 1950 to over 73 years today — driven primarily by reductions in infant and child mortality, control of infectious diseases, and improvements in nutrition and sanitation. However, the gap between countries remains enormous: life expectancy exceeds 84 years in Japan and Switzerland but falls below 55 in several sub-Saharan African countries.',
    'The COVID-19 pandemic caused the first significant global decline in life expectancy in decades, with particularly severe impacts in Latin America, South Asia, and parts of Eastern Europe. Most countries have since recovered to pre-pandemic levels, though some (notably the United States) have seen slower recovery. Beyond infectious disease, the main determinants of life expectancy differences between countries are access to healthcare, nutrition, environmental quality, and behavioral factors like smoking and alcohol consumption. Life expectancy data is particularly valuable when disaggregated by sex — women live longer than men in virtually every country, with the gap ranging from 2 to 10 years.',
  ],
};

// Slug → Indicator ID mapping for SEO-friendly URLs
const SLUG_MAP: Record<string, { id: string; title: string; description: string }> = {
  'gdp': { id: 'IMF.NGDPD', title: 'GDP by Country', description: 'Gross Domestic Product (nominal USD) rankings for all countries. Data from IMF World Economic Outlook.' },
  'gdp-growth': { id: 'IMF.NGDP_RPCH', title: 'GDP Growth Rate by Country', description: 'Real GDP growth rate (%) rankings. Annual percentage change in real GDP from IMF WEO.' },
  'gdp-per-capita': { id: 'IMF.NGDPDPC', title: 'GDP per Capita by Country', description: 'GDP per capita (current USD) rankings. A measure of economic output per person.' },
  'gdp-ppp': { id: 'IMF.PPPGDP', title: 'GDP (PPP) by Country', description: 'GDP adjusted for purchasing power parity (international dollars). Allows fairer cross-country comparison.' },
  'gdp-per-capita-ppp': { id: 'IMF.PPPPC', title: 'GDP per Capita (PPP) by Country', description: 'GDP per capita adjusted for purchasing power parity. Best measure of living standards.' },
  'inflation-rate': { id: 'IMF.PCPIPCH', title: 'Inflation Rate by Country', description: 'Consumer price inflation (annual %) for all countries. IMF WEO estimates and projections.' },
  'unemployment-rate': { id: 'IMF.LUR', title: 'Unemployment Rate by Country', description: 'Unemployment rate (%) rankings. Percentage of labor force that is unemployed, from IMF.' },
  'government-debt': { id: 'IMF.GGXWDG_NGDP', title: 'Government Debt to GDP by Country', description: 'General government gross debt as a percentage of GDP. Higher values indicate heavier debt burden.' },
  'current-account': { id: 'IMF.BCA_NGDPD', title: 'Current Account Balance by Country', description: 'Current account balance as percentage of GDP. Positive = surplus, negative = deficit.' },
  'population': { id: 'SP.POP.TOTL', title: 'Population by Country', description: 'Total population rankings for all countries. Data from World Bank.' },
  'population-growth': { id: 'SP.POP.GROW', title: 'Population Growth by Country', description: 'Annual population growth rate (%). Includes natural increase and net migration.' },
  'life-expectancy': { id: 'SP.DYN.LE00.IN', title: 'Life Expectancy by Country', description: 'Life expectancy at birth (years). A key measure of health and development.' },
  'fertility-rate': { id: 'SP.DYN.TFRT.IN', title: 'Fertility Rate by Country', description: 'Total fertility rate (births per woman). Below 2.1 indicates declining population without migration.' },
  'co2-emissions': { id: 'EN.ATM.CO2E.PC', title: 'CO₂ Emissions per Capita by Country', description: 'Carbon dioxide emissions per capita (metric tons). Key climate change indicator.' },
  'internet-users': { id: 'IT.NET.USER.ZS', title: 'Internet Users by Country', description: 'Percentage of population using the internet. Measure of digital connectivity.' },
  'health-spending': { id: 'SH.XPD.CHEX.GD.ZS', title: 'Health Spending (% of GDP) by Country', description: 'Current health expenditure as a share of GDP. Reflects national health investment priority.' },
  'education-spending': { id: 'SE.XPD.TOTL.GD.ZS', title: 'Education Spending (% of GDP) by Country', description: 'Government expenditure on education as a share of GDP.' },
  'military-spending': { id: 'MS.MIL.XPND.GD.ZS', title: 'Military Spending (% of GDP) by Country', description: 'Military expenditure as a percentage of GDP.' },
  'trade-openness': { id: 'NE.TRD.GNFS.ZS', title: 'Trade Openness by Country', description: 'Trade (exports + imports) as a percentage of GDP. Higher = more open economy.' },
  'fdi-inflows': { id: 'BX.KLT.DINV.WD.GD.ZS', title: 'FDI Inflows (% of GDP) by Country', description: 'Foreign direct investment net inflows as a share of GDP.' },
  'gini-index': { id: 'SI.POV.GINI', title: 'Gini Index (Inequality) by Country', description: 'Gini coefficient measuring income inequality. 0 = perfect equality, 100 = maximum inequality.' },
  'poverty-rate': { id: 'SI.POV.DDAY', title: 'Poverty Rate by Country', description: 'Population living on less than $2.15/day (%). International poverty line.' },
  'infant-mortality': { id: 'SH.DYN.MORT', title: 'Infant Mortality Rate by Country', description: 'Under-5 mortality rate per 1,000 live births. Key child health indicator.' },
  'urban-population': { id: 'SP.URB.TOTL.IN.ZS', title: 'Urban Population by Country', description: 'Share of population living in urban areas (%).' },
  'renewable-energy': { id: 'EG.FEC.RNEW.ZS', title: 'Renewable Energy by Country', description: 'Renewable energy consumption as a share of total energy consumption (%).' },
  'forest-area': { id: 'AG.LND.FRST.ZS', title: 'Forest Area by Country', description: 'Forest area as a percentage of total land area.' },
  'corruption-control': { id: 'CC.EST', title: 'Control of Corruption by Country', description: 'World Bank governance indicator measuring control of corruption (-2.5 to +2.5).' },
  'rule-of-law': { id: 'RL.EST', title: 'Rule of Law by Country', description: 'World Bank governance indicator measuring rule of law (-2.5 to +2.5).' },
  'tourism-arrivals': { id: 'ST.INT.ARVL', title: 'International Tourism Arrivals by Country', description: 'Number of international tourist arrivals per year.' },
  // High-traffic indicators from GSC data — adding dedicated ranking pages
  'air-passengers': { id: 'IS.AIR.PSGR', title: 'Air Passengers by Country', description: 'Total air transport passengers carried by country. Data from World Bank World Development Indicators.' },
  'air-freight': { id: 'IS.AIR.GOOD.MT.K1', title: 'Air Freight by Country', description: 'Air transport freight in million ton-km by country. Data from World Bank WDI.' },
  'gni': { id: 'NY.GNP.MKTP.CD', title: 'Gross National Income (GNI) by Country', description: 'Gross national income in current USD by country. Data from World Bank WDI.' },
  'gni-per-capita': { id: 'NY.GNP.PCAP.CD', title: 'GNI per Capita by Country', description: 'Gross national income per capita in current USD. Key measure of average income. Data from World Bank.' },
  'homicide-rate': { id: 'VC.IHR.PSRC.P5', title: 'Homicide Rate by Country', description: 'Intentional homicides per 100,000 people by country. Data from World Bank / UNODC.' },
  'youth-dependency-ratio': { id: 'SP.POP.DPND.YG', title: 'Youth Dependency Ratio by Country', description: 'Ratio of younger dependents (ages 0–14) to working-age population (15–64). Data from World Bank.' },
  'rule-of-law-percentile': { id: 'RL.PER.RNK', title: 'Rule of Law Ranking by Country', description: 'Rule of law percentile rank (0–100) from World Bank Worldwide Governance Indicators.' },
  'imports': { id: 'NE.IMP.GNFS.CD', title: 'Total Imports by Country', description: 'Imports of goods and services in current USD by country. Data from World Bank WDI.' },
  'household-consumption': { id: 'NE.CON.PRVT.ZS', title: 'Household Consumption (% of GDP) by Country', description: 'Household final consumption expenditure as a share of GDP. Data from World Bank.' },
  'road-traffic-deaths': { id: 'WHO.ROAD_DEATHS', title: 'Road Traffic Death Rate by Country', description: 'Estimated road traffic death rate per 100,000 population. Data from WHO Global Health Observatory.' },
  'population-under-15': { id: 'SP.POP.0014.TO.ZS', title: 'Population Under 15 by Country', description: 'Share of population ages 0–14 as percentage of total population. Data from World Bank.' },
  'rd-spending': { id: 'GB.XPD.RSDV.GD.ZS', title: 'R&D Spending (% of GDP) by Country', description: 'Research and development expenditure as a share of GDP. Key innovation indicator. Data from World Bank.' },
  'population-over-65': { id: 'SP.POP.65UP.TO.ZS', title: 'Population Over 65 by Country', description: 'Share of population ages 65 and above. Key aging indicator. Data from World Bank.' },
  'youth-unemployment': { id: 'SL.UEM.1524.ZS', title: 'Youth Unemployment Rate by Country', description: 'Unemployment rate for ages 15–24 (%). Data from World Bank / ILO.' },
  'suicide-rate': { id: 'SH.STA.SUIC.P5', title: 'Suicide Rate by Country', description: 'Suicide mortality rate per 100,000 population. Data from World Bank / WHO.' },
  'net-migration': { id: 'SM.POP.NETM', title: 'Net Migration by Country', description: 'Net migration (immigrants minus emigrants) over five-year periods. Data from World Bank / UN.' },
  'tax-revenue': { id: 'GC.TAX.TOTL.GD.ZS', title: 'Tax Revenue (% of GDP) by Country', description: 'Tax revenue as a share of GDP. Reflects government fiscal capacity. Data from World Bank.' },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) return { title: 'Not Found' };

  const ind = INDICATORS.find(i => i.id === config.id);
  const source = config.id.startsWith('IMF.') ? 'IMF World Economic Outlook'
    : config.id.startsWith('WHO.') ? 'WHO Global Health Observatory'
    : 'World Bank';

  return {
    title: `${config.title} (2026) — Ranked List of 218 Countries`,
    description: `${config.description} Ranked list of 218 countries with interactive charts and historical trends. Data from ${source}. Updated 2026.`,
    alternates: {
      canonical: `https://statisticsoftheworld.com/ranking/${slug}`,
    },
    openGraph: {
      title: `${config.title} (2026) — Ranked List of 218 Countries`,
      description: `${config.description} Compare 218 countries. Source: ${source}.`,
      siteName: 'Statistics of the World',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(SLUG_MAP).map(slug => ({ slug }));
}

export default async function RankingPage({ params }: Props) {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) notFound();

  const ind = INDICATORS.find(i => i.id === config.id);
  if (!ind) notFound();

  const data = await getIndicatorForAllCountries(config.id);

  // Find related rankings
  const related = Object.entries(SLUG_MAP)
    .filter(([s]) => s !== slug)
    .slice(0, 8);

  const top = data[0];
  const bottom = data[data.length - 1];
  const year = top?.year || 2026;
  const fmtTop = top ? formatValue(top.value, ind.format, ind.decimals) : '';
  const fmtBottom = bottom ? formatValue(bottom.value, ind.format, ind.decimals) : '';

  // Compute median
  const midIdx = Math.floor(data.length / 2);
  const median = data[midIdx];
  const fmtMedian = median ? formatValue(median.value, ind.format, ind.decimals) : '';

  // Build FAQ Q&A pairs from the real data
  const faqs = [
    {
      q: `Which country has the highest ${ind.label.toLowerCase()} in ${year}?`,
      a: top ? `${top.country} has the highest ${ind.label.toLowerCase()} at ${fmtTop} as of ${year}, according to ${ind.source === 'imf' ? 'IMF' : 'World Bank'} data.` : '',
    },
    {
      q: `Which country has the lowest ${ind.label.toLowerCase()} in ${year}?`,
      a: bottom ? `${bottom.country} has the lowest ${ind.label.toLowerCase()} at ${fmtBottom} as of ${year}.` : '',
    },
    {
      q: `How many countries are ranked by ${ind.label.toLowerCase()}?`,
      a: `${data.length} countries have reported data for ${ind.label.toLowerCase()}. The data is sourced from the ${ind.source === 'imf' ? 'IMF World Economic Outlook' : 'World Bank World Development Indicators'}.`,
    },
    {
      q: `What is the median ${ind.label.toLowerCase()} across all countries?`,
      a: median ? `The median ${ind.label.toLowerCase()} is ${fmtMedian} (${median.country}, ranked #${midIdx + 1} out of ${data.length} countries).` : '',
    },
  ].filter(f => f.a);

  // JSON-LD: ItemList + FAQPage + BreadcrumbList + Dataset
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `${config.title} (${year})`,
        description: `Ranked list of ${data.length} countries by ${ind.label.toLowerCase()}. Source: ${ind.source === 'imf' ? 'IMF' : ind.id.startsWith('WHO.') ? 'WHO' : 'World Bank'}.`,
        numberOfItems: data.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: data.slice(0, 20).map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: d.country,
          url: `https://statisticsoftheworld.com${getCleanCountryIndicatorUrl(d.countryId, config.id)}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Indicators', item: 'https://statisticsoftheworld.com/indicators' },
          { '@type': 'ListItem', position: 3, name: config.title, item: `https://statisticsoftheworld.com/ranking/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'Dataset',
        name: `${config.title} — ${year} Rankings`,
        description: `${config.description} Covers ${data.length} countries. Source: ${ind.source === 'imf' ? 'IMF World Economic Outlook' : ind.id.startsWith('WHO.') ? 'WHO Global Health Observatory' : 'World Bank World Development Indicators'}.`,
        url: `https://statisticsoftheworld.com/ranking/${slug}`,
        identifier: config.id,
        license: 'https://creativecommons.org/licenses/by/4.0/',
        temporalCoverage: `${year}`,
        spatialCoverage: { '@type': 'Place', name: 'World' },
        creator: {
          '@type': 'Organization',
          name: ind.source === 'imf' ? 'IMF' : ind.id.startsWith('WHO.') ? 'WHO' : 'World Bank',
          url: ind.source === 'imf' ? 'https://www.imf.org' : ind.id.startsWith('WHO.') ? 'https://www.who.int' : 'https://www.worldbank.org',
        },
        provider: { '@type': 'Organization', name: 'Statistics of the World', url: 'https://statisticsoftheworld.com' },
        isAccessibleForFree: true,
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `https://statisticsoftheworld.com/api/v2/indicator/${encodeURIComponent(config.id)}`,
        },
        keywords: [config.title, 'country rankings', ind.source === 'imf' ? 'IMF' : 'World Bank', 'economic data', `${year}`],
        dateModified: new Date().toISOString().split('T')[0],
      },
    ],
  };

  // Programmatic SEO summary paragraphs
  const top5 = data.slice(0, 5);
  const top10 = data.slice(0, 10);
  const bottom5 = data.slice(-5).reverse();
  const sourceFull = ind.source === 'imf' ? 'IMF World Economic Outlook' : ind.id.startsWith('WHO.') ? 'WHO Global Health Observatory' : 'World Bank World Development Indicators';

  const summaryParagraph = top && bottom ? (
    `In ${year}, ${top.country} leads the world in ${ind.label.toLowerCase()} with ${fmtTop}, ` +
    `followed by ${top5.slice(1, 5).map(d => `${d.country} (${formatValue(d.value, ind.format, ind.decimals)})`).join(', ')}. ` +
    `At the other end, ${bottom.country} ranks last at ${fmtBottom}. ` +
    `The global median is ${fmtMedian} (${median?.country}). ` +
    `This ranking covers ${data.length} countries and is sourced from the ${sourceFull}, one of the most authoritative sources for international economic statistics.`
  ) : '';

  // Second paragraph with distribution context
  const top10Share = ind.format === 'currency' && top10.length > 0
    ? top10.reduce((sum, d) => sum + (d.value || 0), 0)
    : null;
  const totalValue = ind.format === 'currency'
    ? data.reduce((sum, d) => sum + (d.value || 0), 0)
    : null;
  const contextParagraph = top10Share && totalValue && totalValue > 0
    ? `The top 10 countries account for ${((top10Share / totalValue) * 100).toFixed(0)}% of the global total. ` +
      `The top 10 are: ${top10.map((d, i) => `${i + 1}. ${d.country}`).join(', ')}. ` +
      `All data on this page is free to use with attribution. An API endpoint is available at /api/v2/indicator/${encodeURIComponent(config.id)} for programmatic access.`
    : `The top 10 countries are: ${top10.map((d, i) => `${i + 1}. ${d.country}`).join(', ')}. ` +
      `All data is sourced from the ${sourceFull} and updated regularly. Free API access is available for developers and researchers.`;

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/indicators" className="hover:text-gray-600 transition">Indicators</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{config.title}</span>
        </nav>

        <h1 className="text-[28px] font-bold mb-2">{config.title} — {year} World Rankings</h1>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <p className="text-[14px] text-[#64748b] leading-relaxed max-w-[700px]">{config.description}</p>
          <span className="text-[12px] text-[#94a3b8] bg-[#f1f5f9] px-2.5 py-1 rounded-full whitespace-nowrap">
            Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · Source: {ind.source === 'imf' ? 'IMF' : ind.id.startsWith('WHO.') ? 'WHO' : 'World Bank'}
          </span>
        </div>

        {/* SEO summary paragraphs */}
        {summaryParagraph && (
          <div className="mb-6 max-w-[800px] space-y-3">
            <p className="text-[14px] text-[#475569] leading-relaxed">
              {summaryParagraph}
            </p>
            <p className="text-[14px] text-[#64748b] leading-relaxed">
              {contextParagraph}
            </p>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-[15px] text-gray-400 mb-1">Countries</div>
            <div className="text-[20px] font-bold">{data.length}</div>
          </div>
          {data.length > 0 && (
            <>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Highest</div>
                <div className="text-[16px] font-bold text-green-600">{fmtTop}</div>
                <div className="text-[15px] text-gray-400">{top.country}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Lowest</div>
                <div className="text-[16px] font-bold text-red-500">{fmtBottom}</div>
                <div className="text-[15px] text-gray-400">{bottom.country}</div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-[15px] text-gray-400 mb-1">Latest Year</div>
                <div className="text-[20px] font-bold">{year}</div>
              </div>
            </>
          )}
        </div>

        {/* Rankings table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <caption className="sr-only">{config.title} — {data.length} countries ranked by {ind.label.toLowerCase()} ({year}). Source: {ind.source === 'imf' ? 'IMF' : ind.source === 'who' ? 'WHO' : 'World Bank'}.</caption>
            <thead>
              <tr className="text-left text-[15px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th scope="col" className="px-4 py-2.5 w-12">#</th>
                <th scope="col" className="px-4 py-2.5">Country</th>
                <th scope="col" className="px-4 py-2.5 text-right">{ind.label}</th>
                <th className="px-4 py-2.5 w-48 hidden md:table-cell"></th>
                <th className="px-4 py-2.5 text-right w-16">Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const maxVal = Math.max(...data.map(d => Math.abs(d.value || 0)));
                const barWidth = maxVal > 0 ? (Math.abs(entry.value || 0) / maxVal) * 100 : 0;
                return (
                  <tr key={entry.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-gray-300 text-[15px]">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link href={getCleanCountryIndicatorUrl(entry.countryId, config.id)} className="inline-flex items-center gap-2 text-[15px] text-blue-600 hover:text-blue-800">
                        <Flag iso2={entry.iso2} size={20} />
                        {entry.country}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[15px]">
                      {formatValue(entry.value, ind.format, ind.decimals)}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${barWidth}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400 text-[14px]">{entry.year}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expert editorial content — the FedPay pattern */}
        {EDITORIAL[slug] && (
          <div className="mb-10">
            <h2 className="text-[20px] font-bold mb-4 text-[#0d1b2a]">Understanding {config.title}</h2>
            <div className="space-y-4 max-w-[800px]">
              {EDITORIAL[slug].map((p, i) => (
                <p key={i} className="text-[15px] text-[#374151] leading-[1.8]">{p}</p>
              ))}
            </div>
          </div>
        )}

        {/* FAQ section — visible to users AND crawlers */}
        {faqs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[18px] font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="border border-gray-100 rounded-xl" open={i === 0}>
                  <summary className="px-4 py-3 cursor-pointer text-[15px] font-medium hover:bg-gray-50 transition">
                    {faq.q}
                  </summary>
                  <p className="px-4 pb-3 text-[14px] text-[#475569] leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related rankings */}
        <div>
          <h2 className="text-[16px] font-semibold mb-3">Related Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {related.map(([s, cfg]) => (
              <Link
                key={s}
                href={`/ranking/${s}`}
                className="text-[14px] px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-[#64748b]"
              >
                {cfg.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Related blog articles — cross-link for SEO */}
        {(() => {
          const relatedBlogs = BLOG_POSTS.filter(p => p.indicatorId === config.id).slice(0, 3);
          if (relatedBlogs.length === 0) return null;
          return (
            <div className="mt-6">
              <h2 className="text-[16px] font-semibold mb-3">Related Articles</h2>
              <div className="space-y-2">
                {relatedBlogs.map(bp => (
                  <Link key={bp.slug} href={`/blog/${bp.slug}`} className="block text-[14px] text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition">
                    {bp.title} →
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      <Footer />
    </main>
  );
}
