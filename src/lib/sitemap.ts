import type { MetadataRoute } from 'next';
import { getCountries } from '@/lib/data';
import { getAllIndicatorSlugs } from '@/lib/indicator-slugs';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { GLOSSARY_TERMS } from '@/lib/glossary';
import { getCleanCountryUrl, getCleanCountryIndicatorUrl, TOP_INDICATOR_SLUGS, getIndicatorFromSlug } from '@/lib/country-slugs';

export const BASE_URL = 'https://statisticsoftheworld.com';
export const MAX_URLS_PER_SITEMAP = 45000;

/** Escape XML special characters in URLs */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const RANKING_SLUGS = [
  'gdp', 'gdp-growth', 'gdp-per-capita', 'gdp-ppp', 'gdp-per-capita-ppp',
  'inflation-rate', 'unemployment-rate', 'government-debt', 'current-account',
  'population', 'population-growth', 'life-expectancy', 'fertility-rate',
  'co2-emissions', 'internet-users', 'health-spending', 'education-spending',
  'military-spending', 'trade-openness', 'fdi-inflows', 'gini-index',
  'poverty-rate', 'infant-mortality', 'urban-population', 'renewable-energy',
  'forest-area', 'corruption-control', 'rule-of-law', 'tourism-arrivals',
  // High-traffic indicators from GSC
  'air-passengers', 'air-freight', 'gni', 'gni-per-capita', 'homicide-rate',
  'youth-dependency-ratio', 'rule-of-law-percentile', 'imports',
  'household-consumption', 'road-traffic-deaths', 'population-under-15',
  'rd-spending', 'population-over-65', 'youth-unemployment', 'suicide-rate',
  'net-migration', 'tax-revenue',
];

const COMPARISON_PAIRS = [
  'united-states-vs-china', 'united-states-vs-japan', 'united-states-vs-germany',
  'united-states-vs-united-kingdom', 'united-states-vs-india', 'united-states-vs-canada',
  'united-states-vs-russia', 'united-states-vs-brazil', 'united-states-vs-australia',
  'united-states-vs-mexico', 'united-states-vs-france', 'united-states-vs-south-korea',
  'china-vs-india', 'china-vs-japan', 'china-vs-russia', 'china-vs-germany',
  'china-vs-united-kingdom', 'china-vs-brazil',
  'japan-vs-germany', 'japan-vs-south-korea', 'japan-vs-india',
  'germany-vs-france', 'germany-vs-united-kingdom', 'germany-vs-italy',
  'united-kingdom-vs-france', 'united-kingdom-vs-canada', 'united-kingdom-vs-australia',
  'france-vs-italy', 'france-vs-spain',
  'india-vs-brazil', 'india-vs-pakistan', 'india-vs-indonesia', 'india-vs-bangladesh',
  'brazil-vs-mexico', 'brazil-vs-argentina',
  'canada-vs-australia', 'canada-vs-mexico',
  'south-korea-vs-japan', 'south-korea-vs-australia',
  'russia-vs-india', 'russia-vs-brazil',
  'italy-vs-spain', 'italy-vs-netherlands',
  'australia-vs-new-zealand',
  'turkey-vs-mexico', 'turkey-vs-brazil',
  'saudi-arabia-vs-uae', 'saudi-arabia-vs-iran',
  'nigeria-vs-south-africa', 'nigeria-vs-kenya',
  'singapore-vs-switzerland',
  // Added: high-volume missing pairs
  'united-states-vs-italy', 'united-states-vs-spain',
  'china-vs-south-korea', 'china-vs-indonesia',
  'india-vs-russia', 'india-vs-japan', 'india-vs-united-kingdom',
  'japan-vs-united-kingdom', 'japan-vs-france', 'japan-vs-china',
  'germany-vs-japan', 'germany-vs-china', 'germany-vs-india',
  'indonesia-vs-india', 'indonesia-vs-brazil', 'indonesia-vs-mexico',
  'russia-vs-united-states', 'russia-vs-germany',
  'mexico-vs-indonesia', 'mexico-vs-argentina',
  'south-korea-vs-germany', 'south-korea-vs-united-kingdom',
  'poland-vs-germany', 'poland-vs-united-kingdom',
  'thailand-vs-vietnam', 'thailand-vs-indonesia',
  'philippines-vs-vietnam', 'philippines-vs-indonesia',
  'egypt-vs-saudi-arabia', 'egypt-vs-nigeria',
  'israel-vs-uae', 'israel-vs-saudi-arabia',
  'vietnam-vs-indonesia', 'vietnam-vs-india',
  'pakistan-vs-bangladesh', 'pakistan-vs-nigeria',
  'switzerland-vs-norway', 'switzerland-vs-germany',
  'netherlands-vs-belgium', 'sweden-vs-norway',
  'argentina-vs-colombia', 'chile-vs-argentina',
  'kenya-vs-ethiopia', 'south-africa-vs-egypt',
];

