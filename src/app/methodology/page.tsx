import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Methodology — How Statistics of the World Sources & Processes Data',
  description: 'How Statistics of the World collects, processes, and presents economic data from the IMF, World Bank, WHO, FRED, and United Nations. Our methodology, data sources, update frequency, and quality standards.',
  alternates: { canonical: 'https://statisticsoftheworld.com/methodology' },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="max-w-[800px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">Methodology</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-4">Methodology & Data Sources</h1>
        <p className="text-[15px] text-[#64748b] mb-8">How we collect, process, and present global economic data</p>

        <div className="space-y-8 text-[15px] text-[#374151] leading-[1.8]">
          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Our Mission</h2>
            <p>Statistics of the World provides free, comprehensive access to economic, demographic, health, and environmental data for 218 countries. Every data point is sourced directly from official international organizations — we do not estimate, interpolate, or generate data. When the IMF publishes new GDP projections or the World Bank updates its development indicators, our database reflects those changes within days.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Primary Data Sources</h2>
            <div className="space-y-4">
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">IMF World Economic Outlook (WEO)</h3>
                <p>GDP, GDP growth, GDP per capita, GDP PPP, inflation, unemployment, government debt, current account, fiscal balance, and other macroeconomic indicators for 193 countries. Published biannually (April and October) with interim updates. The IMF is the most authoritative source for cross-country macroeconomic comparisons because it harmonizes national accounts data from every country using consistent methodology.</p>
                <p className="text-[13px] text-[#64748b] mt-2">Update frequency: Biannual (April, October) · Coverage: 193 countries · <a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">imf.org/WEO ↗</a></p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">World Bank World Development Indicators (WDI)</h3>
                <p>Over 300 development indicators covering health, education, environment, infrastructure, governance, trade, labor, and demographics. The WDI compiles data from national statistical agencies, UN agencies, and specialized organizations. Historical data extends to 1960 for many series.</p>
                <p className="text-[13px] text-[#64748b] mt-2">Update frequency: Annual with rolling updates · Coverage: 218 countries · <a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">data.worldbank.org ↗</a></p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">WHO Global Health Observatory (GHO)</h3>
                <p>Health indicators including life expectancy, mortality rates, disease prevalence, healthcare spending, and immunization coverage. WHO data is compiled from national health ministries and validated through demographic modeling.</p>
                <p className="text-[13px] text-[#64748b] mt-2">Update frequency: Annual · Coverage: 194 countries · <a href="https://www.who.int/data/gho" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">who.int/data ↗</a></p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">FRED (Federal Reserve Economic Data)</h3>
                <p>US-specific economic data including interest rates, Treasury yields, money supply, employment data, and financial market indicators. FRED is the gold standard for US macroeconomic time series.</p>
                <p className="text-[13px] text-[#64748b] mt-2">Update frequency: Daily to monthly · <a href="https://fred.stlouisfed.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">fred.stlouisfed.org ↗</a></p>
              </div>
              <div className="border border-[#d5dce6] rounded-lg p-4">
                <h3 className="font-semibold text-[#0d1b2a] mb-1">United Nations</h3>
                <p>Population data and demographic projections from the UN Population Division, trade statistics from UN COMTRADE, and development indicators from various UN agencies.</p>
                <p className="text-[13px] text-[#64748b] mt-2">Update frequency: Annual · <a href="https://data.un.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">data.un.org ↗</a></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Data Processing</h2>
            <p>Our ETL (Extract-Transform-Load) pipeline runs on a scheduled basis, fetching data from source APIs and storing it in our database. The pipeline:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Extracts</strong> data from official APIs (IMF DataMapper, World Bank API, WHO GHO API, FRED API)</li>
              <li><strong>Transforms</strong> data into a consistent format — standardizing country names, ISO codes, indicator IDs, and time periods</li>
              <li><strong>Validates</strong> data for completeness and consistency, flagging anomalies for review</li>
              <li><strong>Loads</strong> data into our PostgreSQL database, preserving full historical time series</li>
            </ul>
            <p className="mt-3">We do not modify, adjust, or smooth source data. If the IMF reports GDP for Country X as $500 billion, that is exactly what we display. Any projections or estimates are clearly labeled as such and attributed to the original source.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Update Frequency</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>IMF macroeconomic data</strong>: Updated within 48 hours of each WEO release (April, October)</li>
              <li><strong>World Bank indicators</strong>: Updated weekly as new data becomes available</li>
              <li><strong>Financial market data</strong>: Updated daily during trading hours</li>
              <li><strong>WHO health data</strong>: Updated as new releases are published (typically annual)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Data Limitations</h2>
            <p>All data has limitations that users should understand:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Lag</strong>: Most World Bank indicators are 1-2 years behind the current year. IMF data includes current-year estimates and multi-year projections.</li>
              <li><strong>Coverage gaps</strong>: Not all indicators are available for all countries. Small states, conflict zones, and authoritarian regimes may have incomplete data.</li>
              <li><strong>Revisions</strong>: GDP and other economic data are regularly revised as more complete information becomes available. Historical data may change.</li>
              <li><strong>Comparability</strong>: Despite harmonization efforts, national statistical methodologies differ. Cross-country comparisons should account for these differences.</li>
              <li><strong>Informal economy</strong>: GDP and employment statistics may undercount informal economic activity, particularly in developing countries.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Editorial Content</h2>
            <p>All editorial content — country economic overviews, indicator explanations, comparison analyses, and glossary definitions — is written by economists and data analysts with expertise in international macroeconomics. Editorial content is reviewed for accuracy and updated when significant economic developments occur. We cite specific data sources throughout and link to the original data where available.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">API Access</h2>
            <p>Our <Link href="/api-docs" className="text-[#0066cc] hover:underline">free API</Link> provides programmatic access to all data in JSON format. Basic usage requires no authentication (100 requests/day). Free API keys are available for higher rate limits (1,000 requests/day). Academic and research use is encouraged.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-bold text-[#0d1b2a] mb-3">Corrections & Feedback</h2>
            <p>If you identify a data error, outdated information, or have suggestions for improvement, please <Link href="/contact" className="text-[#0066cc] hover:underline">contact us</Link>. We take data accuracy seriously and will investigate all reports promptly.</p>
          </section>
        </div>

        <div className="mt-10 border-t border-[#d5dce6] pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[{ href: '/about', label: 'About Us' }, { href: '/api-docs', label: 'API Docs' }, { href: '/glossary', label: 'Glossary' }, { href: '/cite', label: 'How to Cite' }, { href: '/world-economy', label: 'World Economy' }, { href: '/gdp-by-country', label: 'GDP by Country' }, { href: '/countries', label: 'All Countries' }, { href: '/contact', label: 'Contact' }].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
