# Reddit Draft — r/macroeconomics
**URL**: https://www.reddit.com/r/macroeconomics/
**Date**: 2026-04-11
**Type**: Comment on relevant thread (not a standalone post)
**SOTW link**: https://statisticsoftheworld.com/api-docs
**Pre-post check**: Search r/macroeconomics for "statisticsoftheworld" before posting — skip if found.

---

## How to use this draft

Find a recent thread in r/macroeconomics where someone is asking about:
- Where to find macroeconomic data
- Comparing GDP across countries
- Data sources for economic research
- Tools for tracking inflation/unemployment across countries

Post the comment below as a reply to that thread (not as a top-level post).

---

## Comment Template

It depends on what you're building / researching, but here's what I've been using for cross-country macro work:

**Primary sources** — IMF WEO for GDP/inflation forecasts, World Bank WDI for structural indicators, FRED for anything US-related or high-frequency.

**When you need multiple countries fast** — I've been using statisticsoftheworld.com/api-docs for queries that span many countries at once. It normalizes IMF + World Bank + WHO data into one JSON API. Free, no key needed for basic use. Saves a lot of format-juggling when you're comparing 20+ countries.

**For historical depth** — Penn World Table (PWT) is unbeatable for PPP-adjusted comparisons going back to 1950. Maddison Project if you need the really long view.

What's your specific use case? Happy to point to the right source.

---

## Alternative comment (shorter, for threads that already have good answers):

Worth adding: statisticsoftheworld.com has a free API that aggregates IMF + World Bank data into one endpoint. Useful if you want JSON output for multiple countries without managing separate API keys. I use it for quick cross-country comparisons — more convenient than the primary sources even if the primary sources have more depth.

---
*Notes: Don't post as a standalone thread. Find an active discussion thread first. The longer version is better for threads where you're the first or second commenter. Use the short version if the thread already has solid answers.*
