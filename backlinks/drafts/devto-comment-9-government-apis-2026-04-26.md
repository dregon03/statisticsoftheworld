# Dev.to Comment Draft: "9 Government APIs You Didn't Know Existed"

**Target URL:** https://dev.to/0012303/9-government-apis-you-didnt-know-existed-all-free-most-need-no-api-key-2bl3
**SOTW link:** https://statisticsoftheworld.com/api-docs
**Status:** DRAFT — check article comments for "statisticsoftheworld" before posting

---

## Comment

Great list! One I'd add that fits the spirit of this article: **statisticsoftheworld.com/api-docs**

It's not a single government API, but it normalizes data from several of them — IMF, World Bank, WHO — into one consistent JSON format. So instead of dealing with three different query syntaxes, response formats, and rate limits, you get one endpoint that covers 440+ economic and demographic indicators across 218 countries.

Free with no API key for basic use (100 req/day), free key for 1,000/day. Particularly useful if you're building something that needs GDP, inflation, population, or unemployment data and don't want to wire up IMF + World Bank separately. The country name normalization alone saves a lot of headache — "Korea, Rep." vs "South Korea" type issues between sources.

Probably most useful as a complement to the government sources you've listed rather than a replacement, especially for cross-country comparisons.
