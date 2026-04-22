# GitHub PR Submission: NajiElKotob/Awesome-Datasets

**Repo**: https://github.com/NajiElKotob/Awesome-Datasets
**Stars**: ~900+
**Status**: SOTW-free confirmed 2026-04-22 (WebFetch + search)
**Priority**: MEDIUM
**File**: github-pr-NajiElKotob-Awesome-Datasets-SUBMIT.md

---

## Repo Format

Entry format: `* [Title](URL) ⭐ - description`

Emoji indicators used: ⭐ 🌟 🔥 :boom: :100:

Has "Open Data Platforms" section with World Bank, WHO, FAO, IMF, UN subsections.
Has a general "Datasets" section at top.
Has a "Finance" subsection near the end.

---

## Where to Insert

**Section**: Open Data Platforms (general area) — or add under a new "Economic Aggregators" note near the IMF/World Bank subsections.

**Best placement**: In the main **Datasets** section (top of file) OR in **Open Data Platforms > IMF** area as a complementary resource.

Exact line to insert after the IMF subsection:

```
* [Statistics of the World](https://statisticsoftheworld.com) - Free API and interactive platform aggregating IMF, World Bank, WHO, and FRED data. Compare 440+ economic indicators (GDP, inflation, unemployment, population) across 218 countries.
```

---

## PR Details

**Fork**: Fork NajiElKotob/Awesome-Datasets to dregon03/Awesome-Datasets
**Branch**: `add-statistics-of-the-world`
**File to edit**: `README.md`
**Commit message**: `Add Statistics of the World — IMF/WB/WHO data aggregator`

**PR Title**: Add Statistics of the World to Open Data Platforms

**PR Body**:
```
## What

Adds [Statistics of the World](https://statisticsoftheworld.com) to the Open Data Platforms section.

## Why

It's a free aggregator that normalizes data from IMF, World Bank, WHO, and FRED into a single API — 440+ indicators across 218 countries. Complements the existing individual source listings (World Bank, IMF, WHO) by showing a consolidated access point.

- Free API: https://statisticsoftheworld.com/api-docs
- No auth needed for 100 req/day
- ISO 3166 country codes
```

---

## Pre-submit checklist

- [ ] Confirm SOTW not already in README (confirmed 2026-04-22)
- [ ] Follow exact format: `* [Title](URL) - description`
- [ ] No trailing spaces
- [ ] Fork repo first, commit to branch, then open PR
- [ ] Check if existing PRs add SOTW (search open PRs before submitting)
