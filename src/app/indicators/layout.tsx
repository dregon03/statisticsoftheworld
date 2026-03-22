import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Indicators — 440+ Global Statistics | Statistics of the World',
  description: 'Explore 440+ indicators across 27 categories: GDP, inflation, health spending, education, environment, and more. Compare countries on any metric with data from IMF, World Bank, WHO, and UN.',
  openGraph: {
    title: 'Global Indicators — Statistics of the World',
    description: 'Compare countries on 440+ indicators from IMF, World Bank, WHO, and more.',
  },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
