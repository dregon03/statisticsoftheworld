import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade Explorer — Global Import/Export Data | Statistics of the World',
  description: 'Explore bilateral trade flows between countries using UN COMTRADE data. Filter by commodity, year, and trade partner.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
