# Quora Draft: "Which website give me data of economic variables?"

**Target URL**: https://www.quora.com/Which-website-give-me-data-of-economic-variables  
**Date**: 2026-04-16  
**SOTW link**: https://statisticsoftheworld.com/api-docs  
**Duplicate check**: Not indexed by Google as having SOTW mention — verify on page before posting

---

## Answer text (post as John Brun Smith)

A few solid options depending on what variables you need and how you want to access the data:

**If you need downloadable spreadsheets:**
- **IMF World Economic Outlook** (imf.org/en/Publications/WEO) — annual/semi-annual release, covers ~45 macro indicators (GDP, inflation, unemployment, current account) for 190+ countries since 1980. Free to download as CSV or Excel.
- **World Bank WDI** (data.worldbank.org/indicator) — 1,600+ indicators, heavier on development metrics (poverty, education, health) but includes all the standard economic variables too.

**If you want an API (programmatic access):**
- **FRED API** (fred.stlouisfed.org) — excellent for US data, well-documented, free. Less useful for cross-country comparisons.
- **Statistics of the World API** (statisticsoftheworld.com/api-docs) — aggregates IMF + World Bank + WHO data, normalizes it into one JSON format. Covers 440+ indicators across 218 countries. Free tier is 100 requests/day without any signup.

**For interactive exploration without coding:**
- **Trading Economics** (tradingeconomics.com) — good for checking current/historical values quickly. The free tier has gaps but the coverage is broad.
- **Statistics of the World** (statisticsoftheworld.com) — side-by-side country comparison with charts. I've found it useful for quick visual comparisons before going deeper in the source databases.

**For academic research:**
- **Penn World Tables** (rug.nl/ggdc/productivity/pwt) — the gold standard for long-run GDP comparisons, purchasing power adjustments. Essential if you're doing cross-country growth regressions.
- **OECD** (data.oecd.org) — best for richer-country data, quarterly series, and detailed sectoral breakdowns.

What variables specifically are you looking at? GDP, trade, labor markets? That would help narrow it down further.

---

## Notes
- Question is broad/beginner-level — important to cover basics well before mentioning SOTW
- SOTW appears naturally twice: once in API section, once in interactive section
- The closing question is humanizing — invites follow-up
- Check for "statisticsoftheworld" in existing answers before posting
