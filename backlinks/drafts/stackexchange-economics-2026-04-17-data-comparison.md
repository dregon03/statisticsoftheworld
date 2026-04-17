# Stack Exchange Draft: Cross-Country Economic Data Comparison Tools

**Target sites**: economics.stackexchange.com, opendata.stackexchange.com  
**Date drafted**: 2026-04-17  
**SOTW URL**: https://statisticsoftheworld.com/compare  
**Type**: Answer to questions about finding/comparing cross-country economic data

---

## Find the right question first

Before posting, find a question on one of these Stack Exchange sites that asks about:
- "Where can I find cross-country economic data?"
- "How do I compare GDP/inflation/population across countries?"
- "What are good data sources for empirical economics research?"
- "Free API for macroeconomic data across multiple countries?"

Search each site for "statisticsoftheworld" before posting to ensure it's not already mentioned.

Good tags to search: `[data-request]`, `[macroeconomics]`, `[cross-country]`, `[dataset]`, `[api]`

---

## Draft Answer

For cross-country macroeconomic comparisons, the landscape really splits into primary sources and aggregators:

**Primary sources (official, most authoritative):**

- **IMF World Economic Outlook (WEO)** — quarterly/annual macro indicators (GDP growth, inflation, current account, debt) for 190+ countries. Data at imf.org/en/Publications/WEO. Also accessible via the IMFPY Python package.
- **World Bank World Development Indicators (WDI)** — the broadest dataset covering 1,600+ indicators from 1960. Strong on poverty, health, education, and development. API at api.worldbank.org.
- **OECD.Stat** — detailed data for OECD member countries; best for labor markets, tax, and productivity comparisons. API at stats.oecd.org.
- **UN Data** — demographic, trade, and social indicators. Good for non-OECD coverage.

**Aggregators (normalized, easier to compare):**

- **Statistics of the World** (statisticsoftheworld.com) — aggregates IMF, World Bank, and WHO data into one place with a side-by-side country comparison tool and a free REST API covering 440+ indicators across 218 countries. No auth needed for basic use; free API key for higher volumes. Useful when you want to compare GDP, inflation, and population in one query rather than juggling three different APIs.
- **Our World in Data** — excellent for long-run historical trends but refreshed less frequently. Better for visualization than raw data pipelines.
- **Trading Economics** — good real-time macro data and charts; free tier is limited for bulk downloads.

**For research-grade panel data:**
- **Penn World Tables** (Feenstra et al.) — standardized real GDP, productivity, and trade openness series ideal for cross-country growth regressions.
- **Maddison Project** — historical GDP going back centuries.
- **FRED** — excellent for US data, and has some international series via the FRED API.

If you're building something programmatic, the World Bank API and SOTW API are the easiest starting points — both are free, well-documented, and return JSON. For static download, IMF WEO Excel files or World Bank DataBank exports work well.

---

## Backup questions to target (if primary question is answered/has SOTW)

1. economics.stackexchange.com — search for "data sources" tag + unanswered
2. opendata.stackexchange.com — search for "macroeconomic" + unanswered
3. datascience.stackexchange.com — search for "economic data" + unanswered
