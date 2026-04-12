# SEO Report — 2026-04-12

## Executive Summary

Domain is ~13 days old. Inflation by country holds at **#8 and #9** for "inflation by country 2026 ranking" — stable vs. yesterday. No movement on GDP by country or comparison tool queries. Key gap identified today: **unemployment-by-country** and **gdp-per-capita-by-country** both lack openGraph metadata, BreadcrumbList schema, and substantive 2026 editorial — easy wins. GitHub PR statuses cannot be verified this session (MCP restricted to own repo only — check via browser). Three pages optimized: unemployment-by-country, gdp-per-capita-by-country, inflation-by-country.

---

## 1. Site Indexing & Brand Visibility

### `site:statisticsoftheworld.com`
- Web search preview: **1 result visible** (homepage only) — same as yesterday
- GSC not accessible this session; last known count: **~1,360 indexed pages** (2026-04-09)
- Sitemap: 5,691 URLs submitted; ~24% indexed — expected for domain age
- **Day 30 milestone: April 18** — indexing expected to accelerate
- Action: No change needed; continue content + backlink cadence

### Brand Query: `"statisticsoftheworld.com"`
- SOTW homepage: **#1** ✓
- NamePros domain-for-sale listing persists (legacy, not actionable)
- Competing similar-name sites: worldstat.com, worldometers.info, world-statistics.org, worldofstatistics.org — none are SOTW

---

## 2. Keyword Positions (2026-04-12)

