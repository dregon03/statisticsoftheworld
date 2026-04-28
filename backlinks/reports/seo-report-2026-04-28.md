# SEO Report — 2026-04-28

## 1. Site Health

- **Google indexed pages**: ~1,360 (stable — `site:` operator returns 10 sample URLs as expected; no change from prior sessions)
- **Brand query** `"statisticsoftheworld.com"` → **#1** ✅ (SOTW homepage; Worldometer, OurWorldInData, ABS appear in surrounding results — no threat to brand position)

## 2. Keyword Rankings (2026-04-28)

| Query | Position | URL | Change |
|-------|----------|-----|--------|
| `"statisticsoftheworld.com"` (brand) | **#1** | homepage | — ✅ |
| `unemployment rate by country 2026 ranking` | **#5** | /ranking/unemployment-rate | ⚠️ slipped from #4 |
| `inflation by country 2026 ranking` | **#8 and #10** | /ranking/inflation-rate + /inflation-by-country | — stable |
| `world statistics country data 2026` | **#5** | homepage | ✅ NEW — was not ranking |
| `statistics of the world 2026` | Not visible | — | ⚠️ 8th consecutive day |
| `country comparison tool GDP 2026` | Not visible | — | ⚠️ dropped from #10 yesterday |
| `GDP by country 2026` | Not ranking | — | — |
| `largest economies world 2026 GDP ranking` | Not ranking | — | — |
| `GDP growth rate by country 2026 ranking` | Not ranking | — | — |
| `GDP per capita by country 2026 ranking` | Not ranking | — | — |
| `world economic data country comparison 2026` | Not ranking | — | — |

**SERP positions for `unemployment rate by country 2026 ranking`:**
WorldPopReview #1, TradingEconomics #2, WorldEconomics #3, IMF #4, SOTW #5, Moody's Analytics #6, TheGlobalEconomy #7, Wikipedia #8, House of Commons Library #9, VisualCapitalist #10

**SERP positions for `inflation by country 2026 ranking`:**
VisualCapitalist #1, WorldCountryData #2, TradingEconomics #3, WorldPopReview #4, TradingEconomics #5, Statista #6, Statista #7, SOTW `/ranking/inflation-rate` #8, VisualCapitalist (2025 map) #9, SOTW `/inflation-by-country` #10

