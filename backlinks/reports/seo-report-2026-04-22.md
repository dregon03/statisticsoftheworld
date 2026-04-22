# SEO Report — 2026-04-22

## Summary

- **Domain age**: ~43 days
- **Indexed pages**: ~1,360 (stable; no significant change from prior sessions)
- **Confirmed rankings**: Unemployment #4 (slight improvement from #4/#10 to #4/#9); Inflation slipped to #9/#10 (from #8/#10 yesterday); "statistics of the world 2026" NOT VISIBLE (second consecutive day — was ~#4 April 20)
- **Backlinks**: 2 dofollow confirmed (awesomedata/apd-core #377 merged; dev.to article)

---

## Keyword Rankings (2026-04-22 web search)

| Query | SOTW Position | Top Competitors |
|-------|--------------|-----------------|
| `"statisticsoftheworld.com"` | **#1** ✅ | — |
| `statistics of the world 2026` | **Not visible** ⚠️ | Worldometer #1, StatisticsTimes #2, PopulationStat #3 |
| `unemployment rate by country 2026 ranking` | **#4** (`/ranking/unemployment-rate`), **#9** (`/unemployment-by-country`) ✅ | WorldPopReview #1, WorldEconomics #2, WorldBank #3 |
| `inflation by country 2026 ranking` | **#9** (`/ranking/inflation-rate`), **#10** (`/inflation-by-country`) ⚠️ | VisualCapitalist #1, WorldPopReview #2, WorldCountryData #3 |
| `GDP by country 2026` | **Not ranking** | Worldometer #1, StatisticsTimes #2, Wikipedia #3, WorldPopReview #4, ResearchFDI #5 |
| `world statistics country comparison tool 2026` | **Not ranking** | worlddata.info #1, WorldCountryData #2, compareyourcountry.org #3, UN #4 |
| `country comparison GDP per capita 2026` | **Not ranking** | WorldPopReview #1, Worldometer #2, StatisticsTimes #3, VisualCapitalist #4 |

### Notable shifts vs. April 21

- **Unemployment**: Improved from #4/#10 → #4/#9 ✅
- **Inflation**: Slipped from #8/#10 → #9/#10 ⚠️ (concerning trend — needs content reinforcement)
- **"statistics of the world 2026"**: Still not visible (second day — was #4 on April 20; likely algo volatility on world-population page)

---

## Competitor Landscape

### GDP by Country 2026
Positions 9–10 (ClearTax, VoronoiApp) are soft content-site targets — beatable once domain authority grows. Top 5 are institutional/high-DA sites.

### Inflation Ranking
- TradingEconomics holds multiple positions with real-time data advantage
- VisualCapitalist wins on data visualization + shareability
- WorldPopReview wins on content breadth
- SOTW gap: weaker content depth on ranking page; inflation-by-country missing BreadcrumbList JSON-LD

### Unemployment Ranking
- WorldPopReview #1, WorldEconomics #2, WorldBank #3 — high-authority institutional sites
- SOTW at #4 is strong for a 43-day-old domain; gap to #3 is closeable with better editorial depth
- `/unemployment-by-country` at #9 — thin content (only 2 editorial paragraphs, no OG metadata, no BreadcrumbList JSON-LD, no 2026-specific content)

### World Statistics Comparison Tool
- Comparison tool not surfacing; competitors have older domains + more backlinks
- Opportunity: SOTW has 440+ indicators vs. WorldCountryData's 12 — need to highlight this advantage in meta/editorial

### New Competitors
- `globalstats.info` and `globalstatcompare.com` both appearing in comparison tool results — new entrants copying SOTW's positioning

---

## Backlink PR Statuses

External repo PRs (not accessible via this session's GitHub MCP scope):

| Repo | PR | Stars | Last Known Status |
|------|-----|-------|-------------------|
| public-apis/public-apis | #5771 | 420K | Open (repo dead — likely stays open) |
| marcelscruz/public-apis | #833 | 8.7K | Open — needs move to README.md |
| awesomedata/apd-core | #373 | 65K | Open |
| awesomedata/awesome-public-datasets | #505 | 65K | Open |
| public-api-lists/public-api-lists | #395 | 14K | Open — CI passed |
| n0shake/Public-APIs | #721 | 23K | Open |
| awesomedata/apd-core | #377 | 65K | **MERGED** ✓ (dofollow backlink) |

**Recommendation**: Tom should check marcelscruz/public-apis #833 to move the entry to README.md — the fix is minimal and the repo has 8.7K stars.

---

## Optimization Targets (Today)

### Selected Pages

1. **`/unemployment-by-country`** (#9, most content gaps):
   - Add BreadcrumbList JSON-LD (missing entirely)
   - Add OpenGraph metadata (missing)
   - Add 3rd editorial paragraph on 2026 tariff-driven manufacturing shifts and labor market dynamics
   - Add 2 new FAQs (tariff-unemployment link; lowest unemployment developed economies)
   - Add h2 heading to related links section

2. **`/inflation-by-country`** (#10, slipping):
   - Add BreadcrumbList to JSON-LD @graph (missing)
   - Add 4th editorial paragraph: 2026 US tariff pass-through to CPI, China deflation dynamic, Fed's dilemma
   - Add 4th FAQ: "How do 2026 US tariffs affect inflation?"
   - Add 5th FAQ: "Which countries have the lowest inflation in 2026?"

3. **`/ranking/[slug]`** (powers both /ranking/inflation-rate #9 and /ranking/unemployment-rate #4):
   - Inflation-rate: add 4th editorial paragraph with 2026 tariff-driven inflation context
   - Unemployment-rate: add 4th editorial paragraph with 2026 labor market dynamics (AI, tariff reshoring)

---

## Strategic Recommendations

1. **Inflation content is eroding** — two consecutive days of position slippage. Act now before further drop. Focus: BreadcrumbList schema fix on inflation-by-country, then deeper editorial.

2. **World-population visibility loss is likely algorithmic** — page content is already strong (5 editorial paragraphs, 5 FAQs). Don't add filler; wait for algorithm to stabilize.

3. **GDP by country gap** — ClearTax (#10) and VoronoiApp (#9) are beatable with better editorial. Key missing piece: a "Top 10 GDP by Country 2026" summary with YoY changes, which directly satisfies query intent.

4. **Comparison tool opportunity** — SOTW's 440+ indicator advantage is not reflected in meta descriptions or editorial. Adding a dedicated editorial about the comparison tool's depth could help the `/compare` page.

5. **Backlink priority** — With 43-day domain, DA is the primary bottleneck for GDP-related queries. The marcelscruz PR fix is low-effort, high-value. Medium-term: dev.to second article, indie hackers post.
