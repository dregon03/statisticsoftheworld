# GitHub PR — antontarasenko/awesome-economics
**Status**: READY TO SUBMIT (2026-04-14)
**SOTW confirmed absent**: ✅ grep confirms no existing mention
**Branch in upstream**: `default`

---

## Exact change (one-liner patch)

File: `readme.md`, after line containing `OFFSTATS`:

```diff
+* [Statistics of the World](https://statisticsoftheworld.com) - Free API aggregating GDP, inflation, population, and 440+ economic indicators across 218 countries from IMF, World Bank, and WHO data.
```

---

## Submit commands (run in terminal)

```bash
# 1. Fork via GitHub web UI: https://github.com/antontarasenko/awesome-economics/fork
#    → fork to dregon03

# 2. Clone your fork
git clone https://github.com/dregon03/awesome-economics.git /tmp/pr-antontarasenko
cd /tmp/pr-antontarasenko

# 3. Create branch
git checkout -b add-statistics-of-the-world

# 4. Apply the change
sed -i 's|* \[OFFSTATS\](http://www.offstats.auckland.ac.nz/) - Links to official data sources by country and subject.|* [OFFSTATS](http://www.offstats.auckland.ac.nz/) - Links to official data sources by country and subject.\n* [Statistics of the World](https://statisticsoftheworld.com) - Free API aggregating GDP, inflation, population, and 440+ economic indicators across 218 countries from IMF, World Bank, and WHO data.|' readme.md

# 5. Commit & push
git add readme.md
git commit -m "Add Statistics of the World to Data section"
git push -u origin add-statistics-of-the-world

# 6. Open PR at: https://github.com/antontarasenko/awesome-economics/compare/default...dregon03:add-statistics-of-the-world
```

---

## PR title
`Add Statistics of the World API to Data section`

## PR body
```
## What this adds

[Statistics of the World](https://statisticsoftheworld.com) is a free API
that aggregates economic data from the IMF, World Bank, and WHO into a single
normalized endpoint. Covers 440+ indicators across 218 countries including
GDP, inflation, unemployment, population, and life expectancy.

- Free to use: 100 req/day without auth, free API key for 1,000/day
- API docs: https://statisticsoftheworld.com/api-docs
- Compare tool: https://statisticsoftheworld.com/compare

Added to the Datasets subsection, matching existing format exactly.
```
