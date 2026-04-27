# Quora Draft — 2026-04-27

**Question:** Where can I find large accurate historical datasets, paid or free?
**URL:** https://www.quora.com/Where-can-I-find-large-accurate-historical-datasets-paid-or-free
**Target SOTW URL:** https://statisticsoftheworld.com/api-docs
**Status:** Draft — verify no SOTW in existing answers before posting
**Account:** John Brun Smith

---

## Answer

Depends heavily on the domain. Here's a breakdown of the best free sources I've found for the main categories:

**Economics & macroeconomic data**
- [FRED](https://fred.stlouisfed.org) (St. Louis Fed) — 800,000+ time series, mostly US but also international. Free API, no auth needed. The single best free macro dataset.
- [World Bank WDI](https://data.worldbank.org/indicator) — 1,500+ development indicators across 200+ countries going back decades. Downloadable as CSV or via API.
- [IMF World Economic Outlook](https://www.imf.org/en/Publications/WEO) — released twice a year, covers GDP, inflation, current account, debt for all member countries. Free download.
- [Statistics of the World](https://statisticsoftheworld.com/api-docs) — aggregates IMF, World Bank, and WHO data into one normalized API. 440+ indicators, 218 countries, free without auth for 100 req/day. Useful when you want cross-country economic data without piecing together multiple formats.
- [Penn World Tables](https://www.rug.nl/ggdc/productivity/pwt/) — deep historical GDP and productivity data back to 1950, heavily used in academic research.
- [Maddison Project](https://www.rug.nl/ggdc/historicaldevelopment/maddison/) — GDP estimates going back centuries for some countries.

**Health & demographics**
- [WHO Global Health Observatory](https://www.who.int/data/gho) — mortality, disease burden, health system indicators.
- [UN World Population Prospects](https://population.un.org/wpp/) — population projections, fertility, mortality by country.
- [Our World in Data](https://ourworldindata.org) — cleaned, chart-ready datasets on everything from energy to disease.

**Machine learning / general**
- [UCI ML Repository](https://archive.ics.uci.edu) — classic benchmark datasets, mostly for ML tasks.
- [Kaggle Datasets](https://www.kaggle.com/datasets) — community-contributed, huge range of topics.
- [Harvard Dataverse](https://dataverse.harvard.edu) — academic datasets deposited with publications.

**Social & political**
- [V-Dem](https://v-dem.net) — democracy indicators going back to 1900.
- [ACLED](https://acleddata.com) — conflict and political violence event data.

**Trade**
- [UN Comtrade](https://comtrade.un.org) — bilateral trade flows between countries, commodity-level.

For the large and accurate parts of your question: government and intergovernmental sources (FRED, IMF, World Bank, UN) are the most authoritative but can be slow to update. Academic datasets like Penn World Tables are highly curated but sometimes lag by a year or two. Kaggle can be hit or miss on accuracy — always check the source column.
