# SEO & Backlink Log — Statistics of the World

Single source of truth for all SEO work. Check this before doing anything to avoid duplicates.

## Current Status (2026-04-11)

- **Google indexed pages**: ~1,360 (GSC not accessible this session; Day 30 milestone April 18 — expect acceleration)
- **GSC impressions (3mo)**: Not checked this session
- **Avg position**: 11.9 (last check)
- **Inflation by country**: Ranking at positions **#8 and #9** (slight slip from #6/#9 — likely fluctuation)
- **GDP by country**: Still not in top 10 — domain authority is the bottleneck
- **Domain age**: ~12 days

### Keyword Rankings (2026-04-11 web search)
- `"statisticsoftheworld.com"` → **#1** (brand) ✅
- `statistics of the world country data 2026` → **Not visible** (dropped from ~#4 — domain trust fluctuation)
- `inflation by country 2026 ranking` → **#8 and #9** (two URLs ranking) ✅
- `GDP by country 2026` → Not ranking (dominated by Worldometer, Wikipedia, StatisticsTimes)
- `richest countries world 2026 GDP per capita` → Not ranking (CEOWorld #1, UnionCitizenship #2)
- `world statistics country comparison tool` → Not ranking

### Pages Optimized (2026-04-11)
- **inflation-by-country**: BreadcrumbList schema added; new editorial paragraph on 2026 tariff-driven inflation dynamics (US pass-through, China deflation, India trade deal, Turkey/Argentina structural pressures); new FAQ on tariff-inflation link
- **richest-countries**: BreadcrumbList schema added; new editorial paragraph on dollar-strength effect on European GDP per capita rankings, Guyana trajectory; updated FAQ with 2026-accurate data (Monaco/Liechtenstein top, US ~$85K-$93K); new FAQ on fastest-rising GDP per capita
- **india-economy**: BreadcrumbList schema added; meta description updated (7.4% growth, #3 economy); new editorial paragraph on India overtaking Japan (#3 milestone), US-India Feb 2026 trade deal (25%→18% tariffs), Goldman Sachs upgrade; new FAQ on trade deal impact

---

## Current Status (2026-04-10)

- **Google indexed pages**: ~1,360 (GSC check needed; sitemap at 5,691 URLs)
- **GSC impressions (3mo)**: 33,200 (as of 2026-04-09)
- **GSC clicks (3mo)**: 11
- **Avg position**: 11.9
- **Homepage**: Indexed (canonical fix applied 2026-04-08)
- **Sitemap**: 5,691 URLs submitted via /sitemap/0.xml
- **Domain age**: ~11 days

### Keyword Rankings (2026-04-10 web search)
- `statistics of the world country data 2026` → **~#4** ✅
- `inflation by country 2026 ranking` → **#6 and #9** (two URLs ranking!) ✅
- `GDP by country 2026` → Not ranking (dominated by Worldometer, Wikipedia)
- `world statistics country comparison tool` → Not ranking

### Competitor Notes
- Worldometer dominates GDP queries (DA90+)
- Trading Economics owns real-time data space
- Our World in Data has long-form narrative advantage
- SOTW advantage: breadth (440+ indicators), comparison tool, free API

## Current Status (2026-04-09)

---

## On-Site SEO Completed

### Homepage (src/app/page.tsx)
- [x] Title optimized: "Statistics of the World — Global Statistics, World Data & Country Indicators (2026)"
- [x] Meta description optimized for target keywords
- [x] Canonical URL fixed (trailing slash added)
- [x] JSON-LD: WebPage, Dataset, FAQPage, BreadcrumbList schemas
- [x] dateModified added to WebPage schema
- [x] "Last updated" visible date added
- [x] SEO content section with editorial (The Global Economy in 2026, Key Economic Trends)
- [x] Internal links to all major sections (rankings, economies, comparisons)
- [x] Data sources section with external links

### Layout (src/app/layout.tsx)
- [x] WebSite schema with SearchAction
- [x] Organization schema with social profiles
- [x] SiteNavigationElement schema
- [x] Google Analytics (G-HT0C0WQXM5)
- [x] Google site verification
- [x] RSS feed link
- [x] OpenSearch support

### Country Pages (src/app/country/[id]/page.tsx)
- [x] Dynamic title with GDP + Population data
- [x] Canonical URLs with clean slugs (ISO3 → slug redirects)
- [x] Country schema with JSON-LD
- [x] BreadcrumbList schema
- [x] dateModified added
- [x] Server-rendered economic summary paragraph
- [x] AI-generated country narratives
- [x] Internal links: rankings, comparisons, similar economies, landing pages

### Ranking Pages (src/app/ranking/[slug]/page.tsx)
- [x] Expert editorial for 20+ top indicators (GDP, population, inflation, etc.)
- [x] ItemList + FAQPage + BreadcrumbList + Dataset schemas
- [x] dateModified added to Dataset schema
- [x] "Updated {month} {year}" visible
- [x] CSV/JSON export functionality
- [x] Dynamic FAQ generation per indicator

### Comparison Pages (src/app/compare/[slug]/page.tsx)
- [x] 167 expert editorial entries (covering all 95 sitemap pairs)
- [x] Dynamic metadata with country data

### Blog (src/lib/blog-posts.ts)
- [x] 247 programmatic blog posts
- [x] Thin posts marked noindex
- [x] Editorial: "How to Get Economic Data via API" (src/app/blog/how-to-get-economic-data-api/)
- [x] Editorial: "Global Defense Spending Hits Record $2.7 Trillion" (src/app/blog/global-defense-spending-2026-record/) — targeting "global defense spending 2026", "military spending by country 2026" (added 2026-04-10)
- [x] Editorial: "One Year After Liberation Day: What Trump's Tariffs Did" (src/app/blog/liberation-day-tariffs-one-year-later/) — targeting "Liberation Day tariffs", "Trump tariffs 2026 impact" (added 2026-04-10)

### Economy Landing Pages
- [x] 50+ country economy pages (us-economy, china-economy, etc.)
- [x] Group pages (g7, g20, brics, eu, asean)
- [x] Metric pages (gdp-by-country, inflation-by-country, etc.)
- [x] us-economy: BreadcrumbList schema added; new editorial paragraph on Liberation Day tariffs + trade war impact (2026-04-10)
- [x] china-economy: BreadcrumbList schema added; new editorial paragraph on US-China tariff war (145%+ rates, stimulus response, export redirection, deflation risk); new FAQ on tariff impact (2026-04-10)
- [x] gdp-by-country: BreadcrumbList schema added; improved meta description with specific figures; 2 new editorial paragraphs (India overtaking Japan, tariff impact on dollar-denominated rankings, IMF data sourcing note); new tariff FAQ; improved related links (2026-04-10)
- [x] inflation-by-country: BreadcrumbList schema added; new editorial section "2026 Inflation Drivers"; US tariff pass-through, China deflation, India trade deal context; new tariff FAQ (2026-04-11)
- [x] richest-countries: BreadcrumbList schema added; new editorial paragraph on dollar-strength distortions + Guyana trajectory; updated FAQs with accurate 2026 top-tier data; new "fastest-rising" FAQ (2026-04-11)
- [x] india-economy: BreadcrumbList schema added; meta description updated (7.4%, #3 economy); new editorial paragraph on Japan overtake + US-India trade deal (25%→18%); new FAQ on trade deal impact (2026-04-11)

### Glossary
- [x] 148 glossary terms

### Technical SEO
- [x] robots.txt: blocks /api/, /dashboard/, /indicator/, /chart/, /scatter/, /heatmap/
- [x] AI crawlers explicitly allowed (GPTBot, ClaudeBot, PerplexityBot)
- [x] Custom 404 page with navigation
- [x] Sitemap: 5,691 URLs across rankings, countries, comparisons, blogs, glossary
- [x] RSS feed at /feed (31 pages discovered by Google)
- [x] next.config.ts: typescript + eslint checks skipped for faster builds
- [x] llms.txt route for AI crawlers

### Google Search Console
- [x] Domain property verified (sc-domain:statisticsoftheworld.com)
- [x] Sitemap.xml submitted (sitemap index)
- [x] /sitemap/0.xml submitted directly (2026-04-08)
- [x] RSS feed /feed submitted
- [x] GSC linked to Google Analytics
- [x] URL-prefix property removed (was duplicate)

---

## Backlink Efforts — Complete History

### Quora (Account: John Brun Smith)
| Date | Question | Status |
|------|----------|--------|
| ~2026-04-03 | What is the best free API for economic data? | Posted |
| ~2026-04-03 | Where can I find data on various country breakdowns of GDP? | Posted |
| ~2026-04-03 | What are some good sites to find world statistics? | Posted |
| ~2026-04-03 | Which websites should I use to take economic statistics? | Posted |
| ~2026-04-03 | What are some websites like Statista? | Posted |
| ~2026-04-03 | What are the best websites for statistical data? | Posted |
| 2026-04-09 | What are the best web APIs for macroeconomic data? | Posted |
| 2026-04-09 | What is the best platform/website to see live economic data about countries? | Posted (first answer, 8 followers) |
| 2026-04-09 | What are some of the best online sources for raw economic data? | Posted (40 followers) |

### Stack Exchange (Account: statisticsoftheworldcontact@gmail.com)
| Date | Site | Question | Status |
|------|------|----------|--------|
| ~2026-04-07 | Open Data SE | (3 answers posted) | Posted |

### GitHub PRs (Account: dregon03)
| Date | Repo | PR # | Stars | Status |
|------|------|------|-------|--------|
| ~2026-04-05 | public-apis/public-apis | #5771 | 420K | Open (repo dead, won't merge) |
| ~2026-04-07 | marcelscruz/public-apis | #833 | 8.7K | Open (conflict fixed 2026-04-09) |
| ~2026-04-07 | awesomedata/apd-core | #373 | 65K | Open |
| ~2026-04-07 | awesomedata/awesome-public-datasets | #505 | 65K | Open |
| 2026-04-09 | public-api-lists/public-api-lists | #395 | 14K | CI approved, ready for merge |
| 2026-04-09 | awesomedata/apd-core | #377 | 65K | Pending review |
| 2026-04-09 | brandonhimpfen/awesome-apis | #17 | 580 | Pending review |
| 2026-04-09 | n0shake/Public-APIs | #721 | 23K | Pending review |

### Hacker News
| Date | Type | Status |
|------|------|--------|
| ~2026-04-07 | Multiple Show HN posts | Already submitted (Tom said "plenty") |

### Reddit
- **Zero posts/comments as of 2026-04-09** — holding off due to strict self-promo rules
- Strategy: Build karma first, then post in 1-2 weeks

### Dev.to (Account: sotwdata)
| Date | Article | Status |
|------|---------|--------|
| 2026-04-09 | [5 Free APIs for Global Economic Data in 2026](https://dev.to/sotwdata/5-free-apis-for-global-economic-data-in-2026-no-api-key-needed-1ocf) | Published (dofollow link) |

### Medium
- Not started yet

### Product Hunt
- Not launched yet

### Wikipedia
- Not attempted (too risky for new domain)

### Directories
- Not submitted yet

### Forums (Indie Hackers, Lobste.rs, etc.)
- Not started yet

---

## Platforms NOT to Use / Exhausted
- **public-apis/public-apis** (420K stars) — repo dead, last merge 2021, PRs #5763, #5771, #5782 all submitted, #5763 and #5782 closed
- **ripienaar/free-for-dev** — maintainer bulk-closes all PRs, not accepting submissions
- **jdorfman/awesome-json-datasets** — archived
- **TonnyL/Awesome_APIs** — archived since 2020
- **Kikobeats/awesome-api** — about API design patterns, not an API directory
- **bytewax/awesome-public-real-time-datasets** — real-time streaming data only, SOTW doesn't fit
- **dariubs/awesome-statistics** — about statistics software/theory, not data APIs

---

## Automated Systems

### Backlink Agent (Scheduled)
- **Trigger**: trig_017rGhrSVsEK8UbtCcctx7Xa
- **Schedule**: Daily 10am UTC (6am ET)
- **What it does**: Researches opportunities, submits GitHub PRs, drafts content
- **Manage**: https://claude.ai/code/scheduled/trig_017rGhrSVsEK8UbtCcctx7Xa

### Backlink Tracker
- **File**: backlinks/tracker.json
- **Templates**: backlinks/content-templates.json
- **Playbook**: backlinks/BACKLINK-AGENT.md
- **Drafts**: backlinks/drafts/

---

## Ready-to-Post Drafts (in backlinks/drafts/)
- reddit-datasets-2026-04-09.md — r/datasets post
- reddit-sideproject-2026-04-09.md — r/SideProject post
- reddit-economics-2026-04-09.md — r/economics comment
- hackernews-show-2026-04-09.md — Show HN (skip if already posted on HN)

---

## Key Decisions
- **Reddit**: Holding off on direct posts. Too strict on self-promo. Build karma first.
- **Wikipedia**: Too risky — domain too new, editors will revert.
- **Quora**: Max 3 answers/day to avoid rate limits.
- **GitHub PRs**: Highest value (dofollow). Prioritize active repos only.
