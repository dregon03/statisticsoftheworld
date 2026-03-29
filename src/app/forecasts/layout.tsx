import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Forecasts — GDP, Inflation, Growth Projections | Statistics of the World',
  description: 'View IMF and World Bank economic forecasts for every country. GDP growth, inflation, unemployment projections with historical accuracy tracking.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
