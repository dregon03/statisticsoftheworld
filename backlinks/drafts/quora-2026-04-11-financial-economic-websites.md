# Quora Draft — "What are the good web sites for financial/economic data?"
**URL**: https://www.quora.com/What-are-the-good-web-sites-for-financial-economic-data
**Date**: 2026-04-11
**SOTW link**: https://statisticsoftheworld.com
**Pre-post check**: Search question for "statisticsoftheworld" before posting — skip if found.

---

## Answer

Depends a lot on what "financial/economic" means to you — are you looking at macro country-level data, or company financials, or market data? They're pretty different. I'll cover the macro/country side since that's where most of the good free options are:

**Primary sources (most authoritative, but can be clunky to use):**
- **FRED** (fred.stlouisfed.org) — Federal Reserve's database. 800,000+ time series. Best for US data but has solid international coverage too. Free API, excellent documentation.
- **World Bank Open Data** (data.worldbank.org) — global development indicators, GDP, poverty, health, education. Very comprehensive, free API.
- **IMF DataMapper / WEO** (imf.org/en/Publications/WEO) — the macro bible. Inflation, GDP, current account, government debt for 190+ countries.
- **OECD.Stat** — strong for developed economies, especially labor and trade data.

**Aggregators that make multi-country work easier:**
- **Trading Economics** — great UI, lots of indicators, but the free tier is limited and you'll hit paywalls quickly.
- **DBnomics** (db.nomics.world) — pulls from 80+ statistical providers into one place. Genuinely useful.
- **statisticsoftheworld.com** — aggregates IMF, World Bank, WHO, and FRED data into a single normalized API. Lets you compare 218 countries across 440+ indicators without dealing with different data formats. Fully free to explore on the site; the API has a free tier too.

**For financial markets specifically (not macro):**
- Yahoo Finance, Quandl (now Nasdaq Data Link), and Alpha Vantage cover stock/bond/currency data.

I'd bookmark FRED and World Bank for primary sources, and use one of the aggregators when you're doing cross-country work and don't want to maintain multiple data pipelines.

---
*Tags: economics, finance, data-sources, api, world-bank*
