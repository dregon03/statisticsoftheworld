import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://statisticsoftheworld.com/credit-ratings' },
  title: 'Country Credit Ratings — SOTW Governance Score',
  description: 'Credit ratings and governance scores for 200+ countries. Based on World Bank Governance Indicators (corruption, rule of law, political stability). Free, transparent, data-driven.',
  openGraph: {
    title: 'Country Credit Ratings — Statistics of the World',
    description: 'Transparent credit scores for 200+ countries based on governance indicators.',
  },
};

export default function CreditRatingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
