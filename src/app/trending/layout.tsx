import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trending Data — Fastest Moving Indicators | Statistics of the World',
  description: 'Discover which countries and indicators are seeing the biggest changes. Trending economic data updated daily.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
