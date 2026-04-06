import type { Metadata } from 'next';
import Link from 'next/link';
import { INDICATORS } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Data Sources — IMF, World Bank, WHO, FRED, UN | Statistics of the World',
  description: 'Complete list of data sources used by Statistics of the World: IMF World Economic Outlook, World Bank WDI, WHO GHO, FRED, United Nations, Yahoo Finance, and more. 440+ indicators from 6 authoritative sources.',
  alternates: { canonical: 'https://statisticsoftheworld.com/data-sources' },
};

export default function DataSourcesPage() {
  const imfCount = INDICATORS.filter(i => i.source === 'imf').length;
  const whoCount = INDICATORS.filter(i => i.source === 'who' || i.id.startsWith('WHO.')).length;
  const wbCount = INDICATORS.length - imfCount - whoCount;

  return (
    <main className="min-h-screen"><Nav />
      <section className="max-w-[800px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400"><Link href="/" className="hover:text-gray-600 transition">Home</Link><span className="mx-2">/</span><span className="text-gray-600">Data Sources</span></nav>
        <h1 className="text-[32px] font-bold text-[#0d1b2a] mb-4">Data Sources</h1>
        <p className="text-[15px] text-[#64748b] mb-8">{INDICATORS.length}+ indicators from 6 authoritative international organizations</p>

        <div className="space-y-8 text-[15px] text-[#374151] leading-[1.8]">
          <p>Statistics of the World aggregates data exclusively from official international organizations. We do not create, estimate, or model our own data. Every number on this site can be traced back to its original source. This page provides a complete guide to where our data comes from.</p>

          <div className="border border-[#d5dce6] rounded-xl p-6">
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">1. IMF World Economic Outlook (WEO)</h2>
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="text-[12px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{imfCount} indicators</span>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Updated biannually</span>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">193 countries</span>
            </div>
            <p>The IMF WEO is the gold standard for international macroeconomic data. It provides harmonized GDP, growth, inflation, unemployment, government debt, current account, and fiscal indicators for 193 countries, including estimates for the current year and projections 5 years forward.</p>
            <p className="mt-2">Key indicators from IMF: <Link href="/gdp-by-country" className="text-[#0066cc] hover:underline">GDP</Link>, <Link href="/gdp-growth-by-country" className="text-[#0066cc] hover:underline">GDP growth</Link>, <Link href="/gdp-per-capita-by-country" className="text-[#0066cc] hover:underline">GDP per capita</Link>, <Link href="/inflation-by-country" className="text-[#0066cc] hover:underline">inflation</Link>, <Link href="/unemployment-by-country" className="text-[#0066cc] hover:underline">unemployment</Link>, <Link href="/debt-by-country" className="text-[#0066cc] hover:underline">government debt</Link>, <Link href="/gdp-ppp-by-country" className="text-[#0066cc] hover:underline">GDP PPP</Link>.</p>
            <p className="text-[13px] text-[#64748b] mt-2"><a href="https://www.imf.org/en/Publications/WEO" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">imf.org/WEO ↗</a></p>
          </div>

          <div className="border border-[#d5dce6] rounded-xl p-6">
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">2. World Bank World Development Indicators (WDI)</h2>
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="text-[12px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{wbCount}+ indicators</span>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Updated annually + rolling</span>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">218 countries</span>
            </div>
            <p>The WDI is the world&apos;s most comprehensive development database, covering 300+ indicators across health, education, environment, infrastructure, governance, trade, labor, demographics, and more. Data is compiled from national statistical agencies, UN agencies, and specialized organizations.</p>
            <p className="mt-2">Key indicators from World Bank: <Link href="/population-by-country" className="text-[#0066cc] hover:underline">population</Link>, <Link href="/life-expectancy-by-country" className="text-[#0066cc] hover:underline">life expectancy</Link>, <Link href="/co2-emissions-by-country" className="text-[#0066cc] hover:underline">CO2 emissions</Link>, <Link href="/fertility-rate-by-country" className="text-[#0066cc] hover:underline">fertility rate</Link>, <Link href="/poverty-rate-by-country" className="text-[#0066cc] hover:underline">poverty</Link>, <Link href="/gini-index-by-country" className="text-[#0066cc] hover:underline">inequality</Link>, <Link href="/education-spending-by-country" className="text-[#0066cc] hover:underline">education spending</Link>, <Link href="/health-spending-by-country" className="text-[#0066cc] hover:underline">health spending</Link>, <Link href="/fdi-by-country" className="text-[#0066cc] hover:underline">FDI</Link>, <Link href="/trade-by-country" className="text-[#0066cc] hover:underline">trade</Link>.</p>
            <p className="text-[13px] text-[#64748b] mt-2"><a href="https://data.worldbank.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">data.worldbank.org ↗</a></p>
          </div>

          <div className="border border-[#d5dce6] rounded-xl p-6">
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">3. WHO Global Health Observatory (GHO)</h2>
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="text-[12px] bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">{whoCount}+ indicators</span>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Updated annually</span>
              <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">194 countries</span>
            </div>
            <p>The WHO GHO provides health-specific indicators including disease prevalence, healthcare infrastructure, immunization rates, and cause-specific mortality. WHO data complements World Bank health indicators with more granular clinical and epidemiological measures.</p>
            <p className="text-[13px] text-[#64748b] mt-2"><a href="https://www.who.int/data/gho" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">who.int/data ↗</a></p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <h3 className="font-semibold text-[#0d1b2a] mb-2">4. FRED</h3>
              <p className="text-[14px]">Federal Reserve Economic Data — US interest rates, Treasury yields, money supply, CPI, employment.</p>
              <p className="text-[13px] text-[#64748b] mt-2"><a href="https://fred.stlouisfed.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">fred.stlouisfed.org ↗</a></p>
            </div>
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <h3 className="font-semibold text-[#0d1b2a] mb-2">5. United Nations</h3>
              <p className="text-[14px]">Population projections, trade statistics (COMTRADE), and SDG indicators from UN agencies.</p>
              <p className="text-[13px] text-[#64748b] mt-2"><a href="https://data.un.org" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">data.un.org ↗</a></p>
            </div>
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <h3 className="font-semibold text-[#0d1b2a] mb-2">6. Yahoo Finance</h3>
              <p className="text-[14px]">Real-time stock indices, commodities, currencies, and crypto prices for market data.</p>
              <p className="text-[13px] text-[#64748b] mt-2"><a href="https://finance.yahoo.com" className="text-[#0066cc] hover:underline" target="_blank" rel="noopener">finance.yahoo.com ↗</a></p>
            </div>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">Data Licensing & Attribution</h2>
            <p>IMF data is published under a Creative Commons Attribution license. World Bank data is available under the CC BY 4.0 license. WHO data is free for non-commercial use with attribution. We encourage users to cite both Statistics of the World and the original data source — see our <Link href="/cite" className="text-[#0066cc] hover:underline">citation guide</Link>.</p>
          </div>
        </div>

        <div className="mt-10 border-t border-[#d5dce6] pt-8"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[{ href: '/methodology', label: 'Methodology' }, { href: '/api-docs', label: 'API Docs' }, { href: '/indicators', label: 'All Indicators' }, { href: '/cite', label: 'How to Cite' }, { href: '/glossary', label: 'Glossary' }, { href: '/world-economy', label: 'World Economy' }, { href: '/countries', label: 'All Countries' }, { href: '/contact', label: 'Contact' }].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:text-[#0d1b2a] hover:border-[#b0bdd0] transition text-center">{l.label} →</Link>))}
        </div></div>
      </section><Footer /></main>);
}
