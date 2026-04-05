import type { Metadata } from 'next';
import CompareContent from './CompareContent';
import { getCountries } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Compare Countries — Side-by-Side Economic Data for 218 Nations',
  description: 'Compare any two countries across GDP, population, inflation, unemployment, and 440+ indicators. Interactive charts with IMF & World Bank data. Free.',
  alternates: { canonical: 'https://statisticsoftheworld.com/compare' },
  openGraph: {
    title: 'Compare Countries — Side-by-Side Economic Comparison',
    description: 'Compare any two countries across 440+ economic indicators.',
    siteName: 'Statistics of the World',
  },
};

export const revalidate = 3600;

export default async function ComparePage() {
  const countries = await getCountries();
  const sorted = countries
    .map((c: any) => ({ id: c.id, iso2: c.iso2, name: c.name, region: c.region }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return <CompareContent initialCountries={sorted} />;
}
