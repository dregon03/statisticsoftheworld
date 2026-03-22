import type { MetadataRoute } from 'next';
import { getCountries, INDICATORS } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countries = await getCountries();
  const baseUrl = 'https://statisticsoftheworld.com';

  const RANKING_SLUGS = [
    'gdp', 'gdp-growth', 'gdp-per-capita', 'gdp-ppp', 'gdp-per-capita-ppp',
    'inflation-rate', 'unemployment-rate', 'government-debt', 'current-account',
    'population', 'population-growth', 'life-expectancy', 'fertility-rate',
    'co2-emissions', 'internet-users', 'health-spending', 'education-spending',
    'military-spending', 'trade-openness', 'fdi-inflows', 'gini-index',
    'poverty-rate', 'infant-mortality', 'urban-population', 'renewable-energy',
    'forest-area', 'corruption-control', 'rule-of-law', 'tourism-arrivals',
  ];

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/indicators`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/scatter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/regions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/markets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/commodities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/heatmap`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/forecasts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/trade`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/credit-ratings`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/api-docs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/ai`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    // SEO ranking pages
    ...RANKING_SLUGS.map(slug => ({
      url: `${baseUrl}/ranking/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${baseUrl}/country/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Historical chart pages (SEO-friendly URLs like /chart/united-states/gdp-growth)
  const CHART_COUNTRIES = ['united-states', 'china', 'japan', 'germany', 'united-kingdom', 'france', 'india', 'brazil', 'canada', 'australia', 'south-korea', 'mexico', 'russia', 'italy', 'spain', 'indonesia', 'netherlands', 'turkey', 'switzerland', 'saudi-arabia', 'argentina', 'south-africa', 'nigeria', 'singapore', 'israel', 'norway', 'sweden', 'egypt', 'world'];
  const CHART_SLUGS = ['gdp', 'gdp-growth', 'gdp-per-capita', 'inflation-rate', 'unemployment-rate', 'population', 'life-expectancy', 'co2-emissions', 'government-debt', 'trade-openness', 'health-spending', 'military-spending', 'gini-index', 'renewable-energy', 'internet-users', 'fertility-rate', 'current-account', 'fdi-inflows', 'infant-mortality', 'urban-population'];
  const chartPages: MetadataRoute.Sitemap = [];
  for (const c of CHART_COUNTRIES) {
    for (const s of CHART_SLUGS) {
      chartPages.push({
        url: `${baseUrl}/chart/${c}/${s}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  // Country-indicator detail pages (~62K URLs)
  const indicatorPages: MetadataRoute.Sitemap = [];
  for (const country of countries) {
    for (const ind of INDICATORS) {
      indicatorPages.push({
        url: `${baseUrl}/country/${country.id}/${encodeURIComponent(ind.id)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  // Map pages per indicator (for SEO — "GDP world map", etc.)
  const mapPages: MetadataRoute.Sitemap = INDICATORS.map(ind => ({
    url: `${baseUrl}/map?id=${encodeURIComponent(ind.id)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...countryPages, ...chartPages, ...mapPages, ...indicatorPages];
}
