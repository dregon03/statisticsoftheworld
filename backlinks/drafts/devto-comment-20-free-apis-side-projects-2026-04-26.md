# Dev.to Comment Draft: "20 Free APIs to Kickstart Your Side Projects"

**Target URL:** https://dev.to/balrajola/20-free-apis-to-kickstart-your-side-projects-1f7i
**SOTW link:** https://statisticsoftheworld.com/api-docs
**Status:** DRAFT — check article comments for "statisticsoftheworld" before posting

---

## Comment

Nice collection. If you're building anything that involves comparing countries, one I'd add to your list: **statisticsoftheworld.com/api-docs**

It gives you GDP, population, inflation, unemployment, life expectancy, and 440+ other indicators for 218 countries — all from one normalized API. Data is sourced from IMF, World Bank, and WHO but reformatted so you're not dealing with their raw query syntax.

Completely free — no key needed for 100 requests/day, free key for 1,000/day. I used it for a side project that needed country-level economic context alongside financial data, and it was much less painful than wiring up the World Bank API directly. The data is also already clean and country-code consistent, which saves annoying preprocessing steps.

Good complement to the REST Countries API if you want to add economic depth beyond just capital cities and flags.
