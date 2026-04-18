# SEO Report — 2026-04-18

## 1. Site Health

### Indexed Pages
- `site:statisticsoftheworld.com` — Google snippet shows 4 sample pages (poverty-rate, gdp-growth, unemployment-rate, Sierra Leone country page). The raw site: count in snippets is unreliable; actual index count is still ~1,360 based on prior GSC data. Day 30 milestone (April 18) should trigger crawl acceleration — check GSC dashboard for index count jump.

### Brand Query
- `"statisticsoftheworld.com"` → **#1** (homepage) ✅ Brand position secure.

---

## 2. Keyword Rankings (April 18, 2026)

| Query | SOTW Position | Notes |
|-------|--------------|-------|
| `"statisticsoftheworld.com"` | **#1** | Brand secure ✅ |
| `statistics of the world 2026` | **#6** (/world-population) | Drop from #3–4 ⚠️ |
| `world statistics country data 2026` | **~#4** (homepage) | Stable ✅ |
| `inflation by country 2026 ranking` | **#6 and #8** | Stable ✅ |
| `unemployment rate by country 2026 ranking` | **#5 and #9** | Slight drop from #3/#9 ⚠️ |
| `GDP by country 2026 ranking` | Not ranking | Worldometer #1, StatisticsTimes #2, Wikipedia #3 |
| `largest economies in the world 2026` | Not ranking | Worldometer #3, StatisticsTimes #4, Wikipedia #6 |
| `country comparison tool GDP 2026` | Not ranking | TheGlobalEconomy.com #3, Worldometer #1 |
| `world population by country statistics 2026` | Not ranking | Worldometer dominates #1/#3 |

---

## 3. Competitor Landscape

### GDP Queries (Hardest to Crack)
- **Worldometer**: DA 90+, real-time data, holds #1 for virtually all GDP/population queries.
- **StatisticsTimes**: Clean tables, historical data, consistently #2–4. Similar format to SOTW.
- **Wikipedia**: Evergreen, DA 95+. Near-impossible to displace on branded queries.
- **WorldPopulationReview**: Strong on population/unemployment; good editorial. Beatable with more DA.

### Inflation / Unemployment (Our Strength)
- TradingEconomics owns real-time inflation (holds #1 with live data feed).
- SOTW holds #6/#8 for inflation — Statista (#7, paywalled) and WorldCountryData (#3) are beatable.
- For unemployment, Moody's/economy.com (#4) and Wikipedia (#8) are the near-term targets above SOTW (#5).

### Emerging Opportunities
- `largest economies 2026` — voronoiapp (#4), researchfdi (#6), cleartax (#5) are all beatable with domain authority growth. SOTW has a better page than most of these.
- `India economy 2026 GDP` — heavy search volume driven by India's IMF ranking news cycle. SOTW ranks dynamically for india-economy but needs factual accuracy to compete.

---

## 4. Critical Factual Issue Found — India GDP Ranking

**URGENT**: Multiple pages contain factually wrong claims about India's GDP rank.

Per **IMF April 2026 World Economic Outlook** (confirmed by Upstox, BusinessToday, The Wire, Republic World, all dated April 16–17):

| Rank | Country | Nominal GDP |
|------|---------|-------------|
| 1 | United States | $32.38T |
| 2 | China | $20.85T |
| 3 | Germany | $5.45T |
| 4 | Japan | $4.38T |
| 5 | United Kingdom | $4.26T |
| 6 | **India** | **$4.15T** |

India slipped from earlier projected #4 position due to:
1. Rupee depreciation (84.6 → 88.5 per dollar in 2025)
2. MoSPI base-year revision (Feb 2026, from 2011-12 to 2022-23 base), which lowered nominal GDP estimate ~4%

**Pages with wrong claims** (all corrected in this session):
- `india-economy`: Title "World's 3rd Largest" → WRONG
- `india-economy`: Editorial "India overtook Japan to become world's third-largest" → WRONG
- `largest-economies`: Meta "India now #4 surpassing Japan" → WRONG
- `largest-economies`: Editorial "India now firmly holds the #4 spot" → WRONG

---

## 5. GitHub PRs (External Repos)

No open PRs on dregon03/statisticsoftheworld. External PR statuses (other repos not accessible via this tool):
- awesomedata/apd-core #377 — MERGED (confirmed dofollow backlink, earned 2026-04-10)
- All other external PRs remain open/unknown status (public-apis/public-apis #5771, n0shake/Public-APIs #721, public-api-lists/public-api-lists #395, awesomedata/awesome-public-datasets #505, marcelscruz/public-apis #833)

---

## 6. Pages Optimized This Session

### india-economy (CRITICAL FIX)
- **Title**: "World's 3rd Largest" → removed rank claim entirely
- **Meta description**: Updated to reflect $4.15T GDP, 6.5% growth, no rank claim
- **OpenGraph description**: Updated
- **Editorial paragraph 4**: Complete rewrite — tells the real story: India #6 per IMF April 2026 WEO, explains rupee depreciation + base-year revision as cause, keeps trade deal context, maintains optimistic long-run trajectory framing

### largest-economies (FACTUAL FIX + OPTIMIZATION)
- **Meta description**: Removed "India now #4" — replaced with accurate IMF April 2026 data (Germany #3 $5.4T, India #6 $4.15T)
- **OpenGraph description**: Updated
- **FAQ 1 answer**: Updated to correct order (US, China, Germany, Japan, UK, India) with GDP figures
- **Editorial p1**: "fourth or fifth" → "sixth (by IMF April 2026 nominal data)"
- **Editorial p4**: Rewrote India section — explains rank drop mechanism (rupee + base-year revision)

### world-population (TITLE + CONTENT)
- **Title**: Added full brand name "of the World" (was "| Statistics" — incomplete)
- **New FAQ #5**: Added "Which countries have the fastest-shrinking populations?" covering South Korea, Japan, Ukraine; provides unique content not on competing pages
- **New editorial paragraph 5**: Added section on 2026 pro-natalist policy responses in low-fertility countries (South Korea's $200B+ spend, EU migration debate) — editorial angle no competitor covers in depth

---

## 7. Recommendations for Next Session

1. **GDP by country** — Still not ranking. Focus backlink acquisition on getting 2–3 more dofollow links from economics/data publications. Every new quality backlink raises DA and helps these harder queries.

2. **unemployment-rate ranking** — Dropped from #3 to #5. Check if there were new editorial additions on competing pages (WorldPopReview, economy.com). Consider adding a more current editorial paragraph for April 2026 labor market data.

3. **Medium article** — Draft and publish a Medium article on "India's GDP ranking drop in 2026: what the IMF data really shows." Timely, will get clicks, adds a nofollow backlink to india-economy.

4. **world-population** — Dropped from #3 to #6 for "statistics of the world 2026." Title fix and FAQ addition should help. Monitor over next 2 weeks.

5. **Product Hunt launch** — Still pending. A Product Hunt launch could generate significant social backlinks and referral traffic in one day.
