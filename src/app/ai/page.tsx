import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Integration — Build with SOTW Data',
  description: 'MCP Server, OpenAPI spec, GPT Actions, and free API for AI agents. 443 indicators for 218 countries.',
};

export default function AIPage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-bold mb-2">Build with SOTW Data</h1>
        <p className="text-[14px] text-[#666] mb-8">
          Connect AI agents, LLMs, and applications to 443 indicators for 218 countries.
          Free. No paywall. Multiple integration methods.
        </p>

        {/* Quick start cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="border border-[#e8e8e8] rounded-xl p-5">
            <div className="text-[20px] mb-2">&#x1F916;</div>
            <div className="text-[15px] font-semibold mb-1">MCP Server</div>
            <div className="text-[12px] text-[#999]">For Claude Desktop, Claude Code, and MCP-compatible agents</div>
          </div>
          <div className="border border-[#e8e8e8] rounded-xl p-5">
            <div className="text-[20px] mb-2">&#x26A1;</div>
            <div className="text-[15px] font-semibold mb-1">REST API v2</div>
            <div className="text-[12px] text-[#999]">Agent-optimized endpoints with context, suggestions, and markdown</div>
          </div>
          <div className="border border-[#e8e8e8] rounded-xl p-5">
            <div className="text-[20px] mb-2">&#x1F4AC;</div>
            <div className="text-[15px] font-semibold mb-1">Natural Language</div>
            <div className="text-[12px] text-[#999]">Ask questions in plain English via /api/chat</div>
          </div>
        </div>

        {/* MCP Server */}
        <section className="mb-10">
          <h2 className="text-[20px] font-semibold mb-4 flex items-center gap-2">
            <span className="text-[16px]">&#x1F916;</span> MCP Server
          </h2>
          <p className="text-[13px] text-[#666] mb-4">
            The Model Context Protocol (MCP) lets AI agents like Claude directly query SOTW data.
            Two options: hosted remote server or local npm package.
          </p>

          <h3 className="text-[15px] font-semibold mb-2">Option 1: Remote MCP (Recommended)</h3>
          <p className="text-[13px] text-[#666] mb-3">
            Point your MCP client at our hosted endpoint. No installation needed.
          </p>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[12px] p-4 rounded-lg overflow-x-auto mb-4">
{`// Claude Desktop config (~/.claude/claude_desktop_config.json)
{
  "mcpServers": {
    "statistics-of-the-world": {
      "type": "url",
      "url": "https://statisticsoftheworld.com/api/mcp"
    }
  }
}`}
          </pre>

          <h3 className="text-[15px] font-semibold mb-2">Option 2: Local MCP Server</h3>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[12px] p-4 rounded-lg overflow-x-auto mb-4">
{`// Install globally
npm install -g @sotw/mcp-server

// Claude Desktop config
{
  "mcpServers": {
    "statistics-of-the-world": {
      "command": "npx",
      "args": ["@sotw/mcp-server"]
    }
  }
}`}
          </pre>

          <h3 className="text-[15px] font-semibold mb-2">Available Tools (7)</h3>
          <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-[#999] uppercase border-b border-[#e8e8e8] bg-[#f8f9fa]">
                  <th className="px-4 py-2.5">Tool</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['get_country_overview', 'All key stats + AI narrative for a country'],
                  ['get_indicator_ranking', 'Rank countries by any indicator (top/bottom N)'],
                  ['get_historical_data', '20+ years of time series data'],
                  ['compare_countries', 'Side-by-side comparison of 2-10 countries'],
                  ['search_indicators', 'Find indicators by keyword'],
                  ['get_available_indicators', 'List all 443 indicators by category'],
                  ['get_country_list', 'All 218 countries with metadata'],
                ].map(([name, desc]) => (
                  <tr key={name} className="border-b border-[#f0f0f0] hover:bg-[#f8f9fa]">
                    <td className="px-4 py-2 font-mono text-[12px] text-[#0066cc]">{name}</td>
                    <td className="px-4 py-2 text-[#666]">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* REST API v2 */}
        <section className="mb-10">
          <h2 className="text-[20px] font-semibold mb-4 flex items-center gap-2">
            <span className="text-[16px]">&#x26A1;</span> REST API v2 (Agent-Optimized)
          </h2>
          <p className="text-[13px] text-[#666] mb-4">
            Enhanced endpoints that return enriched data with units, sources, related indicators,
            and suggested follow-up queries. Supports <code className="bg-[#f8f9fa] px-1 rounded">format=markdown</code> for direct LLM consumption.
          </p>

          <div className="space-y-4">
            {[
              {
                method: 'GET', path: '/api/v2/country/:id',
                desc: 'All indicators for a country with AI narrative',
                example: 'curl https://statisticsoftheworld.com/api/v2/country/USA?format=markdown',
              },
              {
                method: 'GET', path: '/api/v2/indicator/:id',
                desc: 'Country rankings with metadata and related indicators',
                example: 'curl "https://statisticsoftheworld.com/api/v2/indicator/IMF.NGDPD?limit=10&order=desc"',
              },
              {
                method: 'GET', path: '/api/v2/history',
                desc: 'Historical time series with summary stats (YoY, CAGR, min/max)',
                example: 'curl "https://statisticsoftheworld.com/api/v2/history?indicator=IMF.NGDPD&country=USA"',
              },
              {
                method: 'GET', path: '/api/v1/search',
                desc: 'Search indicators by keyword',
                example: 'curl "https://statisticsoftheworld.com/api/v1/search?q=gdp"',
              },
              {
                method: 'GET', path: '/api/v1/compare',
                desc: 'Compare multiple countries',
                example: 'curl "https://statisticsoftheworld.com/api/v1/compare?countries=USA,CHN,JPN"',
              },
              {
                method: 'POST', path: '/api/chat',
                desc: 'Natural language query (AI-powered)',
                example: 'curl -X POST https://statisticsoftheworld.com/api/chat -H "Content-Type: application/json" -d \'{"message":"top 5 by GDP"}\'',
              },
            ].map(ep => (
              <div key={ep.path} className="border border-[#e8e8e8] rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-[#f8f9fa] border-b border-[#e8e8e8]">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded text-white ${ep.method === 'POST' ? 'bg-green-600' : 'bg-[#0066cc]'}`}>{ep.method}</span>
                  <code className="text-[13px] font-mono text-[#333]">{ep.path}</code>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[13px] text-[#666] mb-2">{ep.desc}</p>
                  <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[11px] p-3 rounded overflow-x-auto">
                    <code>{ep.example}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OpenAPI / GPT Actions */}
        <section className="mb-10">
          <h2 className="text-[20px] font-semibold mb-4">OpenAPI & GPT Actions</h2>
          <p className="text-[13px] text-[#666] mb-4">
            Use our OpenAPI 3.1 spec with any AI framework — LangChain, CrewAI, AutoGen, GPT Actions, and more.
          </p>
          <div className="flex gap-3 mb-4">
            <a href="/api/openapi.json" target="_blank" className="px-4 py-2 bg-[#0066cc] text-white rounded-lg text-[13px] hover:bg-[#0055aa] transition">
              OpenAPI Spec
            </a>
            <a href="/.well-known/ai-plugin.json" target="_blank" className="px-4 py-2 border border-[#e8e8e8] rounded-lg text-[13px] hover:bg-[#f5f7fa] transition">
              GPT Plugin Manifest
            </a>
          </div>
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[12px] p-4 rounded-lg overflow-x-auto">
{`# Python — LangChain
from langchain_community.tools import OpenAPIToolkit

toolkit = OpenAPIToolkit.from_openapi_spec(
    "https://statisticsoftheworld.com/api/openapi.json"
)

# JavaScript — fetch
const spec = await fetch("https://statisticsoftheworld.com/api/openapi.json")
  .then(r => r.json());`}
          </pre>
        </section>

        {/* LLMs.txt */}
        <section className="mb-10">
          <h2 className="text-[20px] font-semibold mb-4">AI Discovery Files</h2>
          <p className="text-[13px] text-[#666] mb-4">
            Machine-readable files for AI crawlers and answer engines.
          </p>
          <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <tbody>
                <tr className="border-b border-[#f0f0f0]">
                  <td className="px-4 py-2.5 font-mono text-[12px]">
                    <a href="/llms.txt" className="text-[#0066cc] hover:underline">/llms.txt</a>
                  </td>
                  <td className="px-4 py-2.5 text-[#666]">Concise site overview, API endpoints, data coverage</td>
                </tr>
                <tr className="border-b border-[#f0f0f0]">
                  <td className="px-4 py-2.5 font-mono text-[12px]">
                    <a href="/llms-full.txt" className="text-[#0066cc] hover:underline">/llms-full.txt</a>
                  </td>
                  <td className="px-4 py-2.5 text-[#666]">Complete catalog of all 443 indicators with IDs</td>
                </tr>
                <tr className="border-b border-[#f0f0f0]">
                  <td className="px-4 py-2.5 font-mono text-[12px]">
                    <a href="/api/openapi.json" className="text-[#0066cc] hover:underline">/api/openapi.json</a>
                  </td>
                  <td className="px-4 py-2.5 text-[#666]">OpenAPI 3.1 specification</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[12px]">
                    <a href="/.well-known/ai-plugin.json" className="text-[#0066cc] hover:underline">/.well-known/ai-plugin.json</a>
                  </td>
                  <td className="px-4 py-2.5 text-[#666]">GPT Actions / ChatGPT plugin manifest</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Indicator IDs */}
        <section className="mb-10">
          <h2 className="text-[20px] font-semibold mb-4">Key Indicator IDs</h2>
          <p className="text-[13px] text-[#666] mb-4">
            Most commonly used indicator IDs for quick reference.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px]">
            {[
              ['IMF.NGDPD', 'GDP (nominal, USD billions)'],
              ['IMF.NGDPDPC', 'GDP per capita (USD)'],
              ['IMF.NGDP_RPCH', 'Real GDP growth (%)'],
              ['IMF.PPPPC', 'GDP per capita, PPP'],
              ['SP.POP.TOTL', 'Population'],
              ['SP.DYN.LE00.IN', 'Life expectancy'],
              ['IMF.PCPIPCH', 'Inflation rate (%)'],
              ['IMF.LUR', 'Unemployment rate (%)'],
              ['IMF.GGXWDG_NGDP', 'Government debt (% GDP)'],
              ['EN.GHG.CO2.PC.CE.AR5', 'CO2 emissions per capita'],
              ['SI.POV.GINI', 'Gini index (inequality)'],
              ['MS.MIL.XPND.GD.ZS', 'Military spending (% GDP)'],
              ['SE.XPD.TOTL.GD.ZS', 'Education spending (% GDP)'],
              ['SH.XPD.CHEX.GD.ZS', 'Health spending (% GDP)'],
              ['IT.NET.USER.ZS', 'Internet users (%)'],
              ['NE.TRD.GNFS.ZS', 'Trade openness (% GDP)'],
            ].map(([id, label]) => (
              <div key={id} className="flex items-center gap-2 py-1">
                <code className="text-[11px] bg-[#f8f9fa] px-1.5 py-0.5 rounded text-[#0066cc] shrink-0">{id}</code>
                <span className="text-[#666] truncate">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section>
          <h2 className="text-[20px] font-semibold mb-4">Data Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px] text-[#666]">
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">IMF WEO</div>
              <div className="text-[11px] text-[#999]">GDP, inflation, debt, fiscal</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">World Bank WDI</div>
              <div className="text-[11px] text-[#999]">300+ development indicators</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">United Nations</div>
              <div className="text-[11px] text-[#999]">Population, trade, SDGs</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">WHO GHO</div>
              <div className="text-[11px] text-[#999]">30+ health indicators</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">FRED</div>
              <div className="text-[11px] text-[#999]">US economy, bonds, rates</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">Yahoo Finance</div>
              <div className="text-[11px] text-[#999]">Stock indices, commodities, FX</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">ECB</div>
              <div className="text-[11px] text-[#999]">European exchange rates</div>
            </div>
            <div className="border border-[#e8e8e8] rounded-lg p-3">
              <div className="font-semibold text-[#333] text-[12px]">UN COMTRADE</div>
              <div className="text-[11px] text-[#999]">International trade flows</div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
