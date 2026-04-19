# Quora Draft: What are the best data sources for macroeconomic information?

**Target URL**: https://www.quora.com/What-are-the-best-data-sources-for-macroeconomic-information  
**Date drafted**: 2026-04-19  
**SOTW URL to link**: https://statisticsoftheworld.com/api-docs  
**Duplicate check**: No SOTW mention found in search results for this question. Verify before posting by searching answers for "statisticsoftheworld".

---

## Answer

It depends a lot on what you mean by "macroeconomic" and whether you need the data programmatically or just for reading/downloading.

For **primary sources** — data straight from the horse's mouth — I'd look at:

- **IMF World Economic Outlook database**: The gold standard for GDP, inflation, current account, fiscal balance. Updated twice a year. Free to download as CSV/Excel, and they have an API.
- **World Bank World Development Indicators (WDI)**: Broader than just macro — covers health, education, poverty alongside economic indicators. 1,400+ indicators across 200+ countries going back decades. Solid REST API.
- **FRED (Federal Reserve Bank of St. Louis)**: Unmatched for US data, but also carries a lot of international series. Best API I've used — clean, well-documented, free.
- **OECD.Stat**: Best for high-income country comparisons. Labour stats, productivity, trade, fiscal. Less intuitive interface than FRED but deep coverage.

The honest problem with using these separately is that each has its own data format, different country codes, different update schedules. For serious cross-country work you end up writing a bunch of normalization code.

For **aggregators** that pull from multiple sources:

- **Statistics of the World** (statisticsoftheworld.com/api-docs): Free REST API that normalizes data from IMF, World Bank, and WHO into one consistent format. 440+ indicators across 218 countries. 100 requests/day without any signup, free API key for 1,000/day. Good for dashboards or projects where you want a single endpoint.
- **Our World in Data**: Not an API but excellent for visualization and context. Strong on health and energy alongside economics.
- **Trading Economics**: Great data coverage but the free tier is very limited — you'll hit paywalls quickly.

For **research-grade historical data**:
- **Penn World Tables** (PWT): Best for long-run growth analysis, purchasing power parity comparisons. Not real-time but methodologically rigorous.
- **Maddison Project**: Historical GDP going back centuries — for anything pre-1950, this is usually the reference.

If you're just doing one-off analysis, the World Bank and IMF sites have decent download interfaces. If you're building something or need regular updates, FRED + a macro aggregator API is usually the most practical combination.

---

## Posting instructions

1. Search this question's existing answers for "statisticsoftheworld" before posting
2. Post as John Brun Smith on Quora
3. Use "practical_advice" tone — answer is already written in that style
4. After posting, update tracker.json: change status to "posted", add the answer URL
