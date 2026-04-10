# SEO Report — 2026-04-10

## Executive Summary

Domain is ~11 days old. Indexed pages stable at ~1,360. Outstanding win: SOTW ranks **twice on page 1** for "inflation by country 2026". Not yet ranking for the high-competition "GDP by country 2026" query. Brand presence is clean. Tariff war context (Liberation Day anniversary) is a major editorial opportunity being exploited in blog posts — needs to extend to economy landing pages.

---

## 1. Site Indexing & Brand Visibility

### `site:statisticsoftheworld.com`
- Web search preview shows homepage prominently; full index count requires GSC
- GSC as of 2026-04-09: **1,360 indexed pages** (sitemap has 5,691 URLs submitted)
- ~24% of submitted URLs indexed — normal for a 11-day-old domain; expect continued crawl
- Sitemap: /sitemap/0.xml submitted, 5,691 URLs; RSS /feed also submitted

### Brand Query: `"statisticsoftheworld.com"`
- SOTW homepage appears as **result #1** — brand query is clean ✓
- **Concern**: A NamePros domain listing (`namepros.com/threads/6-domains-for-sale/...statisticsoftheworld-com`) appears in results — the domain was previously listed for sale. This is a legacy signal, not actionable, but worth monitoring. No impact on rankings.
- Competitors appearing in brand SERP: worldstat.com, worldometers.info, world-statistics.org, worldofstatistics.org, worldstatspro.com — all name-similar but not SOTW

---

## 2. Keyword Positions

