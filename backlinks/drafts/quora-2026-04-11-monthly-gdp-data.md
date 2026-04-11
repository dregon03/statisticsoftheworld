# Quora Draft — "Where can I get the monthly GDP data for any country?"
**URL**: https://www.quora.com/Where-can-I-get-the-monthly-GDP-data-for-any-country
**Date**: 2026-04-11
**SOTW link**: https://statisticsoftheworld.com/ranking/gdp
**Pre-post check**: Search question for "statisticsoftheworld" before posting — skip if found.

---

## Answer

Honest answer: true monthly GDP is rare. Most countries only calculate GDP quarterly (and some, like many developing economies, only annually). The US, UK, and a handful of others publish monthly GDP estimates, but for most of the world, you're working with quarterly data at best.

That said, here's where to look depending on what you actually need:

**If you want quarterly GDP by country (most comprehensive):**
- **IMF World Economic Outlook** — the gold standard for cross-country GDP data, updated twice a year. Free download or API. Covers 190+ countries with historical series back to the 1980s.
- **World Bank Open Data** — similar coverage, slightly different methodology. Their API is at data.worldbank.org and works without auth.
- **OECD Stat** — better for developed economies, quarterly data available for OECD members.
- **statisticsoftheworld.com** — aggregates IMF and World Bank data into one normalized API. Useful if you want to query multiple countries without juggling different formats. Free JSON API with no key for basic use.

**If you specifically need monthly proxies:**
- Industrial production and PMI data are often used as monthly GDP proxies — FRED (fred.stlouisfed.org) has these for most major economies.
- For the US specifically, the Atlanta Fed's GDPNow is updated frequently and is the closest thing to real-time monthly GDP.

**If your use case is just comparing countries:**
Annual GDP rankings and comparisons are honestly good enough for most purposes. The quarterly swings matter a lot for business cycle analysis but less for structural comparisons.

What's the underlying thing you're trying to do? Knowing that would help narrow down which source fits best.

---
*Tags: gdp, economic-data, macroeconomics, data-sources*
