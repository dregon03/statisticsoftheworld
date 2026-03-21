import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Countries — Browse 217 Nations',
  description: 'Browse all 217 countries and territories. Filter by region and income level. View GDP, population, life expectancy, and 320+ indicators for every country.',
  openGraph: {
    title: 'All Countries — Statistics of the World',
    description: 'Browse 217 countries with key economic and demographic indicators.',
  },
};

export default function CountriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
