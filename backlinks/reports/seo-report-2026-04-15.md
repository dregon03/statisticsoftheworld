# SEO Report — 2026-04-15

## Summary

Day 36 of SOTW. Domain authority building steadily. **Key breakthrough**: `/world-population` now appears at ~#3 for "statistics of the world 2026" — first time a broad topical query (non-branded, not a ranking page) has broken into SERPs. Inflation and unemployment pages holding strong. Three hub pages optimized this session: `world-population`, `world-economy`, `largest-economies`.

---

## 1. Site Health

### Indexed Pages
- **Tool estimate**: 1 result returned by site: query (tool limitation — actual GSC count last confirmed ~1,360 as of 2026-04-09)
- **Sitemap**: 5,691 URLs submitted. Day 30 crawl acceleration milestone was April 18 — check GSC for post-April 18 indexing surge.

### Brand Visibility
- `"statisticsoftheworld.com"` → **#1** brand ✅ (homepage, expected)

---

## 2. Keyword Rankings (April 15, 2026)

| Query | SOTW Position | Notes |
|-------|--------------|-------|
| `statistics of the world 2026` | **~#3** (world-population) | **Breakthrough** — was "not visible" April 13 |
| `inflation by country 2026 ranking` | **#7, #8** | Two URLs (/ranking/inflation-rate + /inflation-by-country) — stable |
| `unemployment rate by country 2026 ranking` | **#4, #9** | Two URLs — slight positional shift vs #4/#7 on Apr 13; still top 10 |
| `GDP by country 2026` | Not ranking | Worldometer #1/#2, Wikipedia #3, StatisticsTimes #4, WorldPopReview #5 |
| `GDP growth rate by country 2026 ranking` | Not ranking | Worldometer #1, StatisticsTimes #2, ClearTax #3, WorldPopReview #4 |
| `world statistics country comparison tool 2026` | Not ranking | worlddata.info #1, WorldCountryData #2, UN #3 |
| `country comparison GDP population 2026` | Not ranking | WorldPopReview #1, Worldometer #2, WorldCountryData #3 |
| `world economic data by country 2026 free` | Not ranking | WorldPopReview #1, WorldBank #2, TradingEconomics #3 |

---

## 3. Competitor Landscape

### GDP by Country (dominators)
1. **Worldometer** (worldometers.info) — DA90+, trusted as "IMF source", two URLs in top 2
2. **Wikipedia** (List of countries by GDP) — DA96, canonical reference page
3. **StatisticsTimes.com** — DA45, ranks for all GDP variants
4. **WorldPopulationReview** — DA55, covers every "by country" keyword
5. **VisualCapitalist** — DA70, viral chart-based content dominates for visual queries

### Inflation/Unemployment (competitors)
- TradingEconomics×2, VisualCapitalist, WorldCountryData, WorldPopReview, Statista (paywalled = weak CTR)
- **SOTW advantage**: Both indicators in top 10, TradingEconomics has real-time data edge, Statista is paywalled

### Comparison Tools (competitors)
- worlddata.info, WorldCountryData, UN e-Gov, compareyourcountry.org, TheGlobalEconomy.com, GlobalEdge (MSU)
- **SOTW advantage**: 440+ indicators, comparison URL structure (SEO-friendly slugs), free API
- **Gap**: Compare page is largely client-side rendered — Google can't crawl the content

### World Economy / Global GDP Queries
- TradingEconomics, TheGlobalEconomy.com, VisualCapitalist (multiple articles), WorldEconomics.com, WorldBank
- **SOTW gap**: World-economy page missing BreadcrumbList schema and 2026-specific tariff context

---

## 4. Backlink PR Statuses

From tracker.json + git history:
| PR | Repo | Stars | Status |
|----|------|-------|--------|
| #377 | awesomedata/apd-core | 65K | **MERGED** ✓ — dofollow backlink live |
| #17 | brandonhimpfen/awesome-apis | 580 | **CLOSED** — "self-promotion" + age policy |
| #505 | awesomedata/awesome-public-datasets | 65K | Open — no review yet |
| #373 | awesomedata/apd-core | 65K | Open — likely superseded by #377 |
| #833 | marcelscruz/public-apis | 8.7K | Open — needs README.md fix (not /db folder) |
| #5771 | public-apis/public-apis | 420K | Open — repo dead, won't merge |
| #721 | n0shake/Public-APIs | 23K | Open — no reviews yet |
| #395 | public-api-lists/public-api-lists | 14K | Open — CI passed, awaiting maintainer |

