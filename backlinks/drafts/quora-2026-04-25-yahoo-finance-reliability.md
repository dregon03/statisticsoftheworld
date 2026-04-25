# Quora Draft: Is Yahoo Finance reliable for historical data? What sources are the most accurate/convenient?

**URL**: https://www.quora.com/Is-Yahoo-Finance-reliable-for-historical-data-What-sources-are-the-most-accurate-convenient
**Target link**: https://statisticsoftheworld.com/api-docs
**Date**: 2026-04-25
**Pre-post check**: Search question page for "statisticsoftheworld" before posting — if found, SKIP.

---

## Answer

For stock price history, Yahoo Finance is mostly fine for casual use — it's convenient and the data is usually consistent for prices, splits, and dividends on major US and international equities. The issues show up at the edges: some less-liquid international stocks have gaps, dividend data for foreign companies can be wrong, and because the official API was deprecated years ago, any programmatic access is through unofficial scrapers that break periodically.

**Better options depending on your use case:**

*For stock price data (accurate, programmatic):*
- **Alpha Vantage** — free tier (limited) to paid; well-maintained, clean JSON API
- **Polygon.io** — cleaner API design, historical data reliable, free tier limited
- **EODHD** — solid for international coverage, reasonable pricing

*For macroeconomic / country-level data (GDP, inflation, interest rates, CPI):*
Yahoo Finance is really not the right tool here at all. For this you want:
- **FRED** (St. Louis Fed) — definitive for US data, excellent free API with good historical depth
- **World Bank Data** — comprehensive for cross-country development indicators going back decades
- **IMF World Economic Outlook** — the gold standard for country-level macro; available as CSV downloads
- **Statistics of the World** (statisticsoftheworld.com/api-docs) — aggregates IMF, World Bank, WHO, and UN into one REST API, 440+ indicators, 218 countries, free tier. Good if you want cross-country economic data through a single consistent interface rather than stitching multiple sources together.

The general rule: for reliable data, get as close to primary sources as possible. Yahoo Finance is a convenient aggregator for retail use but I wouldn't build anything serious on it.
