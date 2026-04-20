# SEO Report — 2026-04-20

## 1. Site Health

### Indexed Pages
- `site:statisticsoftheworld.com` returned 6 sample results (country pages, ranking pages, indicator pages — all correct URLs)
- Estimated indexed pages: ~1,360 (unchanged from April 19 — Day 31 post-milestone, steady state)
- Sitemap: 5,691 URLs submitted

### Brand Query
- `"statisticsoftheworld.com"` → **#1** ✅ (SOTW homepage, Worldometer, WWII Museum, OurWorldInData follow)

---

## 2. Keyword Rankings (April 20, 2026)

| Query | SOTW Position | Notes |
|-------|--------------|-------|
| `statistics of the world 2026` | **#3** (world-population) | Stable — Worldometer #1, StatisticsTimes #2 |
| `inflation by country 2026 ranking` | **#7 and #8** | Stable — VisualCapitalist #1, WorldCountryData #2, WorldPopReview #3 |
| `unemployment rate by country 2026 ranking` | **#3 and #10** | Stable — WorldPopReview #1, WorldEconomics #2 |
| `GDP by country 2026` | **Not ranking** | Worldometer #1, Wikipedia #2, StatisticsTimes #3, WorldPopReview #4 |
| `largest economies world 2026 GDP ranking` | **Not ranking** | StatisticsTimes #1, Worldometer #2, ClearTax #3, VoronoiApp #4 |
| `world statistics country comparison tool 2026` | **Not ranking** | worlddata.info #1, WorldCountryData #2, CompareyourCountry #3 |
| `country comparison GDP per capita 2026` | **Not ranking** | WorldPopReview #1, Worldometer #2, VisualCapitalist #3 |
| `world economic data by country 2026 free` | **Not ranking** | WorldBank #1, WorldPopReview #2, IMF #3, TradingEconomics #6 |

**Summary**: Rankings are holding or stable vs. yesterday. No regression. The 3 confirmed rankings (brand #1, inflation #7/#8, unemployment #3/#10) are intact. GDP and comparison tool queries remain the main gap — domain authority is still the primary bottleneck for those high-competition queries.

---

## 3. Competitor Landscape

### GDP by Country 2026
1. **Worldometer** (DA ~90) — Real-time data, huge domain authority
2. **Wikipedia** — Institutional trust, not beatable short-term
3. **StatisticsTimes** — Focused data site, strong for GDP queries
4. **WorldPopReview** — Lightweight, good content depth for GDP per capita
5. **ResearchFDI** — New entrant with visual GDP breakdown; well-structured

**Actionable**: ClearTax.in (#3 for "largest economies world GDP") is a tax blog, not a specialist economics site — beatable with more backlinks and stronger on-page signals.

### Inflation by Country 2026
1. VisualCapitalist — High visual quality, well-shared
2. WorldCountryData — Data-focused, decent DA
3. WorldPopReview — Strong SEO fundamentals
4. TradingEconomics × 2 — Real-time data advantage
5-6. Statista (paywalled)
7–8. **SOTW** ✅

**Opportunity**: Positions 7–8 suggest we're on the cusp of page 1 for inflation. A few more quality backlinks could push us to top 5.

### Unemployment by Country 2026
1. WorldPopReview — Comprehensive, free data
2. WorldEconomics (Moody's Analytics) — Institutional authority
3. **SOTW** ✅ — Our strongest competitive position

### Comparison Tool
1. worlddata.info — Established comparison tool
2. WorldCountryData — 12 indicators, 195 countries
3. CompareyourCountry (OECD) — Institutional authority
4. UN Public Administration — Government site
5. World Bank — Institutional

**Gap**: SOTW's `/compare` tool (440+ indicators, 218 countries) is technically superior but needs: (a) better landing page content and (b) more backlinks pointing to `/compare`.

---

## 4. Backlink PR Status

From `backlinks/tracker.json` (last_run: 2026-04-20):
- **Total backlinks**: 8 (3 Quora + 5 GitHub PRs)
- **Confirmed dofollow**: 2 (awesomedata/apd-core #377 merged, dev.to article)
- **Pending PRs**: public-apis/public-apis, marcelscruz/public-apis, n0shake/Public-APIs, public-api-lists/public-api-lists, awesomedata/awesome-public-datasets
- **New drafts from Apr 20 session**: infoculture/awesome-datajournalism PR draft, 2 Quora drafts, 2 Reddit drafts (r/webdev, r/javascript), 1 dev.to comment draft

**Note**: GitHub PRs not yet submitted — Tom (dregon03) must submit them. Priority: (1) public-apis/public-apis [300K stars], (2) ripienaar/free-for-dev [90K stars], (3) academic/awesome-datascience [28.8K stars].

---

## 5. Opportunities & Recommendations

### High Priority
1. **Submit pending GitHub PRs** — 55+ drafts exist. Each merged PR is a dofollow backlink from high-DA repos. Getting even 5-10 merged would meaningfully improve domain authority.
2. **Inflation ranking push** — SOTW is at #7/#8. A few backlinks specifically to `/inflation-by-country` could push to top 5. Target: economics professors, data journalists, statistics courses.
3. **Compare page content** — `/compare` has 440+ indicators but the landing page needs stronger editorial explaining WHY it's the best tool for country comparison. Add a "What can you compare?" section with 10-15 specific use cases.

### Medium Priority
4. **GDP queries** — Not ranking despite solid on-page. Domain authority bottleneck. Adding the compare and GDP pages to any new backlink submissions would help. Focus outreach on data science / economics communities.
5. **Blog content** — No new blog posts since April 10. A timely post on "China Economy 2026: How Tariffs Reshaped the World's Second-Largest Economy" could capture topical traffic.
6. **Reddit strategy** — Reddit karma should now be sufficient (posts from April 9). Time to post in r/datasets, r/economics, r/dataisbeautiful with genuine contributions.

### Schema / Technical
7. **US economy duplicate BreadcrumbList** — JSON-LD `@graph` has BreadcrumbList appearing twice; fix removes schema validation warning.
8. **Economy pages missing OG url/type** — china-economy, us-economy missing `url` and `type` in OpenGraph; minor but affects rich snippet eligibility.

---

## 6. Pages Optimized This Session

1. **`/us-economy`** — Fixed description ($29T→$32T factual accuracy); added OG url/type; removed duplicate BreadcrumbList from JSON-LD; replaced repetitive tariff paragraph (P5) with unique content on US AI/tech economic leadership and structural challenges
2. **`/china-economy`** — Added OG url/type; updated meta description with specific GDP figure ($20.9T, 4.2%); added 5th FAQ on China's AI/tech sector in 2026; added 5th editorial paragraph on DeepSeek, EV leadership, and tech-driven economic pivot
3. **`/gdp-by-country`** — Added WebPage type to JSON-LD `@graph`; sharpened editorial intro paragraph to more directly answer "which countries have the highest GDP in 2026"

---

## 7. Key Metrics to Watch

| Metric | Current | Target |
|--------|---------|--------|
| Indexed pages | ~1,360 | 2,000+ (by Day 60) |
| Domain Rating | ~12 (est.) | 20+ (3 months) |
| Inflation ranking | #7/#8 | Top 5 |
| Unemployment ranking | #3 | Hold #3 |
| GDP by country ranking | Not ranking | Top 10 |
| Dofollow backlinks | 2 | 20+ |

---

*Report generated: 2026-04-20 | Next run: 2026-04-21*
