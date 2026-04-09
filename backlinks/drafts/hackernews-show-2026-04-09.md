# Hacker News Show HN

**Platform**: news.ycombinator.com
**Type**: Show HN submission
**Status**: Ready to post

## Title
Show HN: Statistics of the World – Free API for 440+ economic indicators across 218 countries

## URL
https://statisticsoftheworld.com/api-docs

## First Comment
Hey HN. I built this because I was frustrated juggling the IMF, World Bank, WHO, and FRED APIs for a project that needed cross-country economic data. Each uses different country codes, different time formats, different response structures.

This aggregates all of them into a single normalized API. No auth needed for basic use (100 req/day), free API keys for 1,000 req/day.

Example: `GET /api/v2/country/USA` returns all indicators for the US in one JSON response.

Tech stack: Next.js 16 (Turbopack), Supabase (PostgreSQL), deployed on a Hetzner VPS. The ETL pipeline pulls from source APIs weekly and normalizes everything.

Data sources: IMF World Economic Outlook, World Bank World Development Indicators, WHO Global Health Observatory, FRED (Federal Reserve Economic Data), UN Population Division.

Site also has interactive features: country comparisons, rankings, heatmaps, and an AI chat that answers questions about the data.

Would love feedback on the API design and what other data sources would be most useful to add.
