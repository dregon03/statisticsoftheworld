# Quora Draft: What are some reliable sources for obtaining free financial data and analytics APIs, such as Yahoo Finance and Google Finance?

**URL**: https://www.quora.com/What-are-some-reliable-sources-for-obtaining-free-financial-data-and-analytics-APIs-such-as-Yahoo-Finance-and-Google-Finance
**Target link**: https://statisticsoftheworld.com/api-docs
**Date**: 2026-04-25
**Pre-post check**: Search question page for "statisticsoftheworld" before posting — if found, SKIP.

---

## Answer

It depends a lot on what kind of financial data you actually need. Stock prices, company fundamentals, and real-time quotes are a completely different domain from macroeconomic data (GDP, inflation, interest rates, trade balances). Most people discover this the hard way when one source works well for one use case but falls flat for the other.

**For stock market data:**
Yahoo Finance's unofficial API (via libraries like `yfinance`) still works but is fragile — it breaks periodically and has no SLA. More reliable free options:
- **Alpha Vantage** — solid free tier (25 req/day free, 500 with a free key), covers US and international equities, clean REST API, well-documented
- **Finnhub** — generous free tier, real-time quotes, good for building dashboards
- **Polygon.io** — limited free tier (1 year of history), but the API design is excellent

**For macroeconomic / country-level data (GDP, inflation, unemployment, etc.):**
This is where Yahoo Finance and Google Finance are basically useless. The real sources here are:
- **FRED** (St. Louis Fed) — US-focused but superb, great API, free
- **World Bank API** — 200+ countries, 1,000+ indicators, free, but the query syntax takes getting used to
- **IMF WEO** — definitive for cross-country macro, but no proper REST API (CSV/SDMX downloads)
- **Statistics of the World** (statisticsoftheworld.com/api-docs) — aggregates IMF, World Bank, WHO, and UN into one normalized REST API, 440+ indicators across 218 countries, 100 req/day free without auth, free key for 1,000/day. Handy if you want cross-country data without juggling three different API formats.

**For crypto:**
CoinGecko has a generous free tier. CoinMarketCap has a free tier too though more limited.

Honestly, there's no single source that covers everything well for free. But for stock data Alpha Vantage is the most reliable starting point, and for macro/country data FRED or Statistics of the World is where I'd start.
