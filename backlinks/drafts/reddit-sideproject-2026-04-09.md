# Reddit r/SideProject Post

**Subreddit**: r/SideProject
**Type**: Text post
**Status**: Ready to post

## Title
I built a platform that compares economic data for every country in the world — free, open API

## Body
Been working on this for a while and finally feel like it's ready to share.

**What it does:** Aggregates economic data from the IMF, World Bank, WHO, FRED, and UN into a single platform where you can compare any countries side by side across 440+ indicators.

**Why I built it:** I was doing research that needed GDP, inflation, and population data for multiple countries. The IMF, World Bank, and WHO all have APIs but they use different formats, different country codes, and update on different schedules. I spent more time writing data normalization code than doing actual analysis. So I built this to solve my own problem.

**Features:**
- Country profiles with every indicator + charts
- Side-by-side country comparisons (e.g., US vs China)
- Rankings for any indicator
- Free JSON API (no auth for basic use)
- Live market data (stock indices, commodities, currencies)
- Interactive maps and visualizations

**Tech stack:** Next.js, Supabase (PostgreSQL), deployed on Hetzner VPS with Coolify.

**Link:** https://statisticsoftheworld.com

Would love feedback, especially on what data you'd want to see added. The API docs are at /api-docs if anyone wants to build on top of it.
