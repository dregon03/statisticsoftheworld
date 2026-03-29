import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Integration — Build with SOTW Data',
  description: 'MCP Server, REST API, and free data for AI agents. Global statistics, live markets, commodities, currencies, and prediction markets.',
};

function EndpointCard({ method, path, desc, example }: { method: string; path: string; desc: string; example: string }) {
  return (
    <div className="border border-[#d5dce6] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#f4f6f9] border-b border-[#d5dce6]">
        <span className={`text-[15px] font-bold tracking-wide px-2.5 py-1 rounded-md text-white ${method === 'POST' ? 'bg-[#16a34a]' : 'bg-[#0d1b2a]'}`}>{method}</span>
        <code className="text-[15px] font-mono text-[#0d1b2a] font-semibold">{path}</code>
      </div>
      <div className="px-5 py-4">
        <p className="text-[15px] text-[#555] mb-3 leading-relaxed">{desc}</p>
        <pre className="bg-[#0d1b2a] text-[#e2e8f0] text-[15px] p-4 rounded-lg overflow-x-auto leading-relaxed">
          <code>{example}</code>
        </pre>
      </div>
    </div>
  );
}

function SectionHeader({ color, title, count }: { color: string; title: string; count?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-10">
      <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: color }} />
      <h3 className="text-[20px] font-bold text-[#0d1b2a]">{title}</h3>
      {count && <span className="text-[15px] text-[#7a8599] bg-[#edf0f5] px-3 py-1 rounded-full font-medium">{count}</span>}
    </div>
  );
}

