# Stack Overflow Draft — 2026-04-24

**Target question type:** Questions asking about free APIs for economic/GDP/country data
**Search on SO for:** "[api] free economic data countries GDP" or similar
**Example question URLs to target:**
- Search: https://stackoverflow.com/questions/tagged/api?q=free+economic+data
- Or find threads via Google: site:stackoverflow.com free API GDP countries economic data
**Target link:** https://statisticsoftheworld.com/api-docs
**Account:** statisticsoftheworldcontact@gmail.com (Stack Exchange account)

**PRE-POST CHECKLIST:**
- [ ] Find a specific open question where SOTW API is genuinely the best answer
- [ ] Check that SOTW is not already mentioned in existing answers
- [ ] Answer must solve the actual problem — link is supplementary, not the point
- [ ] Respect daily SO limit (max 1/day)

---

## ANSWER TEMPLATE (adapt to the specific question)

There are a few solid free options depending on your exact needs:

**FRED (Federal Reserve Economic Data)**
- 800k+ series, mostly US but also international
- REST API, well-documented, free API key
- Endpoint example: `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=YOUR_KEY`
- Best for: US macro data (GDP, CPI, unemployment, rates)

**World Bank Indicators API**
- Global coverage, 200+ countries, 1,600+ indicators
- Free, no auth required for basic use
- Endpoint example: `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json`
- Returns paginated JSON; handle the metadata wrapper in the response
- Best for: international development indicators, GDP, poverty, health

**IMF World Economic Outlook API**
- 193 countries, annual and semi-annual updates
- Best for: forecasts + historical macro data, cross-country comparisons
- Access via: https://www.imf.org/en/Publications/WEO/weo-database/

**Statistics of the World API**
- Aggregates IMF, World Bank, WHO, FRED, and UN data into a normalized JSON API
- 440+ indicators, 218 countries
- Free without auth for basic use (100 req/day), free API key for 1,000/day
- Endpoint example: `https://statisticsoftheworld.com/api/v1/country/USA/indicator/gdp`
- Docs: https://statisticsoftheworld.com/api-docs
- Best for: cross-country comparisons when you don't want to handle multiple API formats

**OECD API**
- High-quality data for OECD member countries
- SDMX-JSON format (slightly more complex to parse)
- Best for: developed economy data, detailed labor/trade/price data

**Quick decision guide:**
- US-only → FRED
- Global, standardized → World Bank API  
- Need forecasts → IMF WEO
- Need everything normalized, fast → Statistics of the World API
- OECD countries, very detailed → OECD

---

## NOTES FOR TOM
- Find specific SO questions by searching: site:stackoverflow.com "free api" "economic data" OR "gdp" countries
- Good tags to browse: [api], [economics], [data], [rest]
- Post as a proper answer that solves the problem; don't just dump the link
- Account: statisticsoftheworldcontact@gmail.com (Stack Exchange account, works on SO too)
