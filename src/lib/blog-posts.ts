/** Programmatic blog post definitions — auto-generated from live data */

export interface BlogPostDef {
  slug: string;
  title: string;
  description: string;
  indicatorId: string;
  count: number;         // top N countries to feature
  direction: 'top' | 'bottom';
  intro: string;         // template — {year}, {count}, {#1}, {#1_value}, etc. filled at render
  category: string;
}

export const BLOG_POSTS: BlogPostDef[] = [
  {
    slug: 'richest-countries-in-the-world',
    title: 'Richest Countries in the World by GDP',
    description: 'The top 25 richest countries in the world ranked by GDP (nominal USD). Updated with the latest IMF data.',
    indicatorId: 'IMF.NGDPD',
    count: 25,
    direction: 'top',
    intro: 'The global economy in {year} is dominated by a handful of powerhouses. Here are the {count} richest countries in the world by gross domestic product (nominal USD), based on IMF World Economic Outlook data.',
    category: 'Economy',
  },
  {
    slug: 'highest-gdp-per-capita',
    title: 'Countries with the Highest GDP per Capita',
    description: 'Top 25 countries ranked by GDP per capita (nominal USD). A measure of individual economic output and wealth.',
    indicatorId: 'IMF.NGDPDPC',
    count: 25,
    direction: 'top',
    intro: 'GDP per capita is one of the best proxies for individual economic output and living standards. Here are the {count} countries with the highest GDP per capita in {year}.',
    category: 'Economy',
  },
  {
    slug: 'countries-with-highest-inflation',
    title: 'Countries with the Highest Inflation Rates',
    description: 'Top 25 countries with the highest consumer price inflation. Hyperinflation, causes, and trends.',
    indicatorId: 'IMF.PCPIPCH',
    count: 25,
    direction: 'top',
    intro: 'Inflation erodes purchasing power and can destabilize economies. Here are the {count} countries with the highest inflation rates in {year}, based on IMF consumer price data.',
    category: 'Economy',
  },
  {
    slug: 'most-populated-countries',
    title: 'Most Populated Countries in the World',
    description: 'The 25 most populated countries ranked by total population. Demographics, trends, and projections.',
    indicatorId: 'SP.POP.TOTL',
    count: 25,
    direction: 'top',
    intro: 'Over 8 billion people live on Earth. Here are the {count} most populated countries in {year}, together accounting for the vast majority of the global population.',
    category: 'Demographics',
  },
  {
    slug: 'highest-life-expectancy-countries',
    title: 'Countries with the Highest Life Expectancy',
    description: 'Top 25 countries where people live the longest. Life expectancy data from the World Bank.',
    indicatorId: 'SP.DYN.LE00.IN',
    count: 25,
    direction: 'top',
    intro: 'Life expectancy at birth is a key measure of population health and development. Here are the {count} countries where people live the longest in {year}.',
    category: 'Health',
  },
  {
    slug: 'lowest-life-expectancy-countries',
    title: 'Countries with the Lowest Life Expectancy',
    description: 'The 25 countries with the lowest life expectancy at birth. Health challenges and development gaps.',
    indicatorId: 'SP.DYN.LE00.IN',
    count: 25,
    direction: 'bottom',
    intro: 'Life expectancy remains starkly unequal across the world. These {count} countries face the greatest health and development challenges in {year}.',
    category: 'Health',
  },
  {
    slug: 'countries-with-highest-debt-to-gdp',
    title: 'Countries with the Highest Government Debt-to-GDP Ratio',
    description: 'Top 25 countries ranked by government gross debt as a percentage of GDP. Fiscal sustainability analysis.',
    indicatorId: 'IMF.GGXWDG_NGDP',
    count: 25,
    direction: 'top',
    intro: 'Government debt is a critical measure of fiscal health. Here are the {count} countries with the highest debt-to-GDP ratios in {year}, based on IMF data.',
    category: 'Economy',
  },
  {
    slug: 'fastest-growing-economies',
    title: 'Fastest Growing Economies in the World',
    description: 'Top 25 countries by real GDP growth rate. Emerging markets and economic expansion leaders.',
    indicatorId: 'IMF.NGDP_RPCH',
    count: 25,
    direction: 'top',
    intro: 'While advanced economies grow steadily, some nations are expanding at remarkable speed. Here are the {count} fastest-growing economies in {year}.',
    category: 'Economy',
  },
  {
    slug: 'countries-with-lowest-unemployment',
    title: 'Countries with the Lowest Unemployment Rates',
    description: 'Top 25 countries with the lowest unemployment. Full employment economies and labor market analysis.',
    indicatorId: 'IMF.LUR',
    count: 25,
    direction: 'bottom',
    intro: 'Low unemployment signals a healthy, productive economy. Here are the {count} countries with the lowest unemployment rates in {year}.',
    category: 'Economy',
  },
  {
    slug: 'countries-with-highest-unemployment',
    title: 'Countries with the Highest Unemployment Rates',
    description: 'The 25 countries with the highest unemployment rates. Labor market challenges worldwide.',
    indicatorId: 'IMF.LUR',
    count: 25,
    direction: 'top',
    intro: 'High unemployment reflects deep structural and economic challenges. These {count} countries have the highest unemployment rates in {year}.',
    category: 'Economy',
  },
  {
    slug: 'most-educated-countries',
    title: 'Most Educated Countries — Tertiary Enrollment Rates',
    description: 'Top 25 countries by tertiary education enrollment rate. Higher education access worldwide.',
    indicatorId: 'SE.TER.ENRR',
    count: 25,
    direction: 'top',
    intro: 'Access to higher education varies enormously. Here are the {count} countries with the highest tertiary enrollment rates in {year}.',
    category: 'Education',
  },
  {
    slug: 'countries-with-highest-military-spending',
    title: 'Countries with the Highest Military Spending',
    description: 'Top 25 countries by military expenditure as a percentage of GDP. Defense spending trends.',
    indicatorId: 'MS.MIL.XPND.GD.ZS',
    count: 25,
    direction: 'top',
    intro: 'Military spending reflects a nation\'s security priorities and geopolitical posture. Here are the {count} countries that spend the most on defense relative to GDP in {year}.',
    category: 'Governance',
  },
  {
    slug: 'most-corrupt-countries',
    title: 'Most and Least Corrupt Countries in the World',
    description: 'Country rankings by World Bank Control of Corruption indicator. Governance quality worldwide.',
    indicatorId: 'CC.EST',
    count: 25,
    direction: 'bottom',
    intro: 'Corruption undermines development, trust, and economic growth. Here are the {count} countries with the weakest corruption control in {year}, according to the World Bank Governance Indicators.',
    category: 'Governance',
  },
  {
    slug: 'countries-with-most-renewable-energy',
    title: 'Countries with the Most Renewable Energy',
    description: 'Top 25 countries by renewable energy consumption as a share of total energy. Green energy leaders.',
    indicatorId: 'EG.FEC.RNEW.ZS',
    count: 25,
    direction: 'top',
    intro: 'The transition to renewable energy is a defining challenge of our era. Here are the {count} countries leading the way in renewable energy consumption in {year}.',
    category: 'Environment',
  },
  {
    slug: 'countries-with-highest-co2-emissions',
    title: 'Countries with the Highest CO₂ Emissions per Capita',
    description: 'Top 25 countries ranked by carbon dioxide emissions per person. Climate change and emissions data.',
    indicatorId: 'EN.GHG.CO2.PC.CE.AR5',
    count: 25,
    direction: 'top',
    intro: 'Per capita CO₂ emissions reveal which countries contribute most to climate change relative to their population. Here are the {count} highest emitters in {year}.',
    category: 'Environment',
  },
];

export function getBlogPost(slug: string): BlogPostDef | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
