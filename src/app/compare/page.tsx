import type { Metadata } from 'next';
import CompareContent from './CompareContent';
import { getCountries } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Compare Countries — Side-by-Side Economic Data for 218 Nations (2026)',
  description: 'Compare any two countries side-by-side across GDP, population, inflation, unemployment, and 440+ economic indicators. 20+ years of historical data from IMF & World Bank. Free, no account required.',
  alternates: { canonical: 'https://statisticsoftheworld.com/compare' },
  openGraph: {
    title: 'Compare Countries — Side-by-Side Economic Comparison (2026)',
    description: 'Compare 218 countries across 440+ economic indicators including GDP, inflation, unemployment, population, and more. Interactive charts with 20+ years of IMF & World Bank data.',
    url: 'https://statisticsoftheworld.com/compare',
    siteName: 'Statistics of the World',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
        { '@type': 'ListItem', position: 2, name: 'Compare Countries', item: 'https://statisticsoftheworld.com/compare' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What countries can I compare on Statistics of the World?',
          acceptedAnswer: { '@type': 'Answer', text: 'You can compare any of 218 countries and territories side-by-side across 440+ economic, demographic, and social indicators. Select up to 8 countries at once for multi-country comparisons.' },
        },
        {
          '@type': 'Question',
          name: 'What indicators are available for country comparison?',
          acceptedAnswer: { '@type': 'Answer', text: 'The comparison tool covers GDP (nominal, per capita, PPP), real GDP growth, inflation rate, unemployment rate, government debt, population, life expectancy, trade openness, military spending, renewable energy share, and 400+ additional indicators. Data is sourced from the IMF World Economic Outlook, World Bank, WHO, and UN.' },
        },
        {
          '@type': 'Question',
          name: 'How far back does the historical data go?',
          acceptedAnswer: { '@type': 'Answer', text: 'Historical data covers 20+ years for most major indicators, allowing you to track how countries have changed over time. Interactive line charts visualize trends from the early 2000s through 2026 for most IMF and World Bank indicators.' },
        },
        {
          '@type': 'Question',
          name: 'Is the country comparison tool free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes, the country comparison tool is completely free with no account required. You can also download comparison data as a CSV file for free.' },
        },
      ],
    },
    {
      '@type': 'WebApplication',
      name: 'Country Comparison Tool',
      url: 'https://statisticsoftheworld.com/compare',
      description: 'Free interactive tool to compare 218 countries across 440+ economic and demographic indicators with 20+ years of historical data.',
      applicationCategory: 'DataApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export const revalidate = 3600;

export default async function ComparePage() {
  const countries = await getCountries();
  const sorted = countries
    .map((c: any) => ({ id: c.id, iso2: c.iso2, name: c.name, region: c.region }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CompareContent initialCountries={sorted} />
    </>
  );
}
