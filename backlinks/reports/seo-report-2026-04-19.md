# SEO Report — 2026-04-19

## 1. Pages Indexed

`site:statisticsoftheworld.com` returns a limited snippet (4 pages visible in search results preview), consistent with ~1,360 pages tracked in GSC. Google is indexing correctly. Day 30 crawl acceleration milestone passed April 18 — check GSC for a post-milestone index jump.

## 2. Brand Visibility

`"statisticsoftheworld.com"` → **#1** ✅ (stable). Brand recognition is solid. Competitors visible below include Worldometer, Our World in Data, EarthStats — these are not threats, they confirm SOTW is in the same category.

## 3. Keyword Rankings (2026-04-19 search)

| Query | Position | URL |
|-------|----------|-----|
| `"statisticsoftheworld.com"` | **#1** ✅ | homepage |
| `statistics of the world 2026` | **#4** ⚠️ slight drop from #3 | /world-population |
| `inflation by country 2026 ranking` | **#6** (stable) + **#10** | /ranking/inflation-rate + /inflation-by-country |
| `unemployment rate by country 2026 ranking` | **#3** ✅ + **#10** | /ranking/unemployment-rate + /unemployment-by-country |
| `GDP by country 2026 ranking` | **Not ranking** | — |
| `largest economies world 2026 GDP` | **Not ranking** | — |
| `country comparison GDP per capita 2026` | **Not ranking** | — |
| `world statistics country comparison tool 2026` | **Not ranking** | — |

### Notes on ranking changes vs yesterday (2026-04-18):
- Unemployment #3 holding. Inflation #6 holding. Good sign — no regression after April 18 fixes.
- "statistics of the world 2026" dropped from #3 to #4 — /world-population fluctuating, likely algorithmic noise not a structural drop.
- GDP queries: Still completely absent from top 10. Domain authority is the bottleneck, but content gaps on `gdp-by-country` (factual error discovered — see below) don't help.

## 4. Competitor Landscape

### GDP by Country 2026
1. Worldometer (DA 90+) — comprehensive real-time data
2. StatisticsTimes — static tables, 2026 projections
3. Wikipedia — crowd-sourced, institutional trust
4. WorldPopReview — lightweight, good UX
5. VoronoiApp — visual/infographic approach
6. ResearchFDI, SPMIASAcademy, ClearTax — lower authority, beatable with backlinks
7. VisualCapitalist ×2 — infographic-focused, different format

**SOTW opportunity**: Positions 6–10 are beatable (ClearTax, ResearchFDI, SPMIASAcademy, VoronoiApp). With 3–5 more dofollow backlinks, SOTW should crack top 10. Content fix needed first (see below).

### Largest Economies World 2026
1. StatisticsTimes — tables dominant
2. Worldometer — DA90+
3–6. VisualCapitalist ×3 — visual angle they own
4. Statista — paywalled summary pages
7. ZeeNews, BajajFinServ — news/finance sites, not authoritative data sources
8. ClearTax — basic summary

**SOTW opportunity**: StatisticsTimes at #1 is beatable — their pages are thin on analysis. VisualCapitalist owns infographic/visual searches, not worth competing directly. ZeeNews/BajajFinServ type sites at #7–8 are clearly beatable.

### Inflation by Country 2026
1–2. TradingEconomics ×2 — real-time data advantage, very hard to displace
3. VisualCapitalist — infographic
4. WorldCountryData, WorldPopReview — similar tier to SOTW
5. Statista — paywalled
→ SOTW at #6 is a realistic ceiling without more backlinks. Maintaining is the goal.