| Query | SOTW Position | Top Competitor |
|-------|---------------|----------------|
| `site:statisticsoftheworld.com` | #1 (homepage) | — |
| `"statisticsoftheworld.com"` | #1 (brand) | worldometers.info |
| `statistics of the world country data 2026` | **~#4** | worldometers.info (#1) |
| `GDP by country 2026` | **Not ranking** | worldometers.info (#1), Wikipedia (#2) |
| `inflation by country 2026 ranking` | **#6 and #9** (two URLs) | visualcapitalist.com (#1), worldcountrydata.com (#2) |
| `world statistics country comparison tool` | **Not ranking** | worlddata.info (#1), CIA Factbook (#2) |
| `country comparison GDP inflation economic data 2026` | **Not ranking** | globalstats.info (#2), visualcapitalist.com (#1) |

### Key Wins
- **Inflation by country**: Ranking at positions 6 AND 9 for a competitive keyword after just 11 days. Two URLs indexed and ranking = more SERP real estate. This is the fastest path to top 5.

### Key Gaps
- **GDP by country 2026**: Not ranking despite having a dedicated page. Competitors (Worldometer, Wikipedia, StatisticsTimes) are entrenched. Need deeper editorial + differentiation.
- **World comparison tool**: Not visible for tool-type queries. Compare pages exist but aren't surfacing.

---

## 3. Competitor Landscape

### "GDP by country 2026" — Top 5
1. **worldometers.info/gdp/gdp-by-country/** — Real-time data, ~DA90+, dominant
2. **Wikipedia** (List of countries by GDP nominal) — Unbeatable authority
3. **researchfdi.com** — FDI research firm, visual breakdown
4. **statisticstimes.com** — Dedicated GDP ranking pages, strong for this keyword
5. **worldpopulationreview.com** — Strong for country rankings, especially per-capita

### "Inflation by country 2026" — Top 5 (SOTW ranks here!)
1. **visualcapitalist.com** — Infographic/map, massive social shares
2. **worldcountrydata.com** — Rankings-focused, relatively new
3. **tradingeconomics.com** — Real-time data, extremely strong
4. **worldpopulationreview.com** — Good editorial
5. **tradingeconomics.com** (second URL) — Country list view
6. **SOTW /ranking/inflation-rate** — ✅ Ranked!
...
9. **SOTW /inflation-by-country** — ✅ Ranked!

### "Country comparison tool" — Top 5
1. worlddata.info — Simple comparison tables
2. CIA World Factbook — Presorted lists
3. globalEDGE (MSU) — Academic tool
4. indexmundi.com — Side-by-side factbook comparison
5. mappr.co — Interactive with animated charts

**Key insight**: None of the comparison tool competitors offer 440+ indicators or the breadth SOTW has. The gap is brand authority and backlinks, not content quality.

---

## 4. Backlink PR Status

From tracker.json (last_run: 2026-04-10):

| Repo | PR | Status | Action |
|------|----|--------|--------|
| public-apis/public-apis | #5771 | Open (repo dead) | No action — repo hasn't merged since 2021 |
| marcelscruz/public-apis | #833 | Open, conflict fixed | Monitor |
| awesomedata/apd-core | #373 | Open | Monitor |
| awesomedata/awesome-public-datasets | #505 | Open | Monitor |
| public-api-lists/public-api-lists | #395 | CI approved, ready | Best chance of near-term merge |
| awesomedata/apd-core | #377 | Pending review | Monitor |
| brandonhimpfen/awesome-apis | #17 | Pending review | Small repo (580★), low priority |
| n0shake/Public-APIs | #721 | Pending | 23K★ — high value if merged |

**Note**: GitHub weekly PR limit hit — resume new submissions next week. Queued: 5 new repos.
**Live backlinks**: 3 Quora (nofollow) + 1 Dev.to article (dofollow) + 5 GitHub PRs (pending merge)

---

## 5. Opportunities

### Immediate (this session)
1. **Inflation by country page** — Add 2026-specific context (tariff-driven inflation fears, global divergence, Fed stance) + BreadcrumbList JSON-LD → push from P6-9 toward P3-5
2. **GDP by country page** — Add tariff war / 2026 GDP landscape editorial + BreadcrumbList → begin competing for P1 ranking
3. **China economy page** — Liberation Day tariffs are the #1 China economic story of 2026; current editorial barely touches it → major missed opportunity for high-intent searchers
4. **US economy page** — Same: tariff-driven inflation context makes this far more relevant to 2026 searchers

### Medium-term (next 2 weeks)
- **Reddit strategy**: Karma building is ready. Begin posting in r/datasets, r/Economics, r/DataIsBeautiful with value-first content
- **Medium**: Publish 1-2 posts equivalent to Dev.to article (already has dofollow link)
- **Product Hunt launch**: Plan for when more backlinks are in place
- **Wikipedia**: Still too early — wait until domain is 60+ days old

### Content gaps vs competitors
- **No "compare multiple countries" landing page** optimized for "compare countries tool" queries — the /compare/ index exists but may be thin
- **No "richest countries 2026" editorial** — worldpopulationreview ranks well for this; SOTW has /richest-countries/ but may lack editorial depth

---

## 6. Optimizations Made This Session

### `src/app/gdp-by-country/page.tsx`
- Added BreadcrumbList JSON-LD schema (was missing)
- Improved meta description with specific 2026 data points
- Added new editorial paragraphs: 2026 tariff impact on GDP rankings, methodology note on nominal vs PPP, India surpassing Japan
- Added `gdp-ppp-by-country` and `gdp-per-capita-by-country` to related links

### `src/app/china-economy/page.tsx`
- Added BreadcrumbList JSON-LD schema
- Added new editorial paragraph: US-China tariff war (145%+ rates), China's stimulus response, deflation risk, export redirection to ASEAN
- Added FAQ on tariff impact
- Added tariff blog post internal link

### `src/app/us-economy/page.tsx`
- Added BreadcrumbList JSON-LD schema
- Added new editorial paragraph: Liberation Day tariffs (April 2025 one-year mark), tariff-driven inflation, manufacturing re-shoring vs consumer cost impact
- Added internal link to Liberation Day tariff blog post

---

## 7. Key Metrics to Track Next Session

- GSC: Has "inflation by country 2026" moved from P6-9 toward P3-5?
- GSC: Are any new pages (GDP by country, country economy pages) gaining impressions?
- Index count: Has it grown beyond 1,360? Target: 2,500+ within 30 days
- GitHub PR merges: Has #395 (public-api-lists) merged?
- Domain age milestone: Day 30 = April 18. Expect indexing acceleration.