| Query | SOTW Position | vs. Yesterday | Top Competitor |
|-------|---------------|---------------|----------------|
| `"statisticsoftheworld.com"` (brand) | **#1** | Stable | worldometers.info |
| `statistics of the world 2026` | **Not visible** | Stable (still out) | worldometers.info (#1), statisticstimes.com (#2) |
| `GDP by country 2026` | **Not ranking** | Stable | worldometers.info (#1), Wikipedia (#2), statisticstimes.com (#3) |
| `inflation by country 2026 ranking` | **#8 and #9** | Stable (vs. slight slip yesterday) | visualcapitalist.com (#1), worldcountrydata.com (#2) |
| `world statistics country comparison tool` | **Not ranking** | Stable | worlddata.info (#1), GlobalEdge/MSU (#2), CIA Factbook (#3) |
| `country comparison tool GDP 2026` | **Not ranking** | New check | worldometers.info (#1), theglobaleconomy.com (#3) |
| `world economic data comparison 2026` | **Not ranking** | New check | data.worldbank.org (#1), tradingeconomics.com (#3) |

### Key Observations
- **Inflation stable at #8/#9**: Not a regression — holding. Both `/inflation-by-country` and `/ranking/inflation-rate` on page 1. Improving meta description could lift CTR without a rank change.
- **GDP by country**: Competitors 7-10 are from low-authority publishers — beatable as domain ages. No action other than maintaining editorial depth.
- **"statistics of the world" queries**: Still not visible. Domain trust calibration in progress. Nothing to do but wait + build backlinks.
- **Comparison tool queries**: CIA Factbook, IndexMundi, UN DESA dominate. Our comparison tool needs more external links from education/research contexts to compete.

---

## 3. Competitor Analysis

### "GDP by country 2026" — Top 10 (2026-04-12)
1. worldometers.info — DA90+, real-time data
2. en.wikipedia.org — Unbeatable authority
3. statisticstimes.com — Dedicated GDP ranking pages
4. researchfdi.com — Visual breakdown article
5. worldpopulationreview.com — Strong country rankings
6. visualcapitalist.com — PPP chart article
7. voronoiapp.com — Top 50 visualization
8. cleartax.in — Indian finance publisher
9. worldeconomics.com — Rankings tool
10. worldcountrydata.com — WorldFacts rankings

**Verdict**: Positions 8-10 (ClearTax, WorldEconomics, WorldCountryData) are beatable with more backlinks. Content parity exists. ETA for SOTW entry: ~30 days if link velocity holds.

### "Inflation by country 2026 ranking" — Top 10 (2026-04-12)
1. visualcapitalist.com — Infographic/map, high shares
2. worldcountrydata.com — Rankings-focused
3. worldpopulationreview.com — Editorial
4. tradingeconomics.com — Real-time (two URLs)
5. statista.com — Paywalled
6. visualcapitalist.com (2025 piece)
7. **statisticsoftheworld.com/ranking/inflation-rate** ✅
8. **statisticsoftheworld.com/inflation-by-country** ✅
9. statista.com (second URL)
10. statista.com (third URL)

**Verdict**: Positions 4-6 (TradingEconomics, Statista) could be displaced. TradingEconomics has real-time data advantage but its pages are less editorial. Statista is paywalled. The gap between SOTW and position 4/5 is primarily domain authority.

### "World statistics country comparison tool" — Top 10 (2026-04-12)
1. worlddata.info
2. GlobalEdge (MSU)
3. CIA World Factbook
4. IndexMundi
5. UN DESA eGov
6. globalstatcompare.com
7. mappr.co
8. versus.com
9. UN CountryStats App
10. compareyourcountry.org (OECD)

**Verdict**: These are all institutional or long-established sites. Our comparison tool at `/compare` needs direct external links from data journalism, education, or research contexts to compete. Product Hunt launch would help.

### "Unemployment rate by country 2026" — opportunity check
Top results: worldpopulationreview.com, tradingeconomics.com, statista.com, countryeconomy.com. SOTW not ranking. **Editorial gap exists on our page** — no 2026-specific context, missing schema. Target: page 2 entry within 2-3 weeks post-optimization.

### "GDP per capita by country 2026" — opportunity check
Top results: worldpopulationreview.com, worldometers.info, wikipedia, statisticstimes.com. SOTW not ranking. Page is thin — fixing this could get SOTW to page 2 quickly.

---

## 4. GitHub PR Status

MCP tools restricted to `dregon03/statisticsoftheworld` only — cannot verify external PR statuses programmatically. Based on tracker.json and last manual check:

| PR | Repo | Stars | Status (last known) |
|----|------|-------|---------------------|
| #395 | public-api-lists/public-api-lists | 14K | CI approved, pending human review |
| #377 | awesomedata/apd-core | 65K | Pending review |
| #17 | brandonhimpfen/awesome-apis | 580 | Pending review |
| #721 | n0shake/Public-APIs | 23K | Pending review |
| #833 | marcelscruz/public-apis | 8.7K | Pending (conflict fixed) |

**Action**: Manually verify these PRs via browser. GitHub weekly limit resets April 14 — queue: antontarasenko/awesome-economics, niyumard/awesome-economics, erikgahner/awesome-statistics.

---

## 5. Pages Optimized This Session

### unemployment-by-country
**Problems fixed**:
- Added `openGraph` metadata (was missing entirely)
- Added `BreadcrumbList` JSON-LD schema
- Added new FAQ: tariff impact on global employment in 2026
- Added new editorial paragraph: 2026 labor market dynamics (manufacturing shifts, Gulf exceptions, youth unemployment)
- Added "Related Rankings" h2 heading
- Added gdp-by-country and more links to related section

### gdp-per-capita-by-country
**Problems fixed**:
- Added `openGraph` metadata (was missing entirely)
- Added `BreadcrumbList` JSON-LD schema
- Improved meta description (added specific data: top tier $100K+, US figures)
- Added new editorial paragraph: 2026 dollar-strength distortions and fastest-rising economies
- Added new FAQ: fastest-rising GDP per capita in 2026 (Guyana)
- Added "Related Data" h2 heading + more related links

### inflation-by-country
**Problems fixed**:
- Improved meta description with specific data points (Venezuela, global average, tariff angle)
- Added new FAQ: which countries have the lowest inflation in 2026
- Added `unemployment-by-country` link to related section

---

## 6. Actionable Recommendations

### Immediate (this week)
1. **Submit next GitHub PRs on April 14** (weekly limit reset): antontarasenko/awesome-economics, niyumard/awesome-economics, erikgahner/awesome-statistics
2. **Post 3 Quora answers** from tracker.json draft queue (quora-2026-04-11-*.md files)
3. **Post dev.to article** (devto-2026-04-10-economic-data-apis.md is ready to publish)
4. **Manually check GitHub PRs** — especially public-api-lists/public-api-lists/pull/395 which had CI approval

### This Week
5. **Product Hunt launch** — prepare assets. Domain is 13 days old — a PH launch now drives direct backlinks, traffic, and brand awareness. Tuesday-Thursday window is ideal.
6. **Build the Medium article** (medium-2026-04-11-brics-vs-g7.md is drafted) — this is a high-value nofollow backlink from a DA90+ domain

### Longer Term (next 2-3 weeks)
7. **Wikipedia approach** — wait until domain is 30+ days old with more indexed pages. Target "List of countries by GDP" as a references entry.
8. **Focus on "unemployment rate by country"** — the editorial improvements today should help. Search TradingEconomics and WorldPopReview are beatable with more content + links.
9. **"GDP per capita by country 2026"** — same approach. The keyword is searched heavily (WorldPopReview dominates). With BreadcrumbList + better editorial, SOTW can reach page 2.

---

## 7. SEO Health Scorecard

| Metric | Status | Target |
|--------|--------|--------|
| Indexed pages | ~1,360 / 5,691 | 3,000+ (by May) |
| Avg position (GSC) | 11.9 | <10 |
| Inflation keyword | Page 1 (#8/#9) | Top 5 |
| GDP keyword | Not ranking | Page 2 (by June) |
| Unemployment keyword | Not ranking | Page 2 (by May) |
| GDP/capita keyword | Not ranking | Page 2 (by May) |
| Domain age | 13 days | 30-day milestone: April 18 |
| Live backlinks | 8 | 50+ (by May) |
