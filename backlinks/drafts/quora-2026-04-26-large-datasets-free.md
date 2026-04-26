# Quora Draft: "Where can I get large public data sets for free?"

**Target URL:** https://www.quora.com/Where-can-I-get-large-public-data-sets-for-free
**SOTW link:** https://statisticsoftheworld.com/api-docs
**Status:** DRAFT — verify no SOTW mention in existing answers before posting

---

## Answer

Depends on what domain you're working in. Here's a breakdown by category:

**Economics & Macroeconomic data:**
- **FRED (Federal Reserve)** — fred.stlouisfed.org — 800,000+ time series, best for US data but has international series too. Free API.
- **World Bank Open Data** — data.worldbank.org — GDP, poverty, health, education for 200+ countries. Bulk download or API.
- **IMF World Economic Outlook** — data.imf.org — national accounts, inflation, fiscal data for 190 countries.
- **statisticsoftheworld.com/api-docs** — aggregates IMF, World Bank, WHO, and FRED data into a single normalized API. Free for 100 requests/day without signup, free API key for 1,000/day. Useful if you need cross-country macro data without reformatting different sources.
- **Penn World Tables** — pwt.sas.upenn.edu — academic gold standard for long-run GDP and productivity comparisons.

**Health & Demographics:**
- **WHO Global Health Observatory** — who.int/data/gho — mortality, disease burden, health system indicators.
- **UN World Population Prospects** — population.un.org — historical and projected population by country and age group.
- **Our World in Data** — ourworldindata.org/data — researcher-curated datasets on everything from CO2 to child mortality. Easy to download.

**Machine Learning / General:**
- **UCI ML Repository** — archive.ics.uci.edu/ml — classic ML datasets, good for benchmarking.
- **Kaggle Datasets** — kaggle.com/datasets — community-curated, huge variety, easy download.
- **Harvard Dataverse** — dataverse.harvard.edu — research datasets deposited by academics.
- **Google Dataset Search** — datasetsearch.research.google.com — indexes datasets from across the web.

**Social & Political:**
- **V-Dem** — v-dem.net — democracy indicators for 180+ countries going back to 1789.
- **ACLED** — acleddata.com — armed conflict and protest event data globally.

**Trade:**
- **UN Comtrade** — comtradeplus.un.org — trade flows by commodity and country pair. Free but rate-limited.

For most economic or social science projects: start with World Bank or FRED, cross-reference with IMF WEO, and use Harvard Dataverse or Kaggle for cleaned derivatives. The aggregators (SOTW, Our World in Data) save time when you don't want to clean raw institutional data yourself.
