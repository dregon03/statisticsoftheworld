# SEO Report — 2026-04-25

## 1. Pages Indexed

- `site:statisticsoftheworld.com` returns ~7 result snippets (browser-visible), but this is an unreliable proxy. Actual indexed count remains ~1,360 based on GSC history.
- No sudden de-indexing detected — country, ranking, and indicator pages still appearing.

---

## 2. Keyword Rankings (2026-04-25)

| Query | Position | URL | Notes |
|-------|----------|-----|-------|
| `"statisticsoftheworld.com"` | **#1** ✅ | / | Brand holding |
| `unemployment rate by country 2026 ranking` | **#3** ✅ | /ranking/unemployment-rate | WorldPopReview #1, WorldEconomics #2 — HOLDING |
| `inflation by country 2026 ranking` | **#8 and #10** ✅ | /ranking/inflation-rate + /inflation-by-country | WorldCountryData #1, VisualCapitalist #2, TradingEconomics ×2 #3-4, WorldPopReview #5, TradingEconomics #6-7, SOTW #8/#10 |
| `statistics of the world 2026` | **Not visible** ⚠️ | — | 5th consecutive day — likely Panda-type algorithmic filter on /world-population for this query |
| `world statistics country data 2026` | **Not visible** | — | Dominated by OurWorldInData, WorldBank, WorldCountryData, CIA |
| `GDP by country 2026` | **Not ranking** | — | Worldometer #1, Wikipedia #2, StatisticsTimes #3, IMF #4, VisualCapitalist #5-6, ResearchFDI, Statista |
| `largest economies world 2026 GDP ranking` | **Not ranking** | — | StatisticsTimes #1, Worldometer #2, VisualCapitalist ×3, ClearTax, Wikipedia, VoronoiApp, Statista |
| `GDP growth rate by country 2026 ranking` | **Not ranking** | — | Worldometer #1, ClearTax #2, StatisticsTimes #3, WorldPopReview #4, VisualCapitalist ×3, VoronoiApp, ResearchFDI |
| `country comparison tool GDP 2026` | **Not ranking** | — | Worldometer #1, VisualCapitalist #2, TheGlobalEconomy #3, WorldPopReview #4, StatisticsTimes #5, ClearTax, IMF, WorldCountryData |
| `world economic data country comparison 2026` | **Not ranking** | — | Worldometer #1, VisualCapitalist ×2, TradingEconomics, StatisticsTimes, IMF ×2, Statista |
| `india economy GDP 2026 statistics` | **Not ranking** | — | EduNovations, Wikipedia, PIB India, Worldometer, CNBC, WorldEconomics, IBEF |

---

## 3. Competitor Landscape

### GDP / Largest Economies
- **Worldometer** (#1 for all GDP queries) — DA90+, simple numeric tables, high crawl frequency
- **StatisticsTimes** (#1-3 for GDP ranking, world GDP) — dedicated GDP/PPP ranking tables, strong academia backlinks
- **Wikipedia** (#2-5 for most GDP queries) — institutional authority, no way to displace
- **VisualCapitalist** — dominating with visual/infographic format across 3-10 positions for GDP, inflation, growth
- **WorldPopReview** — #1 unemployment, #4-5 inflation, #4 GDP growth — review-style pages with short editorial + data table
- **ClearTax** (#2 GDP growth, #6 GDP) — Indian finance site, surprising strength — likely benefiting from India GDP search volume spike

### New Observations
- **WorldCountryData** now at **#1** for inflation ranking (up from #2 yesterday) — aggressive growth
- **VoronoiApp** appearing more frequently (#6-7 for GDP growth, #8 for largest economies)
- **ResearchFDI** showing for GDP by country — visual breakdown format
- India GDP rank discrepancy: StatisticsTimes/VisualCapitalist show India as #4 (passing Japan); IMF April 2026 WEO has India #6. Our pages follow IMF data (correct).

### Opportunities
- **GDP growth rate by country**: WorldPopReview (#4) and VoronoiApp (#7) are beatable — both have thin editorial. SOTW's page has stronger content but lacks a top-10 featured-snippet list.
- **Inflation by country**: Positions #1-7 held by WorldCountryData, VisualCapitalist, TradingEconomics×2, WorldPopReview, TradingEconomics, Statista. Breaking #5 requires either a high-authority backlink or a featured-snippet grab.
- **India economy**: No pure editorial/economy page in top results for "india economy GDP 2026 statistics" — mostly news and government sites. SOTW's page could rank if it targets this more explicitly.

---

## 4. Backlink PR Status

GitHub MCP tools restricted to `dregon03/statisticsoftheworld` — no open PRs on the SOTW repo itself. External backlink PRs (public-apis, awesomedata, etc.) cannot be checked via MCP.

**From tracker.json (last run 2026-04-24):**
- awesomedata/apd-core #377 — **MERGED** ✓ (dofollow backlink active)
- dev.to article — **Live** ✓ (dofollow backlink active)
- public-api-lists/public-api-lists #395 — Open, CI passed, awaiting maintainer
- n0shake/Public-APIs #721 — Open, no reviews
- awesomedata/apd-core #373 — Open
- awesomedata/awesome-public-datasets #505 — Open
- public-apis/public-apis #5771 — Open (repo dead, unlikely to merge)
- marcelscruz/public-apis #833 — Open, needs README.md fix

**Total confirmed dofollow backlinks: 2**

---

## 5. Actionable Recommendations

### High Priority
1. **Fix india-economy FAQ critical error**: FAQ1 says "having overtaken Japan" but India is #6 (below Japan at #4) per IMF April 2026 WEO — factually wrong, damages credibility (**done this session**).
2. **Add Top-10 list to gdp-growth-by-country**: Featured snippet opportunity — WorldPopReview and VoronoiApp are beatable with a clear ordered list. (**done this session**)
3. **gdp-growth-by-country WebPage schema**: Missing WebPage type in @graph — adds schema completeness (**done this session**).
4. **largest-economies WebPage schema + title improvement**: Minor schema gap + title CTR opportunity (**done this session**).

### Medium Priority
5. **Submit marcelscruz/public-apis #833 fix**: Move entry to README.md instead of /db folder — easy merge candidate (8.7K stars).
6. **Directory listings**: SaaSHub, AlternativeTo, APIList.fun — SOTW confirmed not listed on any per Apr 24 research (see directories-2026-04-24-submission-guide.md).
7. **Medium article**: Draft on "Best Free Country Comparison Tools 2026" — natural link to SOTW comparison tool.
8. **Product Hunt launch**: Domain now ~45 days old — still early but PH could drive 50-200 backlinks in a day if well-timed.

### Watch
9. **WorldCountryData growth**: Now #1 for inflation — similar positioning to SOTW. Monitor closely.
10. **"statistics of the world 2026" invisibility**: 5 consecutive days with /world-population not showing. Consider whether to add fresh 2026 editorial to world-population page or try a different URL (homepage?) for this query.

---

## 6. Pages Optimized This Session

See SEO-LOG.md for detailed change descriptions:
- `india-economy`: Fixed FAQ1 critical factual error; improved meta title for CTR
- `gdp-growth-by-country`: Added Top-10 fastest-growing economies list; WebPage schema; new FAQ
- `largest-economies`: Added WebPage schema; h2 on related links; title CTR improvement
