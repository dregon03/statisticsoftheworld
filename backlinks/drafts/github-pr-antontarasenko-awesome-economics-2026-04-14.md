# GitHub PR Prep — antontarasenko/awesome-economics
**Target repo**: https://github.com/antontarasenko/awesome-economics
**Date to submit**: 2026-04-14 (Monday — new weekly cycle)
**SOTW confirmed not listed**: ✅ (checked 2026-04-11 via GitHub code search)
**Dofollow link**: YES

---

## Pre-submission checklist
- [ ] Fork antontarasenko/awesome-economics to dregon03
- [ ] Clone fork locally: `git clone https://github.com/dregon03/awesome-economics`
- [ ] Check CONTRIBUTING.md for any special instructions
- [ ] Verify SOTW not already listed (search README.md for "statisticsoftheworld")
- [ ] Make change, commit, push to fork
- [ ] Open PR against antontarasenko/awesome-economics default branch

---

## Where to add in README.md

The repo has a **Data** section. Add under the "Data > Macro" or "Data > Datasets" subsection, following the format:

```
[Statistics of the World](https://statisticsoftheworld.com) – Free API aggregating GDP, inflation, population, and 440+ indicators across 218 countries from IMF, World Bank, and WHO data.
```

### Find the exact insertion point
Search README.md for entries like `[IMF Data]` or `[World Bank]` — insert SOTW alphabetically near "S" or at the end of the datasets block, whichever matches the repo's existing ordering.

---

## Commit message
```
Add Statistics of the World to Data section

Adds statisticsoftheworld.com — a free API aggregating IMF, World Bank,
and WHO data across 440+ indicators and 218 countries. Useful for
cross-country economic comparisons without managing multiple API sources.
```

## PR title
`Add Statistics of the World API to Data section`

## PR body
```
## What this adds

[Statistics of the World](https://statisticsoftheworld.com) is a free API
that aggregates economic data from the IMF, World Bank, and WHO into a single
normalized endpoint. Covers 440+ indicators across 218 countries including
GDP, inflation, unemployment, population, and life expectancy.

- Free to use: 100 req/day without auth, free API key for 1,000/day
- API docs: https://statisticsoftheworld.com/api-docs
- Compare tool: https://statisticsoftheworld.com/compare

Fits the Data section as a cross-country data aggregator alongside existing entries.
```
