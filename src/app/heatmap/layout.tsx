import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://statisticsoftheworld.com/heatmap' },
  title: 'World Heatmap — Visualize Global Data by Country',
  description: 'Interactive treemap heatmap of global economic data. Compare countries by GDP, population, military spending, trade, and 490+ indicators across G20, Top 20, and custom groups.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
