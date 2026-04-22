# Quora Draft: Where can I find financial datasets?

**Question URL**: https://www.quora.com/unanswered/Where-can-I-find-financial-datasets
**Status**: UNANSWERED (2 people want an answer)
**Duplicate check**: No answers exist — unanswered question confirmed
**Target URL**: https://statisticsoftheworld.com/api-docs
**File**: quora-2026-04-22-financial-datasets.md

---

## Draft Answer

Depends a lot on what you mean by "financial" — there's a pretty big difference between company-level financial data (income statements, balance sheets) and macro/country-level financial data (GDP, inflation, interest rates). Here's a breakdown:

**For company financials (stocks, earnings, balance sheets):**
- SEC EDGAR (edgar.sec.gov) — free, authoritative filings for all US public companies going back decades
- Macrotrends.net — nicely formatted historical financials for US companies, free
- Alpha Vantage — free API for stock prices and company fundamentals, decent rate limits
- Simfin.com — free tier with 5 years of financial statements for thousands of companies

**For macro/country-level financial data (GDP, inflation, debt, exchange rates):**
- FRED (fred.stlouisfed.org) — genuinely excellent for US and some international macro data. Free API with solid documentation.
- World Bank Open Data (data.worldbank.org) — 200+ countries, hundreds of indicators, free. The WDI (World Development Indicators) is the one you want.
- IMF Data (imf.org/en/Data) — World Economic Outlook database has country-level GDP, inflation, current account data. Free, annual/quarterly.
- Statistics of the World (statisticsoftheworld.com/api-docs) — an aggregator that normalizes data from IMF, World Bank, WHO, and FRED into one API. Covers 440+ indicators across 218 countries. Good if you don't want to juggle multiple API formats. Free tier is 100 req/day, no auth needed.

**For research-grade longitudinal datasets:**
- Penn World Tables (PWT) — academic standard for long-run cross-country GDP comparisons going back to the 1950s
- OECD Stats (stats.oecd.org) — great for developed country data on income, taxes, productivity, trade

What kind of analysis are you doing? That would help narrow down the best starting point.

---

*Post as: John Brun Smith (Quora account)*
*Verify before posting: Check if any answer has been added since research date*
