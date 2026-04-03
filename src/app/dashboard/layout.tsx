import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Dashboard — Real-Time Economic Pulse',
  description: 'Real-time dashboard showing global markets, upcoming economic events, and trending data. The pulse of the world economy at a glance.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
