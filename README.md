# Statistics of the World

**490+ economic indicators for 218 countries. Free data, free API.**

[statisticsoftheworld.com](https://statisticsoftheworld.com)

## What is this?

Statistics of the World (SOTW) is a free, open platform for exploring global economic data. We aggregate data from IMF, World Bank, FRED, Yahoo Finance, ECB, and Alpha Vantage into a single, searchable interface with a free REST API.

## Features

- **490+ indicators** across 27 categories: GDP, inflation, trade, population, labor, debt, and more
- **218 countries** with 20+ years of historical data
- **Live market data**: stocks, commodities, crypto, currencies, indices (real-time quotes)
- **Economic calendar**: upcoming releases with AI-powered actuals
- **Interactive visualizations**: heatmaps, scatter plots, world maps, rankings, country comparisons
- **Credit ratings**: sovereign ratings from all major agencies
- **Trade data**: bilateral trade flows between countries
- **Forecasts**: IMF/World Bank projections
- **Prediction markets**: Polymarket integration
- **AI chat**: Ask questions about any country's economy

## Free API

```bash
# Get GDP for all countries
curl https://statisticsoftheworld.com/api/v2/indicators/NY.GDP.MKTP.CD

# Get all indicators for Canada
curl https://statisticsoftheworld.com/api/v2/countries/CAN

# Get live stock quotes
curl https://statisticsoftheworld.com/api/v2/markets/quotes

# Search indicators
curl https://statisticsoftheworld.com/api/v2/search?q=inflation
```

**API tiers:**

| Tier | Rate Limit | Cost |
|------|-----------|------|
| Free | 100 req/day | $0 |
| Developer | 1,000 req/day | $9/mo |
| Pro | 10,000 req/day | $49/mo |
| Business | 100,000 req/day | $500/mo |

Get your API key: [statisticsoftheworld.com/pricing](https://statisticsoftheworld.com/pricing)

## Data Sources

| Source | Data |
|--------|------|
| [IMF](https://www.imf.org) | World Economic Outlook, IFS, DOTS |
| [World Bank](https://data.worldbank.org) | World Development Indicators |
| [FRED](https://fred.stlouisfed.org) | US economic data |
| [Yahoo Finance](https://finance.yahoo.com) | Stock quotes, commodities, crypto |
| [ECB](https://www.ecb.europa.eu) | Exchange rates |
| [Alpha Vantage](https://www.alphavantage.co) | Market data |

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Coolify on Hetzner VPS
- **ETL**: Python cron jobs (49 scheduled tasks)
- **API**: Next.js API routes with rate limiting

## MCP Endpoint

SOTW provides an MCP (Model Context Protocol) endpoint for AI agents:

```
https://statisticsoftheworld.com/api/mcp
```

## Links

- **Website**: [statisticsoftheworld.com](https://statisticsoftheworld.com)
- **API Docs**: [statisticsoftheworld.com/ai](https://statisticsoftheworld.com/ai)
- **Twitter/X**: [@sotwdata](https://x.com/sotwdata)
- **Bluesky**: [@sotwdata.bsky.social](https://bsky.app/profile/sotwdata.bsky.social)
- **Contact**: [statisticsoftheworld.com/contact](https://statisticsoftheworld.com/contact)

## License

All data is sourced from publicly available datasets. The platform and API are free to use.
