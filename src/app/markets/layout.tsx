import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Markets — Stocks, Commodities, Currencies, Crypto',
  description: 'Real-time global market data. S&P 500, NASDAQ 100, TSX, FTSE 100 stocks, commodities, forex pairs, and cryptocurrency prices updated throughout the day.',
  alternates: {
    canonical: 'https://statisticsoftheworld.com/markets',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
