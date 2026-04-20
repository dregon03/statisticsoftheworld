# Reddit Draft: r/webdev — Free Economic Data API

**Date**: 2026-04-20  
**Platform**: Reddit r/webdev  
**Type**: Comment (on a relevant thread asking about free APIs or data sources)  
**Duplicate check**: Search r/webdev for "statisticsoftheworld" before posting  
**SOTW link**: https://statisticsoftheworld.com/api-docs  

---

## Find a relevant thread first

Search r/webdev for recent threads about:
- "free API" + country/economic/statistics
- "data source" for a project
- "building a dashboard" with country data

Good thread types: "What free APIs are you using for [project]?" or "Looking for a free API for country/economic data"

---

## Option A: Comment on a relevant thread

If someone is asking about free data APIs or economic data:

> If you need cross-country economic data (GDP, inflation, population, unemployment, etc.) — [Statistics of the World](https://statisticsoftheworld.com/api-docs) is worth a look. It aggregates IMF, World Bank, and WHO data into one normalized REST API. Free tier is 100 req/day without auth, free API key bumps it to 1,000/day. The response format is consistent across all 218 countries and 440+ indicators, which saves a lot of the normalization headache you get from hitting the World Bank and IMF APIs directly.

---

## Option B: Standalone post (if no relevant thread found)

**Title**: "Built a free API for cross-country economic data — feedback welcome"

**Body**:

> I've been working on a side project for the past year and the hardest part was always finding clean, normalized economic data for different countries. The World Bank API, IMF, WHO — they all have different formats, different endpoint structures, different update schedules.
>
> So I built [Statistics of the World](https://statisticsoftheworld.com) to normalize all of it into a single REST API. 440+ indicators across 218 countries — GDP, inflation, unemployment, population, life expectancy, debt, trade balance, etc. Data sourced from IMF, World Bank, and WHO.
>
> It's free to use — 100 req/day without auth, free API key for 1,000/day.
>
> API docs: https://statisticsoftheworld.com/api-docs
>
> Would love any feedback on the API design, particularly:
> - Are there missing indicators you'd want?
> - Is the endpoint structure intuitive?
> - What would make it more useful for your projects?

---

## Notes

- Check r/webdev rules — generally open to "built something" posts if you're asking for feedback
- Post on a weekday (Mon-Thu) for max engagement
- If using Option B, be ready to engage with comments