### Unemployment 2026
1. WorldPopReview
2. WorldEconomics (Moody's Analytics)
3. **SOTW** ← already here ✅
4. WorldBank, Economy.com (Moody's), TradingEconomics below us

### Country Comparison Tool 2026
Dominated by WorldData.info, WorldCountryData, compareyourcountry.org (OECD), UN, TheGlobalEconomy.com, World Bank, CIA, IndexMundi. These are institutional or well-established tools. SOTW's compare tool is not indexed for this query — compare page lacks server-rendered text content (client component = thin page for crawlers).

## 5. GitHub PR Statuses

*Note: GitHub MCP tool restricted to dregon03/statisticsoftheworld — cannot verify external repo statuses directly. Based on tracker.json:*

| Repo | PR # | Status |
|------|------|--------|
| awesomedata/apd-core | #377 | **MERGED** ✓ (dofollow earned) |
| brandonhimpfen/awesome-apis | #17 | **CLOSED** (labeled "self-promotion") |
| public-api-lists/public-api-lists | #395 | pending_review (CI passed) |
| n0shake/Public-APIs | #721 | pending_review |
| marcelscruz/public-apis | #833 | pending_review |
| public-apis/public-apis | — | pending_submit (300K stars — highest priority) |
| ripienaar/free-for-dev | — | pending_submit (90K stars — high) |
| academic/awesome-datascience | — | pending_submit (28.8K stars) |
| antontarasenko/awesome-economics | — | pending_submit |
| niyumard/awesome-economics | — | pending_submit |
| erikgahner/awesome-statistics | — | pending_submit |
| brandonhimpfen/awesome-economics | — | pending_submit |
| brandonhimpfen/awesome-finance | — | pending_submit |
| hanlulong/awesome-ai-for-economists | — | pending_submit |

**Action**: Tom needs to submit pending PRs — ripienaar/free-for-dev and public-apis/public-apis are the highest leverage (90K + 300K stars, dofollow).

## 6. Critical Issue Found: `gdp-by-country` Factual Error

The `/gdp-by-country` page still says "India's rise to fourth place, surpassing Japan" in its editorial AND "India is the world's 4th largest economy in 2026" in its FAQ AND the meta description says "India now ranks #4, surpassing Japan."

**This is wrong.** Per the IMF April 2026 WEO (applied across india-economy, japan-economy, largest-economies on April 18), India ranks **#6** — behind Germany (#3), Japan (#4), UK (#5) — due to rupee depreciation and MoSPI base-year revision. Fix applied this session (see optimizations below).

This error was actively hurting SOTW for GDP queries — Google may distrust the page due to inconsistency with other SOTW pages (which are now correct).

## 7. Optimizations Performed This Session

### gdp-by-country (`/gdp-by-country/page.tsx`)
- **Meta description**: Removed "India now ranks #4, surpassing Japan" — replaced with accurate figures (US $32T, China $21T, Germany #3, Japan #4, India #6 at $4.15T)
- **OG description**: Updated to match accurate rankings
- **Editorial paragraph 3**: Rewrote to correctly state India is #6, explain IMF April 2026 WEO ranking (rupee depreciation 84.6→88.5/USD, MoSPI base-year revision), Japan holds #4, UK #5. Preserved growth trajectory narrative.
- **FAQ Q4**: Changed question from "Which country is 4th largest?" to "What are the top 5 largest economies by GDP?" — answer now correctly names US, China, Germany, Japan, UK as top 5 and explains India's #6 position.

### largest-economies (`/largest-economies/page.tsx`)
- Added **"Top 10 Largest Economies (2026)"** h2 section above the data table with specific GDP figures for #1–#10, targeting "top 10 largest economies 2026" and related queries
- Added **5th FAQ**: "Which country will overtake the US as the largest economy?" — targets long-tail queries about future economic shifts, provides substantive answer on China (PPP already larger, nominal by 2040s), India trajectory
- Expanded related links: added `compare`, `debt-by-country`, `germany-economy`, `uk-economy`

## 8. Recommendations

### Short-term (this week)
1. **Submit pending GitHub PRs immediately** — public-apis/public-apis (300K stars) and ripienaar/free-for-dev (90K stars) will provide the domain authority boost needed to crack GDP queries top-10
2. **Fix compare page** — add server-rendered editorial section visible to crawlers; compare page has no visible body text for Google
3. **Monitor /world-population** — position #4 after April 18 edits; if it drops below #6, consider refreshing the editorial

### Medium-term (next 2 weeks)
1. **`/ranking/gdp` page** — optimize for "GDP ranking 2026" — currently no editorial content
2. **Blog opportunity**: Publish "Top 10 Largest Economies in the World (2026): IMF Rankings Explained" — targets "largest economies 2026" directly with a blog post that is easier to rank
3. **`/compare` editorial**: Add static server-rendered text section explaining what countries/indicators you can compare — this is the key SEO gap on a page with strong ranking potential

### Structural gaps
- **GDP queries**: SOTW has strong GDP content but no top-10 ranking for "GDP by country 2026" — domain authority + the India factual error likely hurt rankings. Fix content first (done), then push PR backlinks.
- **Comparison tool**: No server-side text = Google can't index the tool's content. Medium priority.
- **"World statistics" query**: /world-population at #4 is the only page in top 10 for informational world statistics queries. Homepage is not ranking for this; needs an editorial boost.
