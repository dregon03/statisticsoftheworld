import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://statisticsoftheworld.com/predictions' },
  title: 'Prediction Markets — Polymarket Odds & Trends',
  description: 'Live prediction market data from Polymarket. Track odds on elections, geopolitics, economics, and more with historical price charts.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
