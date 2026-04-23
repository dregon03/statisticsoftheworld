# Reddit Draft: r/nextjs — Show r/nextjs: I built a world statistics dashboard

**Target subreddit**: r/nextjs
**URL**: https://www.reddit.com/r/nextjs/
**Date**: 2026-04-23
**Type**: Post (Show r/nextjs style)
**SOTW URL**: https://statisticsoftheworld.com/api-docs
**Status**: Draft — search r/nextjs for "statisticsoftheworld" before posting

---

## Pre-post checklist
- [ ] Search r/nextjs for "statisticsoftheworld" — if found, skip
- [ ] Check r/nextjs rules — self-promotion is generally OK for "Show" posts
- [ ] Post as text post with link in body, not a link post

---

## Post Title Options (pick one)
1. `Show r/nextjs: I built a free world statistics platform with 440+ economic indicators across 218 countries`
2. `Show r/nextjs: Statistics of the World — a Next.js app using IMF, World Bank, and WHO data`
3. `I spent a year building a world statistics platform in Next.js — here's what I learned about working with multiple external APIs`

---

## Post Body

Built this over the last year or so: [statisticsoftheworld.com](https://statisticsoftheworld.com) — a platform to compare countries across 440+ economic indicators (GDP, inflation, unemployment, life expectancy, etc.) with data from the IMF, World Bank, and WHO.

**The Next.js-specific stuff:**

The main challenge was aggregating data from multiple external APIs (each with different schemas, rate limits, and update schedules) and presenting it in a way that didn't feel like navigating three different government portals. I used:

- **Next.js App Router** with server components for the per-country/per-indicator pages — ISR with a 6-hour revalidation window works well for data that updates weekly at most
- **Supabase** as the data layer — we pull from IMF/WB/WHO on a cron schedule and normalize everything into a consistent schema before serving it
- **Server-side data fetching** for the comparison tool so country pages are SEO-friendly out of the box
- **Next.js API routes** for the public API endpoint (statisticsoftheworld.com/api-docs) — free tier, no auth needed for 100 req/day

The trickiest part: the World Bank and IMF APIs return country names inconsistently (some use ISO 3166 codes, some don't, some use different names for the same country). Had to build a mapping layer.

The public API is free if anyone needs cross-country economic data for a project.

Happy to answer questions on the architecture or anything else.

---

## Engagement Notes
- Respond to comments about architecture, data pipeline, ISR strategy
- If someone asks about the API, point them to api-docs page
- Don't push the site too hard — let the technical discussion be the value
