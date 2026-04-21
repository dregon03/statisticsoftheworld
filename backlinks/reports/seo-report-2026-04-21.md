# SEO Report — 2026-04-21

## 1. Site Health

### Pages Indexed
`site:statisticsoftheworld.com` search returns pages across all major content types (country pages, ranking pages, indicator pages). Google is actively indexing the site. Estimated indexed pages: ~1,360 (no significant change — consistent with previous reports). Index count appears stable post-Day-30 milestone.

### Brand Visibility
`"statisticsoftheworld.com"` → **#1** ✅ — Brand position is stable. Site appears prominently with the correct title and description. New competitor sites (EarthStats.info, worldstats.live) are appearing in results for the brand query, indicating the broader "world statistics" space is attracting new entrants.

---

## 2. Keyword Rankings (2026-04-21)

| Query | Position | URL | Change vs 2026-04-20 |
|-------|----------|-----|----------------------|
| `"statisticsoftheworld.com"` | **#1** | Homepage | ✅ Stable |
| `statistics of the world 2026` | **Not visible** | /world-population | ⚠️ Regression from #3 |
| `unemployment rate by country 2026 ranking` | **#4 and #10** | /ranking/unemployment-rate, /unemployment-by-country | ⚠️ Slight drop from #3/#10 |
| `inflation by country 2026 ranking` | **#8** | /ranking/inflation-rate | ⚠️ Slight drop from #7 |
| `GDP by country 2026` | **Not ranking** | — | No change |
| `largest economies world 2026 GDP ranking` | **Not ranking** | — | No change |
| `world statistics country comparison tool 2026` | **Not ranking** | — | No change |
| `country comparison GDP per capita 2026` | **Not ranking** | — | No change |
| `world economic data by country 2026 free` | **Not ranking** | — | No change |

### Key Observations
- **Regression alert**: `/world-population` dropped out of top results for "statistics of the world 2026" after holding #3. Likely algorithmic volatility rather than content issue — page is well-optimized. May recover without changes.
- **Unemployment holding**: #4 is respectable; WorldPopReview (#1), WorldEconomics (#2), WorldBank (#3) are all high-DA sites — hard to displace without more backlinks.
- **Inflation slight drop**: From #7 to #8. TradingEconomics, VisualCapitalist, WorldPopReview, WorldCountryData, Statista hold top 7.

---

## 3. Competitor Landscape

### `GDP by country 2026`
1. Worldometer — DA 90+, impossible to displace near-term
2. Wikipedia — DA 100, impossible
3. StatisticsTimes — growing fast, focused on IMF/WB data tables
4. WorldPopulationReview — consistently strong on economic keywords
5. ResearchFDI — new entrant with visual/chart-focused content
6. IMF (datamapper) — authoritative but poor UX
7. VisualCapitalist — strong at visual/infographic content
8. VoronoiApp — chart-first, growing fast
9. Statista — paywalled but brand authority
10. ClearTax — Indian tax/finance site, likely to be displaced

