import type { MetadataRoute } from 'next';
import { getCountries, INDICATORS } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countries = await getCountries();
  const baseUrl = 'https://statisticsoftheworld.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/scatter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/regions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/markets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/commodities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/credit-ratings`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/api-docs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${baseUrl}/country/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

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

  return [...staticPages, ...countryPages, ...mapPages, ...indicatorPages];
}
