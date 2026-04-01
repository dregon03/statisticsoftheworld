import type { MetadataRoute } from 'next';
import { getCountries, INDICATORS } from '@/lib/data';

const BASE_URL = 'https://statisticsoftheworld.com';
const MAX_URLS_PER_SITEMAP = 45000; // Stay under Google's 50K limit

const RANKING_SLUGS = [
  'gdp', 'gdp-growth', 'gdp-per-capita', 'gdp-ppp', 'gdp-per-capita-ppp',
  'inflation-rate', 'unemployment-rate', 'government-debt', 'current-account',
  'population', 'population-growth', 'life-expectancy', 'fertility-rate',
  'co2-emissions', 'internet-users', 'health-spending', 'education-spending',
  'military-spending', 'trade-openness', 'fdi-inflows', 'gini-index',
  'poverty-rate', 'infant-mortality', 'urban-population', 'renewable-energy',
  'forest-area', 'corruption-control', 'rule-of-law', 'tourism-arrivals',
];

const CHART_COUNTRIES = ['united-states', 'china', 'japan', 'germany', 'united-kingdom', 'france', 'india', 'brazil', 'canada', 'australia', 'south-korea', 'mexico', 'russia', 'italy', 'spain', 'indonesia', 'netherlands', 'turkey', 'switzerland', 'saudi-arabia', 'argentina', 'south-africa', 'nigeria', 'singapore', 'israel', 'norway', 'sweden', 'egypt', 'world'];
const CHART_SLUGS = ['gdp', 'gdp-growth', 'gdp-per-capita', 'inflation-rate', 'unemployment-rate', 'population', 'life-expectancy', 'co2-emissions', 'government-debt', 'trade-openness', 'health-spending', 'military-spending', 'gini-index', 'renewable-energy', 'internet-users', 'fertility-rate', 'current-account', 'fdi-inflows', 'infant-mortality', 'urban-population'];

export async function generateSitemaps() {
  const countries = await getCountries();
  const totalIndicatorPages = countries.length * INDICATORS.length;
  const staticCount = 20 + RANKING_SLUGS.length + countries.length + (CHART_COUNTRIES.length * CHART_SLUGS.length) + INDICATORS.length;
  const totalUrls = staticCount + totalIndicatorPages;
  const numSitemaps = Math.ceil(totalUrls / MAX_URLS_PER_SITEMAP);
  return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const countries = await getCountries();

  // Build all URLs in order: static, countries, charts, maps, then country-indicator pages
  const allUrls: MetadataRoute.Sitemap = [];

  // 1. Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/indicators`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/scatter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/regions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/markets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/commodities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/heatmap`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/calendar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/forecasts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/trade`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/credit-ratings`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/api-docs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/predictions`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/ai`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ...RANKING_SLUGS.map(slug => ({
      url: `${BASE_URL}/ranking/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
  allUrls.push(...staticPages);

  // 2. Country pages
  for (const c of countries) {
    allUrls.push({
      url: `${BASE_URL}/country/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    });
  }

  // 3. Chart pages
  for (const c of CHART_COUNTRIES) {
    for (const s of CHART_SLUGS) {
      allUrls.push({
        url: `${BASE_URL}/chart/${c}/${s}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  // 4. Map pages per indicator
  for (const ind of INDICATORS) {
    allUrls.push({
      url: `${BASE_URL}/map?id=${encodeURIComponent(ind.id)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    });
  }

  // 5. Country-indicator detail pages (the bulk — ~96K URLs)
  for (const country of countries) {
    for (const ind of INDICATORS) {
      allUrls.push({
        url: `${BASE_URL}/country/${country.id}/${encodeURIComponent(ind.id)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  // Slice for this sitemap chunk
  const start = id * MAX_URLS_PER_SITEMAP;
  const end = start + MAX_URLS_PER_SITEMAP;
  return allUrls.slice(start, end);
}
