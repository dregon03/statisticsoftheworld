# Reddit Draft: r/javascript — Free Economic Data API

**Date**: 2026-04-20  
**Platform**: Reddit r/javascript  
**Type**: Comment or post  
**Duplicate check**: Search r/javascript for "statisticsoftheworld" before posting  
**SOTW link**: https://statisticsoftheworld.com/api-docs  

---

## Find a relevant thread first

Search r/javascript for threads about:
- Free APIs for projects
- Fetch API examples with real data
- Building dashboards/charts with country data
- "What APIs are you using for [side project]?"

---

## Option A: Comment on a relevant thread

> If you need free economic/country data for a JavaScript project — [Statistics of the World API](https://statisticsoftheworld.com/api-docs) is clean and free. Returns JSON, no auth required for basic use (100 req/day), free key for 1,000/day. Covers 218 countries and 440+ indicators (GDP, inflation, population, etc.) pulled from IMF and World Bank sources.
>
> Simple fetch:
> ```js
> const res = await fetch('https://statisticsoftheworld.com/api/v1/country/US/indicator/gdp');
> const data = await res.json();
> ```
> 
> Good for dashboards, visualizations, or any project needing cross-country macro data without the headache of the World Bank's API format.

---

## Option B: Show r/javascript post (share as a resource)

**Title**: "Free REST API for 440+ economic indicators across 218 countries — built with Next.js"

**Body**:

> I built Statistics of the World (statisticsoftheworld.com) as a side project — it aggregates economic data from the IMF, World Bank, and WHO into a single normalized REST API.
>
> **Tech stack**: Next.js (App Router), Supabase, Hetzner, Coolify
>
> **What it does**:
> - 440+ indicators: GDP, inflation, unemployment, population, life expectancy, debt, trade balance
> - 218 countries
> - Free: 100 req/day without auth; free API key for 1,000/day
> - Clean JSON, consistent format across all countries and indicators
>
> API docs: https://statisticsoftheworld.com/api-docs
>
> The main pain point I was solving: the World Bank, IMF, and WHO APIs all have different formats and endpoint structures. Normalizing them into one interface that returns the same JSON shape regardless of the source saves a lot of headache when building dashboards.
>
> Happy to answer questions about the architecture or the data pipeline.

---

## Notes

- r/javascript allows "Show r/javascript" posts for projects built with JS/Node
- If posting Option B, mention the Next.js stack — this makes it more relevant to the sub
- Be ready to answer technical questions about the implementation
