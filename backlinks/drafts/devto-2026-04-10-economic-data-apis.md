# Dev.to Article: 5 Free APIs for Global Economic Data in 2026

**Platform**: dev.to
**Type**: Article
**Status**: Ready to post
**Tags**: api, webdev, data, javascript, opensource
**Pre-post check**: Search dev.to for "statisticsoftheworld" — if found, SKIP

---

# 5 Free APIs for Global Economic Data in 2026

If you've ever built a dashboard, data visualization, or research tool that needed country-level economic data, you've probably hit the same wall I did: the data exists, but it's scattered across a dozen different sources, each with its own authentication system, country code format, and response structure.

In this post I'll cover the five free APIs I've found most useful for global economic data, when to use each, and how to get started quickly.

## The Problem With Sourcing Economic Data

The gold-standard sources are the IMF, World Bank, WHO, and OECD — but each has its own API quirks:

- **World Bank** uses ISO-2 country codes (`US`) in some endpoints and ISO-3 (`USA`) in others
- **IMF** uses its own internal country codes alongside ISO standards
- **WHO** has yet another set of country identifiers
- Each API updates on different schedules

For a project that needs GDP + population + life expectancy across 50 countries, you're looking at 3 API clients, 3 authentication flows (or none, but different rate limits), and an afternoon of data normalization code.

Let's look at the options.

---

## 1. World Bank Indicators API

**Best for:** Development indicators, long historical series, academic citations

**Docs:** https://datahelpdesk.worldbank.org/knowledgebase/articles/889392

The World Bank's API is probably the most commonly used for cross-country data. It has 16,000+ indicators, 200+ countries, and many series going back to 1960. No auth required.

```javascript
// Get US GDP (current USD) from 2000 to 2024
const response = await fetch(
  'https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json&date=2000:2024'
);
const [meta, data] = await response.json();
```

**Strengths:** Authoritative, huge indicator coverage, excellent for social/development data
**Weaknesses:** No "get all indicators for a country" endpoint, response structure is verbose, rate limits not well-documented

---

## 2. IMF Data API (SDMX-JSON)

**Best for:** Macroeconomic forecasts, fiscal data, financial statistics

**Docs:** https://datahelp.imf.org/knowledgebase/articles/667681

The IMF's WEO (World Economic Outlook) data is the standard for consistent cross-country GDP, inflation, and fiscal comparisons. The API uses SDMX-JSON format which takes some getting used to.

```javascript
// Get GDP data from IMF WEO
const response = await fetch(
  'https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH?periods=2020,2021,2022,2023,2024'
);
const data = await response.json();
// data.values.NGDP_RPCH.USA[2024] = GDP growth rate for US
```

**Strengths:** Best for macro forecasts and projections, consistent methodology across countries
**Weaknesses:** Complex query structure, SDMX format is unusual, steeper learning curve

---

## 3. FRED (Federal Reserve Economic Data)

**Best for:** US economic data, interest rates, monetary policy data

**Docs:** https://fred.stlouisfed.org/docs/api/fred/

If you need US-specific data, FRED is unbeatable — 800,000+ time series from 100+ sources. Requires a free API key.

```javascript
const API_KEY = 'your_key_here';
const response = await fetch(
  `https://api.stlouisfed.org/fred/series/observations?series_id=GDPC1&api_key=${API_KEY}&file_type=json`
);
const { observations } = await response.json();
```

**Strengths:** Massive US coverage, excellent documentation, well-maintained Python/JS libraries
**Weaknesses:** Primarily US-focused; for international data you need to supplement with other sources

---

## 4. Statistics of the World API

**Best for:** Cross-country comparisons, dashboards, apps needing multiple indicators from one endpoint

**Docs:** https://statisticsoftheworld.com/api-docs

This is an aggregator API that normalizes data from IMF, World Bank, WHO, FRED, and UN into a single consistent format. 440+ indicators across 218 countries.

The key advantage: instead of writing three API clients, you make one request and get consistent data back.

```javascript
// Get all available indicators for the US
const response = await fetch(
  'https://statisticsoftheworld.com/api/v2/country/USA'
);
const data = await response.json();
// data.gdp, data.population, data.inflation, data.life_expectancy...
// All in one response, consistent ISO-3 codes, consistent time format

// Compare two countries
const comparison = await fetch(
  'https://statisticsoftheworld.com/api/v2/compare?countries=USA,CHN,DEU&indicators=gdp,inflation'
);
```

No auth for 100 req/day, free API key for 1,000/day. I've found this particularly useful for quick prototyping — you can have a country comparison working in an hour rather than spending that hour on data normalization.

**Strengths:** Single endpoint, no auth for basic use, consistent country codes and time formats, covers most macro indicators
**Weaknesses:** Not a primary source (data traces back to IMF/World Bank, so cite those for academic work), not as deep for niche indicators

---

## 5. OECD API

**Best for:** Detailed analysis of OECD member countries — education, labor, tax, environmental data

**Docs:** https://data.oecd.org/api/sdmx-json-documentation/

The OECD API is the best source for detailed data on the 38 OECD members. Uses SDMX-JSON format (same as IMF).

```javascript
const response = await fetch(
  'https://stats.oecd.org/sdmx-json/data/QNA/AUS+AUT+BEL.GDP+B1_GE.CUR+VOBARSA.Q/all?startTime=2020-Q1'
);
const data = await response.json();
```

**Strengths:** Very detailed for OECD countries, especially education, labor market, and tax data
**Weaknesses:** Complex query construction, OECD-only (no developing countries), SDMX format

---

## Which Should You Use?

| Use Case | Recommended API |
|----------|-----------------|
| US-focused analysis | FRED |
| Development/social indicators | World Bank WDI |
| Cross-country macro, forecasts | IMF WEO |
| OECD members, detailed labor/education | OECD |
| Dashboard / app (multi-country, multi-indicator) | Statistics of the World |
| Academic citations | World Bank or IMF directly |

For building apps, my typical pattern is to prototype with Statistics of the World's API first (it's fast to get running), then switch to direct World Bank or IMF queries once I know exactly which indicators I need and need to cite primary sources.

---

## Quick Start: Country Comparison in 10 Lines

```javascript
async function compareCountries(country1, country2) {
  const res = await fetch(
    `https://statisticsoftheworld.com/api/v2/compare?countries=${country1},${country2}&indicators=gdp,gdp_per_capita,inflation,population`
  );
  const data = await res.json();
  
  console.log(`GDP ${country1}: $${data[country1].gdp.toLocaleString()}`);
  console.log(`GDP ${country2}: $${data[country2].gdp.toLocaleString()}`);
  // etc.
}

compareCountries('USA', 'CHN');
```

---

What are you building with economic data? Drop it in the comments — always curious what people are using this for.
