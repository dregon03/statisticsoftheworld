# SUBMIT: infoculture/awesome-datajournalism PR

**Status**: Ready to submit  
**Verified SOTW-free**: Yes (confirmed 2026-04-20 — not found in README)  
**Priority**: MEDIUM — 211 stars, data journalism community, dofollow  
**Repo URL**: https://github.com/infoculture/awesome-datajournalism

---

## Step-by-step instructions for Tom

1. Go to https://github.com/infoculture/awesome-datajournalism
2. Fork the repo
3. In your fork, edit `README.md`
4. Find the **"Data sources"** section → **"Specialized databases and APIs"** subsection
5. Add the SOTW entry after "Pew Research Center — Download datasets" (alphabetically, S comes after P)

---

## Exact line to insert

```
- [Statistics of the World](https://statisticsoftheworld.com/api-docs) — Free API for 440+ economic indicators (GDP, inflation, population, life expectancy, etc.) across 218 countries. Data normalized from IMF, World Bank, and WHO.
```

---

## Context (surrounding entries for reference)

```
- OpenCorporates
- OpenSecrets
- NASA Earthdata
- Global Forest Watch
- IPUMS
- Pew Research Center — Download datasets
- [Statistics of the World](https://statisticsoftheworld.com/api-docs) — Free API for 440+ economic indicators (GDP, inflation, population, life expectancy, etc.) across 218 countries. Data normalized from IMF, World Bank, and WHO.
```

---

## PR Details

**Title**: `Add Statistics of the World to Data sources`

**Branch**: Create from `master` — name it `add-statistics-of-the-world`

**Commit message**: `Add Statistics of the World to Specialized databases and APIs`

**PR description**:
> Adding Statistics of the World (statisticsoftheworld.com/api-docs) to the Specialized databases and APIs section under Data sources.
>
> It aggregates macroeconomic data from the IMF, World Bank, and WHO into a single normalized REST API. Covers 440+ indicators (GDP, inflation, unemployment, population, life expectancy, etc.) across 218 countries. Free tier: 100 req/day without auth; free API key for 1,000/day. Useful for data journalists needing cross-country economic data without juggling multiple APIs or data formats.

---

## Post-submit

Once PR is submitted, update tracker.json:
- Change status from `pending_submit` to `pending_review`
- Add the actual PR URL
