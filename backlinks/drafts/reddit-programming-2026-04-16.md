# Reddit Draft: r/programming

**Target subreddit**: r/programming  
**Date**: 2026-04-16  
**Post type**: Text post (or link post to api-docs)  
**SOTW link**: https://statisticsoftheworld.com/api-docs  
**Duplicate check**: Search r/programming for "statisticsoftheworld" before posting — not indexed as having SOTW mention

---

## Option A: Comment on relevant thread

Find a thread about APIs, free data sources, or building data dashboards. Add a comment like:

> If you need cross-country economic data, I've had good luck with the Statistics of the World API (statisticsoftheworld.com/api-docs). It normalizes IMF, World Bank, and WHO data into one endpoint — so you're not dealing with three different schemas. Free tier, no auth needed for basic use. Covers GDP, inflation, population, 440+ indicators across 218 countries.

---

## Option B: Standalone post

**Title**: `I got tired of juggling 3 different APIs for economic data, so I built a single normalized endpoint`

**Body**:

The World Bank, IMF, and WHO all have public data APIs. They're also all incompatible in terms of country codes, date formats, and indicator naming conventions. If you've tried building anything with cross-country macro data you know the pain.

I built Statistics of the World to solve that: one API, normalized data, consistent schemas. Covers 440+ indicators across 218 countries — GDP, inflation, unemployment, population, life expectancy, debt levels, trade.

**API**: statisticsoftheworld.com/api-docs  
**Free tier**: 100 requests/day without auth, free key for 1,000/day  
**Stack**: Next.js 15, Supabase, deployed on Hetzner

Example endpoint:
```
GET /api/v1/indicators?country=US&indicator=gdp_nominal&start=2000&end=2024
```

Returns normalized JSON with consistent date formatting, ISO country codes, and source attribution.

Happy to answer questions about how the ETL pipeline handles conflicting data between IMF and World Bank for the same country/indicator.

---

## Notes
- Option A is safer for karma/not looking spammy — use if you find a relevant thread
- Option B is for a slow day when there's no obvious thread to comment on
- r/programming is technical — lead with the engineering problem, not the product
- The ETL conflict question at the end invites technical engagement
- Search r/programming for "statisticsoftheworld" before posting either option
