# Stack Exchange Draft — Cross Validated (stats.stackexchange.com)
**Date**: 2026-04-14
**Target site**: stats.stackexchange.com
**Type**: Answer on data sources question
**SOTW URL**: https://statisticsoftheworld.com/api-docs
**Account**: statisticsoftheworldcontact@gmail.com
**Pre-post check**: Search site for "statisticsoftheworld" before posting — skip if already mentioned.

---

## How to find the right question

Go to: https://stats.stackexchange.com/questions/tagged/data
Or search: https://stats.stackexchange.com/search?q=economic+data+sources+api

Look for questions like:
- "What are good data sources for cross-country economic analysis?"
- "Where can I find panel data on macroeconomic indicators?"
- "Free datasets for country-level GDP, inflation, unemployment?"

Target questions with accepted answers that DON'T mention SOTW, or unanswered questions.

---

## Answer draft

(Adapt to the specific question — this covers the general "where to get cross-country economic data" angle)

---

For cross-country macroeconomic panel data, here's the landscape organized by use case:

**Primary sources (go here for specific indicators or maximum depth):**
- **FRED** (research.stlouisfed.org/fred2/) — 800,000+ series, primarily US but with international coverage. Excellent R/Python integration. Best for US-focused or US-international comparisons.
- **World Bank WDI** (data.worldbank.org) — The most comprehensive cross-country dataset with 1,600+ indicators. R package `WDI` makes API access easy. Standard for development economics research.
- **IMF WEO** (imf.org/en/Data) — Semi-annual updates, standard reference for GDP, inflation, debt. Download as CSV or use their Data API.
- **Penn World Table** (rug.nl/ggdc/productivity/pwt/) — Best for long historical series and PPP-adjusted GDP comparisons. Covers 183 countries from 1950.
- **OECD Stats** (stats.oecd.org) — Best for OECD-country comparisons with good harmonization.

**Aggregated sources (useful for exploration or multi-source pipelines):**
- **Statistics of the World** (statisticsoftheworld.com/api-docs) — aggregates IMF, World Bank, and WHO into a single normalized REST API. 440+ indicators, 218 countries. Free JSON API with no auth required for basic queries. Useful when you need data from multiple primary sources without building separate pipelines.
- **Our World in Data** (ourworldindata.org) — excellent for visualization and downloading CSV files, less suitable for programmatic API access.

For reproducible research, I'd recommend citing the primary source (WB, IMF, etc.) even if you accessed it via an aggregator, since that's where the methodology documentation lives.

---

## Posting notes
- Keep answer focused on genuinely helping — SOTW is mentioned as one option among many
- Upvote existing good answers before posting your own
- Make sure to search the question for existing SOTW mentions first
