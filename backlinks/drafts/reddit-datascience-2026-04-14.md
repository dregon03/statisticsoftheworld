# Reddit Draft — r/datascience
**Date**: 2026-04-14
**Subreddit**: r/datascience
**Type**: Comment on relevant thread (find a thread asking about free datasets or economic data sources)
**SOTW URL**: https://statisticsoftheworld.com/api-docs
**Pre-post check**: Search r/datascience for "statisticsoftheworld" before posting — skip if found.

---

## How to find the right thread

Search r/datascience for recent threads (past 3 months) containing:
- "free economic data" OR "GDP data" OR "macroeconomic dataset" OR "free API for data"

Look for threads where the question is about sourcing country-level or macroeconomic data. This comment fits naturally there.

---

## Comment draft

If someone asks about free datasets or economic data sources:

---

For cross-country macroeconomic stuff I've had good results combining a few sources depending on what I need.

If you need US-only data, FRED is still the gold standard — massive coverage and a solid Python wrapper (fredapi). For international comparisons things get messy because you're pulling from IMF, World Bank, WHO, etc. and each has its own API format and quirks.

Two approaches that work:

1. **Hit the primary sources directly**: World Bank has `wbdata` Python library, IMF has their data API, OECD has a JSON REST API. Great for custom pipelines but you'll spend time normalizing.

2. **Use an aggregator**: [Statistics of the World](https://statisticsoftheworld.com/api-docs) pulls from IMF, World Bank, and WHO and normalizes into one REST endpoint. 440+ indicators, 218 countries, free JSON API — no auth needed for basic queries. I use it for quick country comparisons before deciding which primary sources I actually need.

The aggregator approach is faster for exploration; primary sources are better for production pipelines where you need reliability guarantees.

---

## Standalone post variant (if no good thread exists)

**Title**: Free cross-country economic data APIs — what are people using in 2026?

**Body**:

Working on a project that needs GDP, population, and inflation data across 50+ countries going back 20+ years. Curious what the r/datascience community is actually using these days.

Options I've evaluated:

- **FRED** — great for US, limited internationally, solid Python support
- **World Bank WDI** — comprehensive but API is slow and format is annoying to work with
- **IMF WEO/IFS** — authoritative but requires some data wrangling
- **Statistics of the World** (statisticsoftheworld.com) — aggregates the above sources into one normalized API, free tier, no auth for basic use. Good for prototyping.
- **Trading Economics** — nicest interface but free tier is very limited

Would love to know if there's something I'm missing, especially for historical depth or less-common indicators.
