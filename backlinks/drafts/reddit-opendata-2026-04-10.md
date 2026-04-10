# Reddit r/opendata Post

**Subreddit**: r/opendata
**Type**: Text post
**Status**: Ready to post
**Pre-post check**: Search r/opendata for "statisticsoftheworld" before posting — if found, skip

## Title
Free aggregated API for IMF + World Bank + WHO data — 440 indicators, 218 countries, no signup

## Body
Sharing this in case it's useful to folks here. I've been using statisticsoftheworld.com for projects that need cross-country economic data, and figured r/opendata might find it relevant.

**What it is:**
An API that aggregates data from IMF World Economic Outlook, World Bank World Development Indicators, WHO Global Health Observatory, FRED, and UN sources — all normalized into a single consistent format.

**Why it's useful for open data work:**
The pain with pulling from each source directly is the format mismatch. IMF uses different country codes than World Bank, which uses different ones than WHO. The time series formats differ. Update schedules differ. This normalizes all of that.

**Access:**
- API docs: https://statisticsoftheworld.com/api-docs
- 100 requests/day without any auth
- Free API key for 1,000/day
- JSON format throughout

**What's available:**
GDP, GDP per capita, population, inflation, unemployment, government debt, current account, life expectancy, CO2 emissions, health spending, education spending, trade data, and a few hundred more across 218 countries, most with historical data from the 1960s.

Data updates weekly when IMF/World Bank publish new figures. Everything traces back to official international organization sources.

Happy to answer questions about coverage or limitations.