const CHART_COUNTRIES = ['united-states', 'china', 'japan', 'germany', 'united-kingdom', 'france', 'india', 'brazil', 'canada', 'australia', 'south-korea', 'mexico', 'russia', 'italy', 'spain', 'indonesia', 'netherlands', 'turkey', 'switzerland', 'saudi-arabia', 'argentina', 'south-africa', 'nigeria', 'singapore', 'israel', 'norway', 'sweden', 'egypt', 'world'];
const CHART_SLUGS = ['gdp', 'gdp-growth', 'gdp-per-capita', 'inflation-rate', 'unemployment-rate', 'population', 'life-expectancy', 'co2-emissions', 'government-debt', 'trade-openness', 'health-spending', 'military-spending', 'gini-index', 'renewable-energy', 'internet-users', 'fertility-rate', 'current-account', 'fdi-inflows', 'infant-mortality', 'urban-population'];

// Focused sitemap: only high-value pages that deserve crawl budget.
// Country/indicator detail pages (~96K) are excluded — Google discovers them
// via internal links from country pages and indicator pages.

export async function getSitemapCount(): Promise<number> {
  const countries = await getCountries();
  const indicatorSlugs = getAllIndicatorSlugs();
  const countryIndicatorCombos = countries.length * TOP_INDICATOR_SLUGS.length;
  const totalUrls = 20 + BLOG_POSTS.length + 1 + RANKING_SLUGS.length + countries.length + indicatorSlugs.length + COMPARISON_PAIRS.length + GLOSSARY_TERMS.length + 1 + countryIndicatorCombos;
  return Math.ceil(totalUrls / MAX_URLS_PER_SITEMAP);
}

export async function getSitemapUrls(id: number): Promise<MetadataRoute.Sitemap> {
  const countries = await getCountries();

  const allUrls: MetadataRoute.Sitemap = [];

  // 1. Static pages
  allUrls.push(
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
    { url: `${BASE_URL}/predictions`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/ai`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dashboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/snapshot/2026`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/world-economy`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/embed`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/cite`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  );

  // 2. Blog
  allUrls.push(
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...BLOG_POSTS.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/blog/how-to-get-economic-data-api`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.85 },
  );

  // 3. Ranking pages
  for (const slug of RANKING_SLUGS) {
    allUrls.push({
      url: `${BASE_URL}/ranking/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    });
  }

  // 4. Country pages (clean slug URLs)
  for (const c of countries) {
    allUrls.push({
      url: `${BASE_URL}${getCleanCountryUrl(c.id)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    });
  }

  // 5. Indicator pages (/indicator/[slug])
  const indicatorSlugs = getAllIndicatorSlugs();
  for (const slug of indicatorSlugs) {
    allUrls.push({
      url: `${BASE_URL}/indicator/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    });
  }

  // 6. Comparison pages
  for (const pair of COMPARISON_PAIRS) {
    allUrls.push({
      url: `${BASE_URL}/compare/${pair}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    });
  }

  // 7. Glossary pages
  allUrls.push({
    url: `${BASE_URL}/glossary`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  });
  for (const term of GLOSSARY_TERMS) {
    allUrls.push({
      url: `${BASE_URL}/glossary/${term.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    });
  }

  // 8. Top country/indicator detail pages (clean slug URLs)
  // ~218 countries × 20 top indicators = ~4,360 URLs for highest-traffic queries
  for (const c of countries) {
    for (const indSlug of TOP_INDICATOR_SLUGS) {
      const indicatorId = getIndicatorFromSlug(indSlug);
      if (!indicatorId) continue;
      allUrls.push({
        url: `${BASE_URL}${getCleanCountryIndicatorUrl(c.id, indicatorId)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      });
    }
  }

  // NOTE: Remaining country/indicator detail pages (~92K), chart pages (~580), and
  // map?id= pages (~440) are intentionally excluded from the sitemap to
  // focus crawl budget. Google discovers them via internal links.

  // Slice for this sitemap chunk
  const start = id * MAX_URLS_PER_SITEMAP;
  const end = start + MAX_URLS_PER_SITEMAP;
  return allUrls.slice(start, end);
}
