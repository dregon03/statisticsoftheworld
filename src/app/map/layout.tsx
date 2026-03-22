import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'World Map — Visualize Global Indicators',
  description: 'Interactive choropleth world map for GDP, population, life expectancy, inflation, and 395+ indicators across 218 countries. Color-coded by value.',
  openGraph: {
    title: 'World Map — Statistics of the World',
    description: 'Interactive choropleth maps for 395+ global indicators.',
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
