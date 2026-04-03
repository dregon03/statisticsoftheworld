import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://statisticsoftheworld.com/scatter' },
  title: 'Scatter Plot Explorer — Cross-Indicator Analysis',
  description: 'Gapminder-style scatter plots: GDP vs Life Expectancy, Education vs Income, and 100+ combinations. Explore correlations across 218 countries with population-weighted bubbles.',
  openGraph: {
    title: 'Scatter Plot Explorer — Statistics of the World',
    description: 'Gapminder-style scatter plots across 395+ global indicators.',
  },
};

export default function ScatterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
