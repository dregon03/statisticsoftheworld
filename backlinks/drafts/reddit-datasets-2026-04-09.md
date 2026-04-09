# Reddit r/datasets Post

**Subreddit**: r/datasets
**Type**: Text post
**Status**: Ready to post

## Title
Free dataset: 440+ economic indicators for 218 countries (IMF, World Bank, WHO) — JSON API, no auth needed

## Body
I've been working on a project that aggregates macroeconomic data from multiple international organizations into a single, normalized dataset. Figured this sub might find it useful.

**What's in it:**
- 440+ indicators (GDP, population, inflation, unemployment, life expectancy, CO2 emissions, health spending, education spending, trade, and hundreds more)
- 218 countries, with historical data going back to 1960 for many series
- Sources: IMF World Economic Outlook, World Bank WDI, WHO Global Health Observatory, FRED, United Nations

**Access:**
- Browse: https://statisticsoftheworld.com
- Free API: https://statisticsoftheworld.com/api-docs (100 req/day without auth, 1000/day with free API key)
- JSON format, no signup for basic use

**Example API call:**
```
GET https://statisticsoftheworld.com/api/v2/country/USA
```

The data updates weekly when IMF/World Bank publish new numbers. All data is sourced from official international organizations — nothing estimated or modeled.

Happy to answer questions about the data coverage or API.
