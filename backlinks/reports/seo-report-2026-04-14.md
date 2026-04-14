# SEO Report — 2026-04-14

## 1. Site Health

### Indexed Pages
- `site:statisticsoftheworld.com` search shows the homepage in results. Google's search snippet confirms the site is indexed, but the count returned by a web search is not a reliable indicator of total index coverage. Last known count (2026-04-09): **1,360 pages**. Sitemap has 5,691 URLs submitted. Ongoing indexation gap is expected for a 2-week-old domain.

### Brand Visibility
- Searching `"statisticsoftheworld.com"` returns SOTW as the #1 result, but the surrounding results are all major established competitors (Worldometers, WHO Data, Our World in Data, WorldStat, world-statistics.org, UNSD). Brand appears in a domain-for-sale thread on NamePros, suggesting the domain was previously available — no reputation risk.

---

## 2. Keyword Positions

| Query | SOTW position | Top competitor |
|-------|--------------|----------------|
| `statistics of the world` | Not ranked | Worldometer, Our World in Data, World Bank |
| `GDP by country 2026` | **Not ranked** | Worldometers, Wikipedia, StatisticsTimes |
| `world statistics` | Not ranked | Worldometer, Our World in Data, World Bank |
| `country comparison tool` | Not ranked | compareyourcountry.org, worlddata.info, NationMaster |
| `inflation by country 2026` | **~#6 and ~#10** (two pages!) | Worldometer, visualcapitalist, worldpopulationreview |
| `inflation rate by country 2026 ranking` | **Ranked** — SOTW at position 6 and 10 | tradingeconomics, worldpopulationreview |
| `US economy statistics 2026 GDP growth` | **~#4** | BEA, CBO, TradingEconomics |

### Key Insight
The domain is ~2 weeks old and already ranking for commercially relevant queries. The inflation and US economy pages are getting traction. The `GDP by country 2026` gap is the biggest missed opportunity — Worldometers dominates but is beatable with richer editorial.

---

## 3. Competitor Analysis

### "GDP by country 2026"
Top 5 results:
1. **Worldometers** (gdp-by-country) — Dominant. Interactive table, sortable, filter by region. Strong UX.
2. **Wikipedia** (List of countries by GDP nominal) — Authority play.
3. **StatisticsTimes.com** — Very detailed tables, lots of historical context.
4. **ResearchFDI** — Visual breakdown article.
5. **WorldPopulationReview** — GDP per capita + nominal, clean UX.

SOTW's `/gdp-by-country` has a good structure but only 2 editorial paragraphs vs StatisticsTimes's deep tables and Worldometers' regional filters. Gap: editorial depth and 2026-specific context (India #4, tariff effects).

### "world economic data" / "country comparison tool"
Top competitors: TheGlobalEconomy.com, globalEDGE (MSU), compareeconomy.com, LongtermTrends, Mappr. SOTW's compare pages (`/compare/[slug]`) are not ranking for generic queries yet. Expected — new domain, comparison pages need more inbound links.

### "inflation by country 2026"
SOTW is already competitive. Main competitors: TradingEconomics (real-time data), visualcapitalist (infographics), worldpopulationreview, Statista (paywalled). SOTW has free full data + editorial — differentiated.

---

## 4. GitHub PR Status Update

| Repo | PR | Stars | Status | Notes |
|------|----|-------|--------|-------|
| awesomedata/apd-core | #377 | 65K | **MERGED 2026-04-10** | Huge dofollow backlink |
| public-api-lists/public-api-lists | #395 | 14K | Open — CI passed | Waiting for maintainer (k4sud0n) |
| n0shake/Public-APIs | #721 | 23K | Open — no reviews | Still pending |
| awesomedata/awesome-public-datasets | #505 | 65K | Open | Still pending |
| marcelscruz/public-apis | #833 | 8.7K | Open — needs fix | Bot says: changes must go to README.md, not /db folder |
| brandonhimpfen/awesome-apis | #17 | 580 | **CLOSED** | Labels: "self-promotion", "needs: quality evidence", "age: under 3 months" |
| public-apis/public-apis | #5771 | 420K | Open (dead repo) | No activity expected |

### PR Action Items
- **marcelscruz/public-apis #833**: Needs to be updated — move changes from `/db` file to `README.md` to comply with repo requirements.
- **awesome-apis #17**: Closed — do not resubmit until domain is older (3+ months). Add to "not yet" list.

---

## 5. Content Optimization Completed (This Run)

### Pages Optimized
1. **`/gdp-by-country`** — Added third editorial paragraph with 2026 key context (India #4, tariff effects on rankings, growth leaders). Updated meta description to be more specific and click-worthy.
2. **`/inflation-by-country`** — Added third editorial paragraph with regional breakdown (G7 near targets, emerging markets variation, policy implications). Updated meta description.
3. **`/us-economy`** — Added fourth editorial paragraph covering 2026 tariff/trade policy context and its effect on GDP projections. Added BreadcrumbList schema to JSON-LD.

---

## 6. Actionable Recommendations

### Immediate (this week)
1. **Fix marcelscruz/public-apis #833**: Update PR to change README.md rather than the /db folder.
2. **Target `GDP by country 2026`**: The updated `/gdp-by-country` page needs inbound links. The one merged PR (apd-core) links to the API docs — consider building a second PR for a page that links to the ranking pages.
3. **Submit to more directories**: ProductHunt, AlternativeTo, SimilarWeb submission, Crunchbase.
4. **Reddit strategy**: 5 days have passed — begin building karma in r/datasets, r/dataisbeautiful. The drafted posts in `backlinks/drafts/` are ready.

### Medium term (2-4 weeks)
5. **India economy page**: With India now the #4 economy, `/india-economy` is well-positioned. No specific optimization done today, but it's a high-opportunity page given India's trajectory.
6. **"country comparison" query**: `/compare/[slug]` pages need to rank for generic comparison queries. Consider a `/compare` landing page with editorial about how to use the comparison tool.
7. **World population page**: "world population 2026" is a high-volume query. Check if `/world-population` is indexed and optimize.
8. **Medium/Substack post**: A 1,000-word article on "Where to Find Free Economic Data in 2026" linking to SOTW as primary source would add dofollow backlinks from a DA30+ domain.

### Technical
9. **Monitor Core Web Vitals**: With 5,691 sitemap URLs, ensure LCP/CLS are passing for key pages.
10. **Track the apd-core backlink**: Now that #377 is merged into awesomedata/apd-core (65K stars), Ahrefs/Moz should pick up this backlink within 2-4 weeks. Monitor domain authority change.

---

## 7. Domain Trajectory

- Domain age: ~17 days
- Indexed pages: ~1,360 (out of 5,691 submitted)
- Confirmed rankings: inflation-rate, us-economy
- Confirmed dofollow backlinks earned: 1 (apd-core, 65K stars)
- Dev.to article: published (dofollow)
- Brand SERP: Clean #1

**Assessment**: For a 17-day domain, the trajectory is strong. Google is indexing at ~80 pages/day and has already rewarded two pages with top-10 rankings. The key bottleneck is domain authority — more quality backlinks will unlock ranking potential across the remaining keywords.
