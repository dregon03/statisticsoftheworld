import { INDICATORS, CATEGORIES } from '@/lib/data';

export async function GET() {
  const categoryCounts: Record<string, number> = {};
  for (const ind of INDICATORS) {
    categoryCounts[ind.category] = (categoryCounts[ind.category] || 0) + 1;
  }

  const categoryList = CATEGORIES
    .filter(c => categoryCounts[c])
    .map(c => `  - ${c} (${categoryCounts[c]} indicators)`)
    .join('\n');

  const text = `# Statistics of the World

> Free global statistics platform. 443 indicators across 27 categories for 218 countries.
> Data from IMF, World Bank, UN, WHO, FRED, Yahoo Finance, ECB.
> https://statisticsoftheworld.com

## What This Site Provides

Statistics of the World is a free, open data platform for international economic, social, and environmental statistics. It aggregates data from major international organizations (IMF World Economic Outlook, World Bank WDI, United Nations, WHO Global Health Observatory) and financial data providers (FRED, Yahoo Finance, ECB).

All data is free. No paywall. No login required for browsing.

## Data Coverage

- **Countries:** 218 (all UN member states + territories)
- **Indicators:** ${INDICATORS.length}
- **Categories:** ${CATEGORIES.filter(c => categoryCounts[c]).length}
- **Historical depth:** 20+ years for most indicators (1960+ for many World Bank series)
- **Update frequency:** Weekly (IMF/WB), Daily (markets/commodities/FX)
- **Data points:** 1.14 million annual + 55,000 monthly/quarterly

## Categories

${categoryList}

## Free API

Base URL: https://statisticsoftheworld.com

### Endpoints

- GET /api/v1/countries — List all 218 countries with metadata
- GET /api/v1/countries/:id — All latest indicator values for a country (e.g. /api/v1/countries/USA)
- GET /api/v1/indicators — List all indicators with categories
- GET /api/v1/indicators/:id — Ranked list of countries for an indicator
- GET /api/v1/rankings/:indicator — Ranked countries (supports ?limit=N)
- GET /api/v1/history/:indicator/:country — 20+ years of historical data

### Authentication

- Anonymous: 100 requests/day (no key needed)
- Developer: 1,000 requests/day (free API key via /api/keys)

### Example Requests

\`\`\`
# Get US GDP data
curl https://statisticsoftheworld.com/api/v1/countries/USA

# Top countries by population
curl https://statisticsoftheworld.com/api/v1/rankings/SP.POP.TOTL?limit=10

# Canada GDP history
curl https://statisticsoftheworld.com/api/v1/history/IMF.NGDPD/CAN
\`\`\`

## Key Pages

- / — Homepage with live counters, rankings, tools
- /countries — Browse all 218 countries
- /indicators — All indicators with chart/table views
- /compare — Side-by-side country comparison
- /map — Choropleth world map for any indicator
- /scatter — Gapminder-style scatter plots
- /heatmap — Country × indicator color matrix
- /ranking/:slug — SEO-friendly rankings (gdp, population, inflation-rate, etc.)
- /calendar — Economic calendar (FRED + Finnhub + central bank meetings)
- /forecasts — IMF 2-year projections
- /trade — UN COMTRADE trade explorer
- /commodities — Live commodity prices
- /markets — Stock indices, currencies
- /credit-ratings — S&P/Moody's/Fitch ratings
- /chart/:country/:indicator — Historical chart pages
- /country/:id — Country overview with AI narrative
- /country/:id/:indicator — Indicator detail with historical data
- /api-docs — API documentation
- /llms-full.txt — Complete indicator catalog for LLMs

## Data Sources

| Source | Coverage | Update Frequency |
|--------|----------|-----------------|
| IMF World Economic Outlook | GDP, inflation, debt, unemployment | Quarterly |
| World Bank WDI | 300+ development indicators | Annual |
| United Nations | Population, trade, development | Annual |
| WHO Global Health Observatory | 30+ health indicators | Annual |
| FRED (Federal Reserve) | US economy, bonds, rates | Daily |
| Yahoo Finance | Stock indices, commodities, FX | Real-time (15-min delayed) |
| ECB | European exchange rates | Daily |
| UN COMTRADE | International trade flows | Annual |

## Contact

Website: https://statisticsoftheworld.com
API Docs: https://statisticsoftheworld.com/api-docs
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
