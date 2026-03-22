import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regional Analysis — Compare World Regions',
  description: 'Compare world regions and income groups across 395+ indicators. Average, median, and aggregate statistics for East Asia, Europe, Latin America, Sub-Saharan Africa, and more.',
  openGraph: {
    title: 'Regional Analysis — Statistics of the World',
    description: 'Regional aggregate statistics for 395+ indicators.',
  },
};

export default function RegionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
