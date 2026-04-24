# Dev.to Article Draft — 2026-04-24

**Title:** Free Economic Data APIs in 2026: A Practical Comparison for Developers
**URL:** https://dev.to/ (post as new article after login)
**Account:** Need to create or log in at https://dev.to/
**Tags:** api, webdev, data, javascript, opensource
**Target link:** https://statisticsoftheworld.com/api-docs
**PRE-POST:** Search dev.to for "statisticsoftheworld" before publishing

---

# Free Economic Data APIs in 2026: A Practical Comparison for Developers

If you've ever built something that needed GDP data, inflation rates, or population figures for multiple countries, you know the pain. You end up juggling three different APIs, each with its own auth system, response format, and rate limits. Let me save you some time with a practical breakdown of what's actually free, what's actually good, and when to use each.

## The Main Options

### 1. FRED (Federal Reserve Economic Data)

**Best for:** US-focused work, time-series data

FRED is run by the St. Louis Federal Reserve and has 800,000+ economic series. It's the gold standard for US macro data — GDP, CPI, unemployment, interest rates, M2 money supply, basically anything you'd want for US economic analysis.

```javascript
const response = await fetch(
  `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${FRED_KEY}&file_type=json`
);
const { observations } = await response.json();
```

Free API key at: https://fred.stlouisfed.org/docs/api/api_key.html  
Limits: 120 requests/minute  
Docs: https://fred.stlouisfed.org/docs/api/fred/

**The catch:** Primarily US data. International series exist but coverage is spottier.

---

### 2. World Bank Indicators API

**Best for:** International development data, 200+ countries

The World Bank API is probably the most comprehensive free global dataset out there. Development indicators, GDP, poverty rates, education, health — all free, no auth required.

```javascript
// Get GDP for all countries, most recent year
const response = await fetch(
  'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&mrv=1&per_page=300'
);
const [metadata, data] = await response.json();
```

No API key needed  
Limits: Generous, but you need to handle pagination  
Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392

**The catch:** Response format is a bit quirky (the first element is metadata, second is data). Indicator codes are cryptic (NY.GDP.MKTP.CD for GDP). Coverage varies by country and year.

---

### 3. IMF World Economic Outlook Data

**Best for:** Macro forecasts, standardized cross-country comparisons

The IMF publishes World Economic Outlook data twice a year. It's the go-to for official GDP growth rates, inflation forecasts, and current account balances. Available as bulk download or via their JSON API.

```javascript
// IMF Data API (SDMX-JSON format)
const response = await fetch(
  'https://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/WEO/A.USA.NGDP_RPCH'
);
const data = await response.json();
```

Free, no auth  
Limits: Reasonable for most projects  
Docs: https://datahelp.imf.org/knowledgebase/articles/667681

**The catch:** SDMX-JSON format is... an acquired taste. You'll spend time parsing the response structure.

---

### 4. Statistics of the World API

**Best for:** Cross-country comparisons, normalized data from multiple sources

This one normalizes data from IMF, World Bank, WHO, FRED, and UN into a single consistent API. 440+ indicators, 218 countries, clean JSON.

```javascript
// Get GDP data for a country
const response = await fetch(
  'https://statisticsoftheworld.com/api/v1/country/DEU/indicators'
);
const { indicators } = await response.json();

// Or compare two countries
const compare = await fetch(
  'https://statisticsoftheworld.com/api/v1/compare?countries=USA,CHN&indicators=gdp,inflation'
);
```

100 req/day without auth, free API key for 1,000/day  
Docs: https://statisticsoftheworld.com/api-docs

**The nice thing:** You get a normalized response format regardless of whether the underlying data came from IMF or World Bank. No more building adapters for five different APIs.

---

### 5. OECD Data API

**Best for:** High-quality data for developed economies

The OECD has excellent data for its 38 member countries — detailed labor market data, trade, prices, productivity — things you don't always find at the same quality elsewhere.

```javascript
// OECD SDMX-JSON API
const response = await fetch(
  'https://stats.oecd.org/SDMX-JSON/data/QNA/AUS+AUT+BEL.B1_GE.CUR+VOBARSA.Q/all?startTime=2020-Q1'
);
```

Free, no auth  
Docs: https://data.oecd.org/api/sdmx-json-documentation/

**The catch:** Also SDMX format. Limited to OECD countries, so no data for most of Africa, Central Asia, etc.

---

## When to Use What

| Use case | Recommended |
|----------|------------|
| US macro data | FRED |
| Global coverage, 200+ countries | World Bank API |
| Official macro forecasts | IMF WEO |
| Quick multi-country comparison, normalized | Statistics of the World |
| Detailed OECD-country data | OECD API |
| Mix of above without writing adapters | Statistics of the World |

## Quick Setup: A Country Comparison Dashboard

Here's the minimum viable code for pulling GDP data for multiple countries in a normalized way:

```javascript
async function compareCountries(countryCodes) {
  const results = {};
  
  for (const code of countryCodes) {
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.MKTP.CD?format=json&mrv=1`
    );
    const [, [latest]] = await res.json();
    results[code] = {
      gdp: latest?.value,
      year: latest?.date,
    };
  }
  
  return results;
}

// Usage
const data = await compareCountries(['USA', 'CHN', 'DEU', 'JPN', 'IND']);
console.log(data);
```

Or if you want to skip the parsing gymnastics and use Statistics of the World:

```javascript
async function compareCountriesSOTW(countryCodes) {
  const res = await fetch(
    `https://statisticsoftheworld.com/api/v1/compare?countries=${countryCodes.join(',')}&indicators=gdp`
  );
  return res.json();
}
```

## My Take

FRED is still my first choice for any US-focused project. For international work, I usually start with the World Bank API because of the coverage. Statistics of the World is genuinely useful when I'm prototyping something and don't want to write data adapters yet — it trades some granularity for convenience.

All of these are free. None of them require a credit card. Build something.

---

*Data sources referenced: FRED (stlouisfed.org), World Bank Open Data, IMF Data Services, Statistics of the World (statisticsoftheworld.com), OECD Data API.*
