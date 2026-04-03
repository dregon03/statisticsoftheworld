import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Countries — Browse 218 Nations with GDP, Population & Key Stats (2026)',
  description: 'Browse all 218 countries and territories with GDP, population, inflation, life expectancy, and 440+ indicators. Filter by region. Data from IMF & World Bank.',
  alternates: {
    canonical: 'https://statisticsoftheworld.com/countries',
  },
  openGraph: {
    title: 'All Countries — Statistics of the World',
    description: 'Browse 218 countries with key economic and demographic indicators.',
  },
};

export default function CountriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
