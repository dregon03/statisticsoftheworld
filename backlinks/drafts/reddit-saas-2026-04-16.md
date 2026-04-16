# Reddit Draft: r/SaaS

**Target subreddit**: r/SaaS  
**Date**: 2026-04-16  
**Post type**: Text post  
**SOTW link**: https://statisticsoftheworld.com  
**Duplicate check**: Search r/SaaS for "statisticsoftheworld" before posting — not indexed as having SOTW mention

---

## Post title
`Built a free economic data API aggregating IMF + World Bank + WHO — 440 indicators, 218 countries`

---

## Post body

I've been building Statistics of the World for about a year. The core idea: I was constantly frustrated pulling economic data from three different APIs with three different schemas, so I built a layer that normalizes everything.

**What it does:**
- Pulls GDP, inflation, population, unemployment, life expectancy, debt levels, and 440+ other indicators from IMF, World Bank, and WHO
- Normalizes it into one JSON API
- Lets you compare any two countries side by side
- Free to use — 100 API calls/day without auth, free key for 1,000/day

**The SaaS angle I'm still figuring out:**
The free tier is genuinely free (no card required). I'm currently thinking about a paid tier for higher volume, bulk downloads, or webhook-based alerts when new IMF/World Bank releases drop. Would that be interesting to anyone, or is the free tier already enough for most use cases?

Link: statisticsoftheworld.com | API: statisticsoftheworld.com/api-docs

Happy to answer questions about the tech stack (Next.js, Supabase, Hetzner) or the data pipeline.

---

## Alternate title options
- `I built a free API that aggregates IMF + World Bank + WHO economic data — looking for feedback on monetization`
- `Free economic data API side project — 440 indicators, 218 countries, what would make you pay for it?`

---

## Notes
- r/SaaS skews toward builders and product people — the monetization angle works here
- Don't lead with "Statistics of the World" — lead with the problem it solves
- Search r/SaaS for "statisticsoftheworld" before posting
- Engage with comments even if no upvotes — builds karma