**SOTW opportunity**: ClearTax (#10) is beatable. Target the gap between Voronoi/Statista and lower results.

### `largest economies world 2026 GDP ranking`
1. StatisticsTimes — #1 consistently for this term
2. ClearTax — vulnerable position
3. Worldometer
4-7. Multiple VisualCapitalist entries (infographic advantage)
8. Wikipedia

**SOTW opportunity**: /largest-economies has been heavily optimized. Consider adding a comparison table or visualization hook to compete with VisualCapitalist's image-first content.

### `world statistics country comparison tool 2026`
1. worlddata.info — strong tool UX
2. WorldCountryData — broad coverage
3. compareyourcountry.org — OECD-backed
4. UN eGovKB
5. GlobalStats.info — **new competitor** not previously logged. Growing site with similar positioning to SOTW.
6. TheGlobalEconomy.com
7. CIA World Factbook
8. World Bank
9. IndexMundi
10. GlobalStatCompare.com — new entrant

**SOTW opportunity**: The /compare page needs more editorial depth and more inbound links from content pages to climb for this query.

### `inflation by country 2026 ranking`
1. VisualCapitalist — Map-based infographic
2. WorldCountryData — Clean data table
3. WorldPopulationReview
4-5. TradingEconomics (real-time advantage)
6-7. Statista (paywalled)
8. **SOTW /ranking/inflation-rate**
9. WorldBank data
10. (various)

**SOTW opportunity**: VisualCapitalist wins with map visualization. Consider whether an SVG/CSS map on the inflation page would improve CTR and time-on-page.

### `unemployment rate by country 2026 ranking`
1. WorldPopulationReview
2. WorldEconomics (Moody's Analytics)
3. WorldBank data
4. **SOTW /ranking/unemployment-rate** ← current position
5. VisualCapitalist (map)
6. economy.com (Moody's)
7. TradingEconomics
8. IMF datamapper
9. UK Parliament Library
10. **SOTW /unemployment-by-country**

**SOTW opportunity**: #4 for this query is strong for a 42-day-old domain. Moody's (economy.com) at #6 and TradingEconomics at #7 are beatable with more backlinks. WorldBank (#3) is a data page, not editorial — SOTW's editorial content is differentiated.

---

## 4. GitHub PR Status

- **dregon03/statisticsoftheworld**: No open PRs.
- **External repos** (public-apis, awesomedata, etc.) cannot be checked directly from this session due to MCP tool restrictions. Last known statuses per SEO-LOG.md:
  - awesomedata/apd-core #377: **MERGED** (dofollow backlink earned)
  - public-apis/public-apis #5771: Open (repo appears inactive)
  - marcelscruz/public-apis #833: Open — needs README.md fix
  - awesomedata/awesome-public-datasets #505: Open
  - public-api-lists/public-api-lists #395: Open — CI passed, awaiting maintainer
  - n0shake/Public-APIs #721: Open
  - brandonhimpfen/awesome-apis #17: CLOSED (labeled self-promotion)

---

## 5. Pages Optimized (2026-04-21)

### gdp-ppp-by-country
**Gaps addressed**: No OG tags, no BreadcrumbList, only 2 FAQs, only 2 editorial paragraphs, brand suffix missing from title.

**Changes made**:
- Added `| Statistics of the World` brand suffix to title
- Improved meta description with specific figures (China $35T+ PPP, India #3 at ~$15T)
- Added full OpenGraph block (url, type, richer description)
- Added BreadcrumbList to JSON-LD @graph
- Added WebPage type to JSON-LD @graph
- Added 3 new FAQs: (1) Why use PPP vs. nominal GDP, (2) India's GDP PPP 2026 (~$15T), (3) How PPP affects developing vs. developed country rankings
- Added 2 new editorial paragraphs: (1) 2026 tariff environment and PPP vs. nominal divergence, ±5–10% structural uncertainty in ICP data; (2) Sub-Saharan Africa underrepresentation, Indonesia/Brazil/Mexico PPP rankings, World Bank poverty threshold linkage
- Expanded BreadcrumbList UI from "Home / GDP PPP" to "Home / GDP Rankings / GDP PPP by Country"
- Added h2 "Related Economic Data" heading, expanded related links from 8 to 12

**Target queries**: "GDP PPP by country 2026", "purchasing power parity by country 2026", "China GDP PPP vs USA 2026", "India GDP PPP 2026"

### military-spending-by-country
**Gaps addressed**: No BreadcrumbList in schema, no OG url/type, generic 2026 content missing record-setting context.

**Changes made**:
- Improved meta description with specific 2026 data ($2.7T global record, Poland 4.1% NATO top, Ukraine 35%+)
- Added OpenGraph url and type
- Added BreadcrumbList to JSON-LD @graph
- Expanded FAQ 1 answer to mention Ukraine's 35%+ share
- Expanded FAQ 2 (US spending) with China/Russia figures
- Expanded FAQ 3 (NATO 2%) with 2026 compliance list (Poland 4.1%, Germany crossed threshold, Baltic states)
- Added FAQ 4: Top 10 defense spenders in absolute dollar terms 2026
- Added FAQ 5: How Russia-Ukraine war affected global defense spending (SIPRI record $2.7T, NATO surge, Ukraine 35%+ GDP, Russia 6–8% GDP)
- Added 4th editorial paragraph: 2026 SIPRI record $2.7T, European rearmament (Germany, Poland), Ukraine funding, Russia budget strain, Asia-Pacific buildup (Japan, Australia, South Korea), cross-link to blog post
- Added h2 "Related Data" heading, expanded related links (added Germany, Ukraine, defense analysis blog post)

**Target queries**: "military spending by country 2026", "defense spending by country 2026", "global military spending 2026", "NATO defense spending 2026"

### health-spending-by-country
**Gaps addressed**: No BreadcrumbList in schema, no OG url/type, missing 2026-specific content on GLP-1 drugs and aging population trends.

**Changes made**:
- Improved meta description with specific 2026 hooks (US 17%, OECD avg 9%, GLP-1 context, WHO 5% minimum)
- Added OpenGraph url and type
- Added BreadcrumbList to JSON-LD @graph
- Expanded FAQ 1 answer with source attribution and 2026 context
- Expanded FAQ 2 answer with life expectancy numbers (US 78.5, Japan 84+)
- Added FAQ 3: WHO minimum recommended health spending (5% of GDP, 34 countries below threshold)
- Added FAQ 4: How GLP-1 drugs are affecting healthcare spending in 2026 ($700–$1,200/month, CMS/NHS debate, 0.5–2pp GDP impact projection)
- Added FAQ 5: Why US spends so much more than other rich countries (administrative overhead, pharma pricing, procedure costs, emergency care reliance)
- Added 4th editorial paragraph: GLP-1 drug revolution and fiscal implications, aging population driven structural cost growth (Japan/Germany/Italy/Korea), WHO 5% threshold, shift from "how much" to "how efficiently" for wealthy nations
- Added h2 "Related Data" heading, expanded related links (added Military Spending, Aging Population, Japan Economy)

**Target queries**: "health spending by country 2026", "healthcare expenditure by country 2026", "US healthcare spending vs other countries 2026", "health spending GDP percentage 2026"

---

## 6. Actionable Recommendations

### Immediate (next 2 weeks)
1. **Backlinks priority**: Resume GitHub PR campaign. Key repos to target per tracker.json notes: `NajiElKotob/Awesome-Datasets`, `academic/awesome-datascience`, `brandonhimpfen/awesome-finance`. These are the highest-value untried repos.
2. **Reddit karma building**: Account should have sufficient age now. Consider first post in r/datasets or r/dataisbeautiful — link to visualization/comparison content.
3. **Monitor world-population regression**: If `/world-population` doesn't recover #3 for "statistics of the world 2026" by next report, investigate whether a title/H1 change might help.
4. **Product Hunt launch**: Domain is now 6+ weeks old. A Product Hunt launch could generate legitimate backlinks and traffic. Prepare listing.

### Content opportunities (next month)
1. **`co2-emissions-by-country`**: Untouched, high-search-volume topic. "CO2 emissions by country 2026" has moderate competition from Our World in Data, WorldBank. SOTW page needs BreadcrumbList, OG, editorial.
2. **`gdp-growth-by-country` ranking page**: Currently #8 for its query — was optimized April 13. Consider a fresh paragraph on 2026 IMF April WEO revisions.
3. **New editorial blog post**: "GDP PPP vs. Nominal: What the Rankings Really Mean in 2026" — targets the growing comparative research query space and creates internal link equity toward gdp-ppp-by-country.
4. **Comparison page depth**: The /compare tool doesn't appear for "country comparison" queries. Adding a 200-word "How to Compare Countries" editorial section to /compare could help.

### Technical
- Run a GSC report to identify pages with 5-50 impressions and CTR under 2% — these are the highest-leverage optimization targets.
- Check whether any ranking pages are cannibalized by their "by-country" equivalents (e.g., /ranking/inflation-rate vs /inflation-by-country both ranking for the same query).
