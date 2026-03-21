import type { MetadataRoute } from 'next';
import { getCountries, INDICATORS } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countries = await getCountries();
  const baseUrl = 'https://statisticsoftheworld.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/rankings`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${baseUrl}/country/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...countryPages];
}
