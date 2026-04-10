# Reddit r/api Comment

**Subreddit**: r/api
**Type**: Comment on a relevant thread, OR new text post if no suitable thread
**Status**: Ready to post
**Pre-post check**: Search r/api for "statisticsoftheworld" before posting — if found, skip

## Option A: Comment on existing thread
Look for threads asking about:
- "free APIs for data"
- "APIs for country data / economic data"
- "public APIs without authentication"

## Option B: New Post (if no suitable thread)

### Title
Show r/api: free REST API for 440+ macroeconomic indicators across 218 countries

### Body
Built this API to solve a problem I had: needing GDP, population, and inflation data for multiple countries without writing three separate clients for IMF, World Bank, and WHO (each with different country code formats and response structures).

**What it does:**
Single normalized endpoint for 440+ economic indicators (GDP, inflation, unemployment, trade, health, demographics) across 218 countries. Data sources: IMF WEO, World Bank WDI, WHO, FRED, UN.

**API design:**
- `GET /api/v2/country/{iso3}` — all indicators for a country
- `GET /api/v2/indicator/{code}` — single indicator across all countries
- `GET /api/v2/compare?countries=USA,CHN,DEU` — multi-country comparison
- JSON throughout, consistent ISO-3 country codes, consistent time series format

**Auth/limits:**
- 100 req/day without any auth
- Free API key for 1,000 req/day (email signup)

**Docs:** https://statisticsoftheworld.com/api-docs

Feedback welcome — especially on API design decisions and what indicators you'd want added.
