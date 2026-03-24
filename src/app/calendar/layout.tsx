import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Calendar — Macro Events & Earnings | Statistics of the World',
  description: 'Track this week\'s most important macro events, earnings reports, and central bank decisions. Verified data from ForexFactory, Finnhub, and FRED.',
  openGraph: {
    title: 'Economic Calendar — Statistics of the World',
    description: 'Macro events, earnings, and market-moving releases in one place.',
  },
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
