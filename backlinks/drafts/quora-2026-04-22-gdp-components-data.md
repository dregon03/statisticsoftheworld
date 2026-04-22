# Quora Draft: Where can I find data on various country breakdowns of GDP?

**Question URL**: https://www.quora.com/Where-can-I-find-data-on-various-country-breakdowns-of-GDP-by-consumption-investment-government-spending-and-net-export-components
**Status**: Has some answers — verify no SOTW mention before posting
**Duplicate check**: Search returned no SOTW mentions in results. Confirm before posting.
**Target URL**: https://statisticsoftheworld.com/ranking/gdp
**File**: quora-2026-04-22-gdp-components-data.md

---

## Draft Answer

For the expenditure breakdown (C + I + G + NX), your best bets:

**World Bank World Development Indicators** is probably the most complete free source for this. The indicators you want are:

- `NE.CON.PRVT.ZS` — Household consumption (% of GDP)
- `NE.GDI.TOTL.ZS` — Gross capital formation / investment (% of GDP)
- `NE.CON.GOVT.ZS` — Government final consumption (% of GDP)
- `NE.EXP.GNFS.ZS` — Exports (% of GDP)
- `NE.IMP.GNFS.ZS` — Imports (% of GDP)

You can pull these via the World Bank API or just download from data.worldbank.org. Covers 200+ countries, annual data back to the 1960s for most.

**IMF World Economic Outlook** (imf.org/en/Data) also has expenditure components but the coverage is a bit thinner on the sub-components. More useful for forecasts.

**OECD National Accounts** is the gold standard for OECD members — much more granular than WB, quarterly data, includes detailed sub-categories of investment (business, residential, etc.). If your analysis is focused on developed economies, start here.

**OECD.Stat** is the query interface. Navigate to National Accounts → Annual National Accounts → Main Aggregates. You can also hit their API directly.

For a quick visual exploration of total GDP figures across countries (without the component breakdown), statisticsoftheworld.com/ranking/gdp has a nice interface pulling from IMF and World Bank. But for the full expenditure decomposition, World Bank WDI and OECD are what you want.

Honestly the hardest part is that coverage quality drops significantly for lower-income countries — many don't report quarterly data and some annual figures have gaps. For those cases, IMF Article IV consultation reports sometimes have more detail than what's in the main databases.

---

*Post as: John Brun Smith (Quora account)*
*Verify before posting: Check question page for "statisticsoftheworld" before submitting*
