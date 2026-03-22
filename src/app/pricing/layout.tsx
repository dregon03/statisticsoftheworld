import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Pricing — Free Global Statistics API',
  description: 'Free API for global statistics. 100 req/day free, 1,000 req/day with free API key, paid plans from $9/mo. 490+ indicators, 218 countries, 20+ years of data.',
  openGraph: {
    title: 'API Pricing — Statistics of the World',
    description: 'Free API with paid tiers for higher rate limits.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
