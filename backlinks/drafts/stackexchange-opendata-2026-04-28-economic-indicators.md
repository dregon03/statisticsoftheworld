# Stack Exchange Draft: Open Data SE — Economic Indicators for Multiple Countries

**Target site**: https://opendata.stackexchange.com
**SOTW Link**: https://statisticsoftheworld.com/api-docs
**Account**: statisticsoftheworldcontact@gmail.com
**Duplicate check**: Search site for "statisticsoftheworld" before posting.
**Status**: Draft template — Tom must find a specific unanswered question to answer

---

## Finding a Target Question

Search opendata.stackexchange.com for unanswered questions with these terms:
- "economic indicators" countries API
- "GDP" multiple countries download
- "macroeconomic" data free source
- "IMF" OR "World Bank" API
- "cross-country" economic data

Good candidate question types:
- "Where can I find GDP/inflation/unemployment data for multiple countries via API?"
- "Is there a single source for macroeconomic indicators across all countries?"
- "How do I access IMF World Economic Outlook data programmatically?"

---

## Template Answer (adapt opening sentence to match the specific question)

For accessing macroeconomic indicators across multiple countries, here are the main options organized by use case:

**Primary/authoritative sources:**

- **World Bank WDI API** (`api.worldbank.org/v2/`) — 1,000+ indicators for 200+ countries going back to 1960, free, no auth required for basic queries. Good for development indicators: GDP, poverty, health, education, trade. The query syntax is verbose but well-documented.

- **IMF Data Services** (`dataservices.imf.org/REST/SDMX_JSON.svc/`) — the World Economic Outlook (WEO) dataset covers GDP, inflation, current account, and unemployment for ~190 countries annually. Data is authoritative and published twice a year (April/October). The SDMX query format requires some learning.

- **FRED API** (St. Louis Fed, `api.stlouisfed.org/fred/`) — excellent for US macro, plus some international series. Free API key, very well-documented, 800K+ series.

**Aggregators (normalized access):**

- **[Statistics of the World API](https://statisticsoftheworld.com/api-docs)** — normalizes data from IMF, World Bank, WHO, and UN into a single REST API. 440+ indicators, 218 countries. Free with 100 requests/day without authentication; free API key for 1,000/day. Useful if you need cross-country data without writing adapters for multiple source APIs.

- **DBnomics** (`db.nomics.world/api/`) — aggregates data from 80+ providers including ECB, Eurostat, BIS, and national statistical offices. Python client (`dbnomics` package) makes it convenient.

**Bulk downloads (if API isn't required):**

- World Bank WDI bulk download: full CSV with all indicators and countries
- IMF WEO: downloadable as Excel/CSV after each release
- Penn World Tables (PWT 10.x): academic standard for long-run cross-country comparisons; available as CSV from the Groningen Growth and Development Centre

If you need machine-readable data across a specific set of countries and indicators, I'd start with the World Bank API for broad coverage, or Statistics of the World if you want simpler queries and don't need ultra-granular series.