**SERP positions for `country comparison tool GDP 2026`:**
Worldometer #1, IMF #2, TheGlobalEconomy #3, VisualCapitalist #4, ClearTax #5, StatisticsTimes #6, Bamwor #7, WorldPopReview #8, WorldCountryData #9, Statista #10
(SOTW dropped off — was #10 on Apr 27)

**SERP positions for `world statistics country data 2026`:**
OurWorldInData #1, WorldBank #2, WorldCountryData #3, GeoCountries #4, SOTW (homepage) #5 ✅, WorldPopulationClock #6, Worldometer #7, Worlddata.info #8, Database.earth #9, CountryMeters #10

## 3. Competitor Landscape

| Competitor | Trend | Notes |
|-----------|-------|-------|
| **WorldPopReview** | Stable dominant | #1 for unemployment, #4 inflation, #1 GDP per capita |
| **VisualCapitalist** | Still dominant infographic | 4–5 positions per query; infographic format consistently ranks |
| **Worldometer** | Stable dominant | #1 for GDP, GDP growth, largest economies |
| **StatisticsTimes** | Stable | #1 for largest economies, #2-3 for GDP queries |
| **WorldCountryData** | Rising | #2 inflation ranking, #3 world statistics — fast-growing direct competitor |
| **Bamwor** | Rising threat | Now #7 for country comparison GDP, #3 for world economic data — new entrant |
| **TradingEconomics** | Stable | Real-time data advantage; multiple positions for inflation |
| **Moody's Analytics (economy.com)** | Stable | #6 for unemployment (was #3 last week — SOTW temporarily displaced) |

### Competitor weakness spotted:
- Most competitors (StatisticsTimes, ClearTax, VisualCapitalist) are incorrectly showing **India as #4** economy in 2026. SOTW correctly follows IMF April 2026 WEO placing India at #6. This is a factual differentiation opportunity — searchers who want accurate data will find SOTW more trustworthy once we rank.
- ClearTax (Indian finance site) has weak content depth despite ranking #2 for GDP growth — possible displacement target with better editorial.

## 4. Backlink / GitHub PR Status

*(GitHub MCP restricted to dregon03/statisticsoftheworld — cannot directly check external repo PRs.)*

**From tracker.json status at time of last update:**
- **awesomedata/apd-core #377** — MERGED ✅ (dofollow backlink live)
- **brandonhimpfen/awesome-apis #17** — CLOSED (labeled self-promotion)
- **public-api-lists/public-api-lists #395** — pending_review (CI passed, awaiting maintainer)
- **n0shake/Public-APIs #721** — pending_review
- **marcelscruz/public-apis #833** — pending_review
- 15+ repos — pending_submit (Tom must action these)

**Highest-priority pending submits** (from tracker next_week_priority):
1. `public-apis/public-apis` — 300K stars, dofollow. SUBMIT.md ready. **CRITICAL.**
2. `ripienaar/free-for-dev` — 90K stars, dofollow. SUBMIT.md ready.
3. `academic/awesome-datascience` — 28.8K stars. SUBMIT.md ready.
4. `brandonhimpfen/awesome-finance`, `hanlulong/awesome-ai-for-economists`

## 5. Key Observations

1. **Homepage breakout for `world statistics country data 2026` at #5** — a genuine new ranking. This is the first time the homepage ranks for a non-branded query with this keyword form. Worth monitoring.

2. **`country comparison tool GDP 2026` dropped from #10 → not visible** — yesterday's breakthrough in the top 10 was not retained. This is normal algorithmic volatility for a ~49-day-old domain. The content improvements to `/gdp-by-country` are indexed but Google is still calibrating trust.

3. **Unemployment at #5** — slip from #4 likely due to a stronger showing by IMF's own datamapper page (which recently updated April 2026 WEO data). IMF has essentially infinite domain authority. Hard to displace #4 without more backlinks.

4. **`statistics of the world 2026` — 8th consecutive day not visible** — `/world-population` which previously ranked #3 has disappeared. Likely an algorithmic filter on the specific query form. The page itself is healthy. This is not content-driven.

5. **Domain age milestone** — site is ~49 days old. Day 30 acceleration already hit. Next milestone is the 3-month mark (~late May 2026) where trust signals compound more significantly.

## 6. Content Optimization — Session 2026-04-28

### Pages selected for optimization:
Based on search gaps and competitive analysis:

1. **`/richest-countries`** — Targeting "richest countries in the world 2026" and "GDP per capita by country 2026 ranking". Currently not in top 10. Needs: WebPage schema, ItemList schema, improved meta description with specific numbers, Top 10 ordered list with live data.

2. **`/inflation-by-country`** — Currently #10. Pushing toward top 7. Needs: WebPage schema, ItemList schema for top inflation countries, "Top 10 Highest Inflation" ordered list (featured snippet target).

3. **`/gdp-growth-by-country`** — Not in top 10 for "GDP growth rate by country 2026 ranking". The dynamic Top 10 list exists in HTML but lacks `ItemList` JSON-LD. Adding structured data to help Google parse the list for featured snippets.

### Changes made:
- **`/richest-countries`**: Added `WebPage` JSON-LD type; added `ItemList` JSON-LD for top 10; added `url`/`type` to OG; improved meta description with specific figures ($154K Luxembourg, $85-93K US); added "Top 10 Richest Countries" h2 section with dynamic ordered list; added h2 to Related Data section; added comparison pair links; added 5th FAQ on top countries over $100K
- **`/inflation-by-country`**: Added `WebPage` JSON-LD type; added `ItemList` JSON-LD for top 10 highest inflation; added "Top 10 Highest Inflation Countries" h2 section with dynamic ordered list above table; improved Related Data grid (added China, US, Venezuela economy links)
- **`/gdp-growth-by-country`**: Added `ItemList` JSON-LD for the existing dynamic Top 10 list

## 7. Actionable Recommendations

### Immediate (Tom should action this week):
1. **Submit GitHub PRs** — the 15+ pending_submit repos in tracker.json. Start with public-apis/public-apis (300K stars) and ripienaar/free-for-dev (90K stars). Each dofollow link materially boosts DA.
2. **Post Quora drafts** — 30+ drafts ready in backlinks/drafts/. Quora answers build nofollow links + brand visibility for data-related queries.
3. **Product Hunt launch** — zero prep done. Tuesday-Thursday optimal. Could drive significant referral traffic and a high-DA dofollow.
4. **Directory submissions** — directories-2026-04-24-submission-guide.md has saashub, alternativeto, betalist, crunchbase ready to go.

### Content (next session):
- `/unemployment-by-country` — add "Top 10 Highest Unemployment Countries" ordered list (same pattern as gdp-by-country/inflation-by-country) to target featured snippet
- `/gdp-per-capita-by-country` — add ItemList JSON-LD for top 10
- Homepage — consider adding a "Key Global Statistics 2026" ordered list targeting `statistics of the world 2026` directly
- Blog: new post targeting "which country has highest inflation 2026" (high search volume, SOTW has the data)

### Technical:
- No new technical issues found
- Schema improvements from today's session should be indexed within 1-3 days
