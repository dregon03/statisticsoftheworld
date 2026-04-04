import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Statistics of the World — Our Mission, Data Sources & Methodology',
  description: 'Statistics of the World is a free global data platform aggregating 440+ indicators for 218 countries from IMF, World Bank, WHO, FRED, and United Nations. Learn about our data sources, methodology, and mission.',
  alternates: { canonical: 'https://statisticsoftheworld.com/about' },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Statistics of the World',
    url: 'https://statisticsoftheworld.com/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'Statistics of the World',
      url: 'https://statisticsoftheworld.com',
      description: 'Free global statistics platform aggregating economic, demographic, health, and environmental data for 218 countries from IMF, World Bank, WHO, FRED, and United Nations.',
      foundingDate: '2026',
      sameAs: [
        'https://x.com/sotwdata',
        'https://bsky.app/profile/sotwdata.bsky.social',
      ],
    },
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-6">About Statistics of the World</h1>

        <div className="space-y-6 text-[15px] text-[#374151] leading-[1.8]">
          <p>
            Statistics of the World is a free, open data platform that makes global economic and demographic statistics accessible to everyone. We aggregate data from the world&apos;s most authoritative statistical organizations — the International Monetary Fund (IMF), World Bank, World Health Organization (WHO), Federal Reserve (FRED), European Central Bank (ECB), and United Nations — into a single, searchable platform with interactive charts, country comparisons, and a free public API.
          </p>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] pt-4">Our Mission</h2>
          <p>
            International economic data exists across dozens of different databases, each with its own interface, format, and access method. The IMF publishes GDP data in one place, the World Bank tracks development indicators in another, and the WHO maintains health statistics in yet another. Finding and comparing data across these sources requires significant effort and technical knowledge.
          </p>
          <p>
            We built Statistics of the World to solve this problem. Our platform brings together 440+ indicators for 218 countries into a unified interface where anyone — students, researchers, journalists, policymakers, investors, or curious citizens — can look up any country, compare economies, and explore global trends without navigating multiple databases or dealing with complex data formats.
          </p>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] pt-4">Data Sources & Methodology</h2>
          <p>
            We do not estimate, model, or generate data. Every number on this platform comes directly from an official international organization. Our role is aggregation, presentation, and accessibility — not data production. When the IMF updates its World Economic Outlook or the World Bank releases new World Development Indicators data, we incorporate those changes into our database, typically within days of publication.
          </p>

          <div className="border border-[#d5dce6] rounded-xl overflow-hidden my-6">
            <table className="w-full">
              <caption className="sr-only">Data sources used by Statistics of the World</caption>
              <thead>
                <tr className="text-left text-[13px] text-[#64748b] border-b border-[#d5dce6] bg-[#f8f9fb]">
                  <th scope="col" className="px-5 py-3">Source</th>
                  <th scope="col" className="px-5 py-3">Coverage</th>
                  <th scope="col" className="px-5 py-3">Update Frequency</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['IMF World Economic Outlook', 'GDP, inflation, unemployment, debt, fiscal balance — 13 core macroeconomic indicators', 'Biannual (April, October)'],
                  ['World Bank WDI', '300+ development indicators: health, education, trade, environment, governance', 'Annual (with quarterly updates)'],
                  ['WHO Global Health Observatory', 'Life expectancy, mortality, disease, health spending, road safety', 'Annual'],
                  ['FRED (Federal Reserve)', 'US interest rates, bond yields, money supply, S&P 500, VIX', 'Daily'],
                  ['Yahoo Finance', 'Stock market indices, commodity prices, currency exchange rates', 'Real-time (15-min delay)'],
                  ['ECB', 'European exchange rates', 'Daily'],
                  ['United Nations', 'Population projections, trade flows, demographic data', 'Annual'],
                ].map(([source, coverage, freq]) => (
                  <tr key={source} className="border-b border-[#edf0f5]">
                    <td className="px-5 py-3 text-[14px] font-medium text-[#0d1b2a]">{source}</td>
                    <td className="px-5 py-3 text-[13px] text-[#64748b]">{coverage}</td>
                    <td className="px-5 py-3 text-[13px] text-[#64748b]">{freq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] pt-4">Free API</h2>
          <p>
            All data is available programmatically through our REST API. The API returns structured JSON and requires no authentication for basic usage (100 requests/day). Free API keys are available for higher rate limits. We believe data should be accessible not just to humans browsing a website, but to applications, researchers running analyses, and AI systems that need structured economic data.
          </p>
          <p>
            <Link href="/api-docs" className="text-[#0066cc] hover:underline">View API documentation →</Link>
          </p>

          <h2 className="text-[22px] font-bold text-[#0d1b2a] pt-4">Contact</h2>
          <p>
            For questions, data requests, partnerships, or media inquiries, reach us at{' '}
            <a href="mailto:statisticsoftheworldcontact@gmail.com" className="text-[#0066cc] hover:underline">statisticsoftheworldcontact@gmail.com</a>.
            Follow us on <a href="https://x.com/sotwdata" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">X (@sotwdata)</a> and{' '}
            <a href="https://bsky.app/profile/sotwdata.bsky.social" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">Bluesky</a> for daily economic data highlights.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
