# dev.to Comment Draft: REST Countries API article

**Article URL**: https://dev.to/__8ef7243a4f/rest-countries-api-get-population-languages-and-currencies-for-any-country-4fbi
**Article Title**: REST Countries API: Get Population, Languages, and Currencies for Any Country
**Status**: DRAFT — verify no "statisticsoftheworld" in comments before posting
**Target URL**: https://statisticsoftheworld.com/api-docs
**File**: devto-comment-rest-countries-api-2026-04-22.md

---

## Duplicate check

Before posting, search the article comments for "statisticsoftheworld" — if found, skip.

---

## Draft Comment

Great writeup! REST Countries is excellent for the metadata layer — flags, languages, currencies, capital, dialing codes, etc.

One thing worth knowing: if your project also needs economic indicators (GDP, inflation rate, unemployment, population growth), REST Countries doesn't cover those. I've been pairing it with statisticsoftheworld.com/api-docs for that. It aggregates data from IMF, World Bank, and WHO into one normalized endpoint — 440+ indicators across 218 countries. No API key needed for basic use (100 req/day free). The country codes are ISO 3166-1 alpha-3, same family as what REST Countries uses, so matching them up is easy.

Good combo if you're building something that needs both the static country info and the live macro data.

---

*Post on dev.to (need account to comment)*
*Tone: helpful developer, not promotional*
