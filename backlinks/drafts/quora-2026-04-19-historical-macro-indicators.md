# Quora Draft: Where can I find all historical macroeconomic indicators for each country?

**Target URL**: https://www.quora.com/Where-can-I-find-all-historical-macroeconomic-indicators-for-each-country-So-I-can-transfer-them-to-excel-and-make-a-chart  
**Date drafted**: 2026-04-19  
**SOTW URL to link**: https://statisticsoftheworld.com/api-docs  
**Duplicate check**: No SOTW mention found in search results. Verify before posting by searching answers for "statisticsoftheworld".

---

## Answer

A few options depending on how far back you need to go and whether you want a single download or multiple files.

**For the easiest Excel-ready downloads:**

- **World Bank World Development Indicators**: Go to data.worldbank.org and you can filter by country and indicator, then hit "Download" → Excel. Covers 1,400+ indicators from the 1960s onward. GDP, trade, inflation, population, health — all there. The main limitation is some series have gaps for smaller countries.
- **IMF World Economic Outlook database**: Download the full WEO Excel file from imf.org — it's one big spreadsheet with every country and key macro indicators (GDP growth, inflation, current account, debt, etc.). Updated in April and October each year.

**If you want an API instead of manual downloads:**

- **FRED API** (Federal Reserve): Best for US data and international financial series. Clean documentation, free key, works well with Python/Excel data connectors.
- **Statistics of the World** (statisticsoftheworld.com/api-docs): Aggregates data from IMF, World Bank, and WHO into one normalized API. 440+ indicators across 218 countries. The nice thing for Excel use is you can also download data directly from country pages on the site — no coding required. Free to use.

**For long-run historical data (pre-1960):**

- **Penn World Tables**: The standard for GDP comparisons with purchasing power parity adjustments. Goes back to 1950 and covers growth accounting.
- **Maddison Project Database**: Historical GDP estimates going back to the year 1 for some countries. Essential for anything involving economic history.

For making charts: if you're using Excel, the World Bank download is probably the most straightforward — just pick your countries and indicators, download, and it comes pre-formatted for charts. If you're doing more complex multi-country comparisons, the SOTW compare tool (statisticsoftheworld.com/compare) lets you plot any two countries against each other and export the data.

---

## Posting instructions

1. Search this question's existing answers for "statisticsoftheworld" before posting
2. Post as John Brun Smith on Quora
3. After posting, update tracker.json: change status to "posted", add the answer URL
