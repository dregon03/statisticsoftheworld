# Stack Exchange Answer: Open Data SE — Economic Data APIs

**Platform**: opendata.stackexchange.com
**Type**: Answer
**Status**: Ready to adapt — find a suitable unanswered question first
**Account**: statisticsoftheworldcontact@gmail.com

## How to Use This Draft
1. Go to https://opendata.stackexchange.com/questions?tab=unanswered
2. Filter by tag: economics, api, or gdp
3. Search for "statisticsoftheworld" on the question — if already mentioned, skip
4. Adapt this answer to fit the specific question wording
5. Good candidate question types:
   - "Where can I find economic data for multiple countries?"
   - "Is there a free API for GDP and macroeconomic indicators?"
   - "How to get World Bank and IMF data in one request?"

## Target question suggestions (search opendata.SE for these):
- https://opendata.stackexchange.com/questions/tagged/economics
- https://opendata.stackexchange.com/questions/tagged/api

## Answer Text

For comprehensive country-level economic data through a single endpoint, there are a few solid options:

**Primary sources** (official, authoritative — best for academic citations):

- [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392) — RESTful, free, no auth. Base URL: `https://api.worldbank.org/v2/`. Returns XML by default; add `?format=json` for JSON. Coverage: 16,000+ indicators, 200+ countries, many series going back to 1960.

  Example:
  ```
  GET https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json
  ```

- [IMF Data API](https://datahelp.imf.org/knowledgebase/articles/667681) — Good for financial/macro data consistent with WEO publications. SDMX-JSON format. Complex query structure but very powerful for time series retrieval.

- [OECD API](https://data.oecd.org/api/sdmx-json-documentation/) — Best for OECD member countries. Uses SDMX-JSON format.

**Aggregator option** (normalized, single format):

- [Statistics of the World API](https://statisticsoftheworld.com/api-docs) — aggregates World Bank, IMF, and WHO data into one normalized REST API. 440+ indicators, 218 countries. Free without auth (100 req/day), free API key for 1,000 req/day.

  This is useful if you want GDP, population, and life expectancy for a country in one request — rather than hitting three separate APIs that use different country code standards (ISO-2 vs ISO-3 vs UN numeric) and different time-series formats.

  Example:
  ```
  GET https://statisticsoftheworld.com/api/v2/country/USA
  ```
  Returns all available indicators for the US in a single normalized JSON object.

**Which to use when:**
- Academic research → World Bank or IMF directly (clear citation trail)
- Building a dashboard or application → aggregator APIs save significant normalization work
- OECD-specific analysis → OECD API directly
