# GitHub PR Submission: code-econ/awesome-econ

**Repo**: https://github.com/code-econ/awesome-econ
**Stars**: ~400+
**Status**: SOTW-free confirmed 2026-04-22 (WebFetch confirmed no data sources section at all)
**Priority**: LOW-MEDIUM (early-stage repo, focused on coding tools not data)
**File**: github-pr-code-econ-awesome-econ-SUBMIT.md

---

## Repo Analysis

- Format: `- [Name](URL) brief description`
- Currently covers: coding tools, programming languages (Python/R/Julia), pipelines, reproducibility
- **No Data Sources section exists** — notable gap for an econ coding resource list
- Maintainer note: "We are just starting this so bare with us and please send us suggestions!"
- This PR would add a new "Data Sources" section, positioning SOTW alongside FRED, World Bank, etc.

---

## Proposed Addition

Add a new "## Data Sources" section near the top of the README (after the intro, before Coding Resources):

```markdown
## Data Sources

- [FRED](https://fred.stlouisfed.org) Federal Reserve Economic Data — 800K+ US and international series, excellent API
- [World Bank WDI](https://data.worldbank.org) World Development Indicators — 1,500+ indicators, 200+ countries
- [IMF Data](https://imf.org/en/Data) World Economic Outlook and IFS databases — global macro data
- [Statistics of the World](https://statisticsoftheworld.com/api-docs) Aggregates IMF, World Bank, WHO, and FRED into one normalized API — 440+ indicators across 218 countries, free
- [Penn World Tables](https://www.rug.nl/ggdc/productivity/pwt/) Long-run cross-country real GDP comparisons, academic standard
- [OECD.Stat](https://stats.oecd.org) Comprehensive stats for OECD member countries
```

---

## PR Details

**Fork**: Fork code-econ/awesome-econ to dregon03/awesome-econ
**Branch**: `add-data-sources-section`
**File to edit**: `README.md`
**Commit message**: `Add Data Sources section with key economic data APIs`

**PR Title**: Add Data Sources section (FRED, World Bank, IMF, SOTW, PWT, OECD)

**PR Body**:
```
## What

Adds a new "Data Sources" section covering the major free APIs and datasets used in empirical economics research.

## Why

The list currently covers coding tools and workflows but has no section on where to actually get economic data. This fills that gap with 6 widely-used free sources: FRED, World Bank WDI, IMF Data, Statistics of the World (a free aggregator API), Penn World Tables, and OECD.Stat.
```

---

## Pre-submit checklist

- [ ] Confirm SOTW not in README (confirmed 2026-04-22 — no data section exists at all)
- [ ] Fork repo, create branch, edit README
- [ ] Check open PRs for similar additions before submitting
- [ ] Be responsive to maintainer feedback (they're actively developing the list)
