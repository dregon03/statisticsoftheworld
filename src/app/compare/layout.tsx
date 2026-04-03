import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://statisticsoftheworld.com/compare' },
  title: 'Compare Countries — Side-by-Side Statistics',
  description: 'Compare up to 8 countries side-by-side across 395+ indicators with 20+ years of historical data. G7, BRICS, Nordics, and custom country groups. Free — no account required.',
  openGraph: {
    title: 'Compare Countries — Statistics of the World',
    description: 'Free country comparison tool with 395+ indicators and historical charts.',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