export default function AIPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#333]">
      <Nav />

      {/* Hero — dark navy, distinctive SOTW identity */}
      <section className="bg-[#0d1b2a] text-white">
        <div className="max-w-[960px] mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[15px] font-medium tracking-wide text-white/80">Free &middot; No Auth Required</span>
          </div>
          <h1 className="text-[40px] font-extrabold mb-4 tracking-tight leading-tight">
            Build with <span className="text-[#60a5fa]">SOTW</span> Data
          </h1>
          <p className="text-[18px] text-white/70 max-w-[640px] mx-auto leading-relaxed">
            Global statistics, live markets, 49 commodities, 40+ currencies, and prediction markets — all free via API. Multiple integration methods.
          </p>
        </div>
      </section>

      <div className="max-w-[960px] mx-auto px-6 py-12">

        {/* Quick start cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-14">
          {[
            { icon: '🤖', title: 'MCP Server', desc: 'For Claude Desktop, Claude Code, and MCP-compatible agents' },
            { icon: '⚡', title: 'REST API', desc: '25+ endpoints for country data, markets, predictions, and more' },
            { icon: '💬', title: 'Natural Language', desc: 'Ask questions in plain English via /api/chat' },
            { icon: '📄', title: 'AI Discovery', desc: 'llms.txt, OpenAPI 3.1, and GPT plugin manifest' },
          ].map(card => (
            <div key={card.title} className="bg-white border border-[#d5dce6] rounded-xl p-6 hover:shadow-md hover:border-[#b0bdd0] transition-all">
              <div className="text-[24px] mb-3">{card.icon}</div>
              <div className="text-[17px] font-bold text-[#0d1b2a] mb-1.5">{card.title}</div>
              <div className="text-[14px] text-[#7a8599] leading-relaxed">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* MCP Server */}
        <section className="mb-14">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-2 flex items-center gap-3">
            <span className="text-[20px]">🤖</span> MCP Server
          </h2>
          <p className="text-[16px] text-[#555] mb-6 leading-relaxed">
            The Model Context Protocol (MCP) lets AI agents like Claude directly query SOTW data.
            Two options: hosted remote server or local npm package.
          </p>

          <h3 className="text-[18px] font-bold text-[#0d1b2a] mb-3">Option 1: Remote MCP (Recommended)</h3>
          <p className="text-[15px] text-[#555] mb-3">
            Point your MCP client at our hosted endpoint. No installation needed.
          </p>
          <pre className="bg-[#0d1b2a] text-[#e2e8f0] text-[14px] p-5 rounded-xl overflow-x-auto mb-6 leading-relaxed">
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

          <h3 className="text-[18px] font-bold text-[#0d1b2a] mb-3">Option 2: Local MCP Server</h3>
          <pre className="bg-[#0d1b2a] text-[#e2e8f0] text-[14px] p-5 rounded-xl overflow-x-auto mb-6 leading-relaxed">
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

          <h3 className="text-[18px] font-bold text-[#0d1b2a] mb-3">Available Tools (7)</h3>
          <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-[15px]">
              <thead>
                <tr className="text-left text-[14px] text-[#7a8599] uppercase tracking-wider border-b border-[#d5dce6] bg-[#f4f6f9]">
                  <th className="px-5 py-3.5 font-semibold">Tool</th>
                  <th className="px-5 py-3.5 font-semibold">Description</th>
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
                  <tr key={name} className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-5 py-3 font-mono text-[14px] text-[#0d1b2a] font-semibold">{name}</td>
                    <td className="px-5 py-3 text-[#555]">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* REST API */}
        <section className="mb-14">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-2 flex items-center gap-3">
            <span className="text-[20px]">⚡</span> REST API
          </h2>
          <p className="text-[16px] text-[#555] mb-2 leading-relaxed">
            All endpoints are free, return JSON, and require no authentication.
            Add <code className="bg-[#edf0f5] text-[#0d1b2a] px-2 py-0.5 rounded-md text-[14px] font-semibold">format=markdown</code> to v2 endpoints for LLM-friendly output.
          </p>

          {/* Country Data */}
          <SectionHeader color="#2563eb" title="Country Data" count="443 indicators · 218 countries" />
          <div className="space-y-4">
            <EndpointCard method="GET" path="/api/v2/country/:id" desc="All indicators for a country with AI narrative and suggested follow-ups" example="curl https://statisticsoftheworld.com/api/v2/country/USA?format=markdown" />
            <EndpointCard method="GET" path="/api/v2/indicator/:id" desc="Country rankings by indicator with metadata and related indicators" example='curl "https://statisticsoftheworld.com/api/v2/indicator/IMF.NGDPD?limit=10&order=desc"' />
            <EndpointCard method="GET" path="/api/v2/history" desc="Historical time series (20+ years) with YoY, CAGR, min/max stats" example='curl "https://statisticsoftheworld.com/api/v2/history?indicator=IMF.NGDPD&country=USA"' />
            <EndpointCard method="GET" path="/api/v1/search" desc="Search indicators by keyword" example='curl "https://statisticsoftheworld.com/api/v1/search?q=gdp"' />
            <EndpointCard method="GET" path="/api/v1/compare" desc="Compare 2-10 countries side by side" example='curl "https://statisticsoftheworld.com/api/v1/compare?countries=USA,CHN,JPN"' />
            <EndpointCard method="GET" path="/api/v1/countries" desc="List all 218 countries with region, income level, capital" example="curl https://statisticsoftheworld.com/api/v1/countries" />
            <EndpointCard method="GET" path="/api/v1/indicators" desc="List all 443 indicators with categories" example="curl https://statisticsoftheworld.com/api/v1/indicators" />
            <EndpointCard method="POST" path="/api/chat" desc="Natural language query — ask anything about global statistics" example={`curl -X POST https://statisticsoftheworld.com/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message":"top 5 countries by GDP per capita"}'`} />
          </div>

          {/* Live Markets */}
          <SectionHeader color="#059669" title="Live Markets" count="25 indices · 49 commodities · 40+ FX" />
          <div className="space-y-4">
            <EndpointCard method="GET" path="/api/quotes" desc="Live prices for stock indices (25 countries), US futures, commodities, and FX pairs" example="curl https://statisticsoftheworld.com/api/quotes" />
            <EndpointCard method="GET" path="/api/index-chart" desc="Stock index chart data with configurable time range" example='curl "https://statisticsoftheworld.com/api/index-chart?id=YF.IDX.USA&range=1mo"' />
            <EndpointCard method="GET" path="/api/commodity-chart" desc="Commodity price chart data (Yahoo Finance)" example='curl "https://statisticsoftheworld.com/api/commodity-chart?id=YF.GOLD&range=3mo"' />
            <EndpointCard method="GET" path="/api/china-quotes" desc="Chinese commodity futures — 16 symbols from SHFE, DCE, ZCE exchanges" example="curl https://statisticsoftheworld.com/api/china-quotes" />
            <EndpointCard method="GET" path="/api/china-chart" desc="Chinese commodity chart data (Sina Finance)" example='curl "https://statisticsoftheworld.com/api/china-chart?id=SINA.COPPER&range=1mo"' />
            <EndpointCard method="GET" path="/api/fx-chart" desc="Currency pair chart data" example='curl "https://statisticsoftheworld.com/api/fx-chart?pair=EURUSD&range=1d"' />
            <EndpointCard method="GET" path="/api/futures-curve" desc="Futures term structure / forward curve" example='curl "https://statisticsoftheworld.com/api/futures-curve?id=YF.CRUDE_OIL"' />
          </div>

          {/* Prediction Markets */}
          <SectionHeader color="#7c3aed" title="Prediction Markets" count="Polymarket" />
          <div className="space-y-4">
            <EndpointCard method="GET" path="/api/predictions" desc="Real-money prediction markets with probability, volume, liquidity. Filter by category or search." example='curl "https://statisticsoftheworld.com/api/predictions?limit=20&category=Elections+%26+Politics"' />
          </div>

          {/* Economic Calendar */}
          <SectionHeader color="#dc2626" title="Economic Calendar" count="ForexFactory" />
          <div className="space-y-4">
            <EndpointCard method="GET" path="/api/calendar" desc="Upcoming economic events — GDP releases, CPI, FOMC, NFP, and more" example="curl https://statisticsoftheworld.com/api/calendar" />
          </div>

          {/* Trade Data */}
          <SectionHeader color="#ea580c" title="Trade Data" count="UN COMTRADE" />
          <div className="space-y-4">
            <EndpointCard method="GET" path="/api/trade" desc="Bilateral trade flows — top import/export partners and product breakdown" example='curl "https://statisticsoftheworld.com/api/trade?country=USA"' />
          </div>

          {/* Analytics */}
          <SectionHeader color="#0891b2" title="Analytics" />
          <div className="space-y-4">
            <EndpointCard method="GET" path="/api/forecasts" desc="IMF 2-year forecasts for GDP growth, inflation, unemployment, etc." example='curl "https://statisticsoftheworld.com/api/forecasts?indicator=IMF.NGDP_RPCH"' />
            <EndpointCard method="GET" path="/api/correlations" desc="Cross-indicator correlations (r-value, r-squared, sample size)" example="curl https://statisticsoftheworld.com/api/correlations" />
            <EndpointCard method="GET" path="/api/heatmap" desc="Multi-indicator country heatmap data with preset categories" example="curl https://statisticsoftheworld.com/api/heatmap" />
            <EndpointCard method="GET" path="/api/sparklines" desc="10-year sparkline data for any indicator across all countries" example='curl "https://statisticsoftheworld.com/api/sparklines?indicator=IMF.NGDP_RPCH"' />
            <EndpointCard method="GET" path="/api/stock-profiles" desc="Stock profiles — sector, industry, market cap for S&amp;P 500, NASDAQ 100, etc." example="curl https://statisticsoftheworld.com/api/stock-profiles" />
          </div>

          {/* Chart range note */}
          <div className="mt-8 bg-white border border-[#d5dce6] rounded-xl p-5 text-[14px] text-[#555] shadow-sm">
            <span className="font-bold text-[#0d1b2a]">Chart ranges:</span> All chart endpoints accept{' '}
            <code className="bg-[#edf0f5] px-1.5 py-0.5 rounded-md font-semibold text-[#0d1b2a]">range</code> parameter with values:{' '}
            {['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y', 'max'].map((r, i) => (
              <span key={r}>
                {i > 0 && ', '}
                <code className="bg-[#edf0f5] px-1.5 py-0.5 rounded-md text-[#0d1b2a]">{r}</code>
              </span>
            ))}
          </div>
        </section>

        {/* OpenAPI / GPT Actions */}
        <section className="mb-14">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-2">OpenAPI & GPT Actions</h2>
          <p className="text-[16px] text-[#555] mb-5 leading-relaxed">
            Use our OpenAPI 3.1 spec with any AI framework — LangChain, CrewAI, AutoGen, GPT Actions, and more.
          </p>
          <div className="flex gap-4 mb-6">
            <a href="/api/openapi.json" target="_blank" className="px-5 py-2.5 bg-[#0d1b2a] text-white rounded-xl text-[15px] font-semibold hover:bg-[#162d4a] transition-colors">
              OpenAPI Spec
            </a>
            <a href="/.well-known/ai-plugin.json" target="_blank" className="px-5 py-2.5 bg-white border border-[#d5dce6] rounded-xl text-[15px] font-semibold text-[#0d1b2a] hover:bg-[#f4f6f9] transition-colors">
              GPT Plugin Manifest
            </a>
          </div>
          <pre className="bg-[#0d1b2a] text-[#e2e8f0] text-[14px] p-5 rounded-xl overflow-x-auto leading-relaxed">
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

        {/* AI Discovery Files */}
        <section className="mb-14">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-2">AI Discovery Files</h2>
          <p className="text-[16px] text-[#555] mb-5 leading-relaxed">
            Machine-readable files for AI crawlers and answer engines.
          </p>
          <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-[15px]">
              <tbody>
                <tr className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[14px]">
                    <a href="/llms.txt" className="text-[#2563eb] font-semibold hover:underline">/llms.txt</a>
                  </td>
                  <td className="px-5 py-3.5 text-[#555]">Site overview, all API endpoints, data coverage, key IDs</td>
                </tr>
                <tr className="border-b border-[#edf0f5] hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[14px]">
                    <a href="/api/openapi.json" className="text-[#2563eb] font-semibold hover:underline">/api/openapi.json</a>
                  </td>
                  <td className="px-5 py-3.5 text-[#555]">OpenAPI 3.1 specification</td>
                </tr>
                <tr className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[14px]">
                    <a href="/.well-known/ai-plugin.json" className="text-[#2563eb] font-semibold hover:underline">/.well-known/ai-plugin.json</a>
                  </td>
                  <td className="px-5 py-3.5 text-[#555]">GPT Actions / ChatGPT plugin manifest</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Key IDs */}
        <section className="mb-14">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-6">Key IDs Reference</h2>

          <div className="bg-white border border-[#d5dce6] rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#2563eb] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-[#2563eb]" />
              Country Indicators
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
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
                <div key={id} className="flex items-center gap-3 py-1.5">
                  <code className="text-[15px] bg-[#eff6ff] px-2 py-1 rounded-md text-[#2563eb] font-semibold shrink-0">{id}</code>
                  <span className="text-[#555]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#d5dce6] rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#059669] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-[#059669]" />
              Stock Index IDs
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
              {[
                ['YF.IDX.USA', 'S&P 500 (United States)'],
                ['YF.IDX.GBR', 'FTSE 100 (United Kingdom)'],
                ['YF.IDX.DEU', 'DAX (Germany)'],
                ['YF.IDX.JPN', 'Nikkei 225 (Japan)'],
                ['YF.IDX.CHN', 'SSE Composite (China)'],
                ['YF.IDX.IND', 'BSE Sensex (India)'],
                ['YF.IDX.CAN', 'TSX Composite (Canada)'],
                ['YF.IDX.AUS', 'ASX 200 (Australia)'],
                ['YF.IDX.KOR', 'KOSPI (South Korea)'],
                ['YF.IDX.BRA', 'Bovespa (Brazil)'],
                ['YF.FUT.SP500', 'S&P 500 Futures'],
                ['YF.FUT.NASDAQ', 'NASDAQ Futures'],
              ].map(([id, label]) => (
                <div key={id} className="flex items-center gap-3 py-1.5">
                  <code className="text-[15px] bg-[#ecfdf5] px-2 py-1 rounded-md text-[#059669] font-semibold shrink-0">{id}</code>
                  <span className="text-[#555]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#d5dce6] rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#d97706] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-[#d97706]" />
              Commodity IDs
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
              {[
                ['YF.GOLD', 'Gold'],
                ['YF.SILVER', 'Silver'],
                ['YF.CRUDE_OIL', 'WTI Crude Oil'],
                ['YF.BRENT', 'Brent Crude'],
                ['YF.NATGAS', 'Natural Gas'],
                ['YF.COPPER', 'Copper'],
                ['YF.WHEAT', 'Wheat'],
                ['YF.CORN', 'Corn'],
                ['YF.SOYBEANS', 'Soybeans'],
                ['YF.COFFEE', 'Coffee'],
                ['SINA.COPPER', 'Copper (SHFE, China)'],
                ['SINA.IRON_ORE_CN', 'Iron Ore (DCE, China)'],
              ].map(([id, label]) => (
                <div key={id} className="flex items-center gap-3 py-1.5">
                  <code className="text-[15px] bg-[#fffbeb] px-2 py-1 rounded-md text-[#d97706] font-semibold shrink-0">{id}</code>
                  <span className="text-[#555]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#d5dce6] rounded-xl p-6 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#7c3aed] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-[#7c3aed]" />
              FX Pairs & Prediction Categories
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px] mb-5">
              {[
                ['EURUSD', 'Euro / US Dollar'],
                ['USDJPY', 'US Dollar / Japanese Yen'],
                ['GBPUSD', 'British Pound / US Dollar'],
                ['USDCAD', 'US Dollar / Canadian Dollar'],
                ['AUDUSD', 'Australian Dollar / US Dollar'],
                ['USDCNY', 'US Dollar / Chinese Yuan'],
              ].map(([id, label]) => (
                <div key={id} className="flex items-center gap-3 py-1.5">
                  <code className="text-[15px] bg-[#f5f3ff] px-2 py-1 rounded-md text-[#7c3aed] font-semibold shrink-0">{id}</code>
                  <span className="text-[#555]">{label}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#edf0f5] pt-4 text-[14px] text-[#555]">
              <span className="font-bold text-[#0d1b2a]">Prediction categories:</span>{' '}
              Central Banks & Rates, Recession & Growth, Inflation & Prices, Elections & Politics,
              Geopolitics & Conflict, Trade & Tariffs, Crypto & Markets, Global Events
            </div>
          </div>
        </section>

        {/* Example AI Workflows */}
        <section className="mb-14">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-6">Example AI Workflows</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What is the current gold price and how has it performed this year?',
                steps: 'GET /api/quotes → filter YF.GOLD, then GET /api/commodity-chart?id=YF.GOLD&range=1y',
              },
              {
                q: 'Compare GDP growth forecasts for G7 countries',
                steps: 'GET /api/v1/compare?countries=USA,CAN,GBR,FRA,DEU,ITA,JPN&indicators=IMF.NGDP_RPCH',
              },
              {
                q: 'What do prediction markets say about a US recession?',
                steps: 'GET /api/predictions?category=Recession+%26+Growth',
              },
              {
                q: 'What economic data releases are coming this week?',
                steps: 'GET /api/calendar',
              },
              {
                q: 'Which countries are the top trading partners of Germany?',
                steps: 'GET /api/trade?country=DEU',
              },
            ].map(({ q, steps }) => (
              <div key={q} className="bg-white border border-[#d5dce6] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[16px] font-semibold text-[#0d1b2a] mb-2">&ldquo;{q}&rdquo;</div>
                <div className="text-[14px] text-[#7a8599] font-mono">{steps}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section className="mb-4">
          <h2 className="text-[24px] font-bold text-[#0d1b2a] mb-6">Data Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[15px]">
            {[
              ['IMF WEO', 'GDP, inflation, debt, fiscal'],
              ['World Bank WDI', '300+ development indicators'],
              ['United Nations', 'Population, trade, SDGs'],
              ['WHO GHO', '30+ health indicators'],
              ['FRED', 'US economy, bonds, rates'],
              ['Yahoo Finance', 'Indices, commodities, FX'],
              ['Sina Finance', 'Chinese commodity futures'],
              ['Polymarket', 'Prediction markets'],
              ['ForexFactory', 'Economic calendar'],
              ['ECB', 'European exchange rates'],
              ['UN COMTRADE', 'Bilateral trade flows'],
              ['Finnhub', 'Stock market data'],
            ].map(([name, desc]) => (
              <div key={name} className="bg-white border border-[#d5dce6] rounded-xl p-4 shadow-sm">
                <div className="font-bold text-[#0d1b2a] text-[14px]">{name}</div>
                <div className="text-[15px] text-[#7a8599] mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
