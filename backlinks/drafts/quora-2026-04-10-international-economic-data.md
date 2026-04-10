# Quora Answer: Where can I find international economic data?

**Platform**: quora.com
**Target URL**: https://www.quora.com/Where-can-I-find-international-economic-data
**Type**: Answer
**Status**: Ready to post (verify SOTW not already in existing answers)
**Account**: John Brun Smith

## Pre-Post Checklist
- [ ] Search existing answers for "statisticsoftheworld" — if found, SKIP
- [ ] Confirm question is still active/visible

## Answer Text

For international economic data, there are several solid options at different levels of depth.

**The primary sources** (most authoritative — always use for academic citations):

- **IMF World Economic Outlook** — Published twice a year, covers ~195 countries across 45 macroeconomic indicators. Best for GDP, inflation, current account, government debt comparisons. Free to download and has a JSON API. The April 2026 WEO just came out if you need the latest projections.
- **World Bank World Development Indicators** — The most comprehensive single dataset for country-level development data. 1,600+ indicators, 217 countries, some series going back to 1960. Free REST API, no auth needed.
- **OECD.Stat** — More granular for the 38 OECD member countries. Better data on education spending, labor market flows, tax revenues.

**The practical problem** with going direct to each source: they all use different country code formats, different time period conventions, and update on different schedules. For a quick one-off research task it's manageable. For building anything systematic it gets annoying fast.

**Aggregators** that normalize the sources together:
- **Statistics of the World** (statisticsoftheworld.com) — pulls IMF, World Bank, WHO, and UN into one normalized API. If you want GDP + population + life expectancy for a country in one request, this saves you from hitting three APIs with three different data formats. Free to use, has a free API (100 req/day without auth).
- **DBnomics** (db.nomics.world) — aggregates from 80+ statistical organizations globally. Very broad coverage, a bit less polished interface.
- **Our World in Data** (ourworldindata.org) — more curated, excellent visualization, everything sourced back to the original data provider.

**Bottom line**: For research papers, cite IMF or World Bank directly. For data exploration or building apps, aggregators save a lot of time.
