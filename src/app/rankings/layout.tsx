import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indicators — 320+ Global Statistics Rankings',
  description: 'Explore 320+ indicators across 22 categories: GDP, inflation, health spending, education, environment, and more. Rank and compare countries on any metric.',
  openGraph: {
    title: 'Global Indicators — Statistics of the World',
    description: 'Rank countries on 320+ indicators from IMF, World Bank, WHO, and more.',
  },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
