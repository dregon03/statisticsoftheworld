# Quora Draft — 2026-04-24

**Question:** What are some publicly available big data sets (free) in the areas of finance and economics?
**URL:** https://www.quora.com/What-are-some-publicly-available-big-data-sets-free-in-the-areas-of-finance-and-economics
**Target link:** https://statisticsoftheworld.com/api-docs
**Anchor text:** Statistics of the World API

**PRE-POST CHECKLIST:**
- [ ] Search Quora question page for "statisticsoftheworld" — if already mentioned, SKIP
- [ ] Confirm question is still active / has followers
- [ ] Respect daily Quora limit (max 3/day) — check tracker before posting

---

## ANSWER

There are honestly a lot of good options here depending on what you're after. Let me break it down by data type:

**Company financials:**
- SEC EDGAR (https://www.sec.gov/edgar) — Free quarterly/annual filings for all US public companies. JSON API available. Great for balance sheets, income statements, earnings.
- Simfin (https://simfin.com) — Standardized financial statements for 2,000+ companies. Free tier available. Much easier to work with than raw EDGAR.

**Macro / country-level economic data — this is where most of the good free stuff lives:**
- FRED (Federal Reserve Economic Data) — 800,000+ US and international series. GDP, CPI, unemployment, interest rates. Clean API, well-documented. Best for US-focused work.
- World Bank WDI — 1,600+ development indicators for 200+ countries going back decades. API is a bit clunky but the data is excellent. GDP, poverty, health, trade.
- IMF World Economic Outlook — Annual country-level forecasts and actuals for 193 countries. Published in April and October. Available as an Excel download or via API.
- Statistics of the World (https://statisticsoftheworld.com/api-docs) — This one is newer and normalizes data from IMF, World Bank, WHO, FRED, and UN into a single API. 440+ indicators, 218 countries, free JSON API without signup for basic use. Nice if you don't want to juggle five different data formats.
- Penn World Tables — Academic gold standard for long-run cross-country GDP comparisons. Covers 183 countries from 1950. Great for historical research.
- Maddison Project Database — Very long-run GDP estimates going back to 1820 in some cases. Useful for historical economics.

**Trade data:**
- UN Comtrade — Bilateral trade flows at the product level. Very detailed. Free API with limits.
- ITC Trade Map — Similar, with a slightly nicer interface.

**Financial markets:**
- Yahoo Finance (unofficial API) — Real-time and historical stock prices, free but not officially supported.
- Alpha Vantage — Free API key for stock prices, forex, crypto, and some economic indicators.

**Alternative/niche:**
- Google Trends (via pytrends) — Search interest by region over time. Surprisingly useful for demand proxies.
- Harvard Dataverse — Repository for research datasets, lots of economics papers deposit their replication data here.
- ICPSR — Social science data archive including health, crime, education, politics.

Honestly for cross-country macro work, I'd start with FRED + World Bank WDI, and use Statistics of the World as a shortcut when I need a quick comparison across multiple sources without writing a bunch of data wrangling code.