**Drafts pending submission** (from tracker.json metadata):
- antontarasenko/awesome-economics
- niyumard/awesome-economics
- erikgahner/awesome-statistics
- brandonhimpfen/awesome-economics

---

## 5. Opportunities & Recommendations

### Immediate Wins

**A. Cement /world-population at #3 (or push to #1–2)**
- Page already appearing for "statistics of the world 2026" at ~#3 behind Worldometer and StatisticsTimes
- Add BreadcrumbList schema ✅ (done this session)
- Strengthen 2026-specific demographic context (Sub-Saharan Africa, declining countries) ✅ (done)
- Target: top 3 for "world population 2026 by country" and "world population statistics 2026"

**B. /world-economy — missing from all "world economy" queries**
- Worldometers, TheGlobalEconomy.com, and VisualCapitalist dominate "world economy 2026" queries
- Added BreadcrumbList, OpenGraph, 2026 tariff paragraph, and more FAQs ✅ (done this session)
- Should start appearing for "world economy 2026 GDP" within 2–3 weeks

**C. /largest-economies — easy target: "largest economies 2026"**
- No BreadcrumbList, no OG → technical SEO gap fixed ✅ (done this session)
- Added 2026-specific tariff/dollar-strength context to editorial
- Could rank for "biggest economies in the world 2026" (currently WorldPopReview, Statista, VisualCapitalist)

**D. Fix marcelscruz/public-apis #833 README.md issue**
- This PR needs to move SOTW to README.md instead of /db folder
- 8.7K stars — worth getting right
- Action required by Tom

**E. Compare page SEO**
- `/compare` page is client-side rendered → Google sees almost no content
- Need static server-rendered intro + FAQ section above the interactive tool
- High-potential keyword cluster: "compare [country A] vs [country B] economy"
- Already have 95 pre-rendered `/compare/[slug]` pages — these need internal link surfacing

### Medium-Term Priorities
1. **Day 30+ crawl acceleration** (April 18): Check GSC for indexed page count jump. If still ~1,360, investigate crawl budget issues.
2. **Reddit karma building**: Start engaging with r/economics, r/datascience, r/datasets before posting. Target late April for first posts.
3. **Medium.com article**: Draft article on "Free APIs for Macroeconomic Data in 2026" — reuse dev.to content, cross-link to SOTW.
4. **GitHub PRs**: Tom to submit the 4 pending awesome-economics/statistics PRs using draft files in backlinks/drafts/.
5. **wikipedia.org**: Still too risky at 36 days. Revisit at 90 days with backlink growth.

---

## 6. Pages Optimized This Session

### world-population (`/world-population`)
- Added `BreadcrumbList` to JSON-LD schema
- Added 4th FAQ: "Which region is driving world population growth?"
- Added 3rd editorial paragraph on 2026 demographic trends: Sub-Saharan Africa growth trajectory, declining populations (Japan, South Korea, Eastern Europe), migration flows
- Strengthened meta description with richer data points (India #1, Sub-Saharan Africa drivers)

### world-economy (`/world-economy`)
- Added `BreadcrumbList` to JSON-LD schema
- Added `openGraph` fields (title, description, siteName)
- Added 2026 tariff/trade war paragraph to editorial (Liberation Day, US-China 145%, global trade slowdown)
- Added 2 new FAQs: "How fast is world economy growing in 2026?" + "How are US tariffs affecting the global economy?"
- Improved meta description with specific $123T figure

### largest-economies (`/largest-economies`)
- Added `BreadcrumbList` to JSON-LD schema
- Added `openGraph` fields
- Added 2026-specific 4th editorial paragraph (Liberation Day tariff impact on Germany/Japan dollar rankings, India trajectory)
- Added new FAQ: "How are 2026 tariffs affecting the largest economies?"

---

## 7. Progress Metrics

| Metric | Apr 9 | Apr 13 | Apr 15 | Change |
|--------|-------|--------|--------|--------|
| Indexed pages (est.) | ~1,360 | ~1,360 | ~1,360+ | Stable; Day 30 acceleration due Apr 18 |
| Confirmed backlinks | 2 | 2 | 2 | Unchanged |
| Top-10 keyword rankings | 4 | 4 | 5 | +1 (world-population breakthrough) |
| Open GitHub PRs | 7 | 7 | 6 | -1 (awesome-apis closed) |
| Pages with BreadcrumbList | ~12 | ~14 | **17** | +3 this session |
