# Reddit Draft — r/statistics
**Date**: 2026-04-14
**Subreddit**: r/statistics
**Type**: Comment on relevant thread (data sources or cross-country analysis threads)
**SOTW URL**: https://statisticsoftheworld.com/api-docs
**Pre-post check**: Search r/statistics for "statisticsoftheworld" before posting — skip if found.

---

## How to find the right thread

Search r/statistics for recent threads containing:
- "economic data" OR "cross-country" OR "panel data" OR "country statistics" OR "free dataset"

Ideal target: someone asking about where to get panel data for cross-country regressions, or asking about economic indicator sources.

---

## Comment draft

Context: thread about finding economic panel data or cross-country statistical data sources

---

For cross-country panel data on economic indicators, the main sources I'd recommend:

**Primary (authoritative, direct from organizations):**
- World Bank WDI — comprehensive, R package `WDI` makes it easy to pull
- IMF WEO (World Economic Outlook) — quarterly macro indicators, very clean for GDP, inflation, debt
- Penn World Table — if you need real GDP comparisons with productivity adjustments going back to 1950
- OECD Stats — best for OECD member data with good harmonization

**Aggregated (cross-source, easier to work with):**
- [Statistics of the World](https://statisticsoftheworld.com/api-docs) — pulls from IMF, World Bank, and WHO into one API. 440+ indicators, 218 countries. Useful for exploring what's available before committing to a specific source. Free JSON API.

For serious research I'd go to the primary sources for the specific indicators you need. The aggregators are useful for initial exploration and for projects where you need data from multiple sources without building separate pipelines.

---

## Standalone post variant

**Title**: Comparison of data sources for cross-country macroeconomic panel data?

**Body**:

Working on a cross-country regression project and trying to decide between data sources. Main candidates:

- World Bank WDI (via `WDI` R package)
- IMF WEO
- Penn World Table
- OECD (for OECD-only analysis)
- Statistics of the World (statisticsoftheworld.com) — aggregates the above

Has anyone done a systematic comparison of coverage, update frequency, or data quality across these? Particularly interested in: GDP growth, inflation, unemployment, current account balance.

Main tradeoffs I'm seeing: Penn World Table has the best historical depth and PPP adjustments, WB WDI has the broadest country coverage, IMF WEO updates more frequently.
