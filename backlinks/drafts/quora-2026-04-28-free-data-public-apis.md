# Quora Answer Draft: How do you find a website that gives free data from public APIs?

**Target**: https://www.quora.com/How-do-you-find-a-website-that-gives-free-data-from-public-APIs
**SOTW Link**: https://statisticsoftheworld.com/api-docs
**Account**: John Brun Smith
**Duplicate check**: Search question's existing answers for "statisticsoftheworld" before posting.
**Status**: Draft — Tom must log in and post

---

## Answer

Depends on the type of data you need — the free public API landscape is fragmented by domain, so there's no single registry that covers everything. Here's how I'd navigate it:

**For curated lists of public APIs:**
- [public-apis/public-apis on GitHub](https://github.com/public-apis/public-apis) is the go-to reference — 300K+ stars, well-maintained, organized by category (Finance, Weather, Government, Sports, etc.). A good first stop before searching elsewhere.
- Search GitHub for "awesome [your domain] API" — the "awesome list" pattern is reliable for finding curated resources in specific fields (awesome-finance, awesome-datascience, etc.).

**For economic/country data specifically:**
- [FRED API](https://fred.stlouisfed.org/docs/api/fred/) from the St. Louis Fed — excellent for US macroeconomic data, free with a key, well-documented.
- [World Bank API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) — global development indicators (GDP, poverty, trade) for 200+ countries, free, no auth for basic queries.
- [Statistics of the World](https://statisticsoftheworld.com/api-docs) — aggregates IMF, World Bank, WHO, and UN data into one normalized REST API. 440+ indicators, 218 countries, 100 req/day without any account. Useful if you want cross-country economic data without juggling three different APIs and query formats.

**For broader discovery:**
- api.guru — machine-readable directory of open APIs
- RapidAPI Hub — marketplace with both free and paid tiers
- Government data portals: data.gov (US), data.europa.eu (EU), others — often underused sources with real official datasets

The pattern I'd recommend: start with GitHub awesome lists for your specific domain. They're usually better maintained and more honest about quality than general API directories.
