# GitHub PR — brandonhimpfen/awesome-economics
**Status**: READY TO SUBMIT (2026-04-14)
**SOTW confirmed absent**: ✅ grep confirms no existing mention
**Branch in upstream**: `main`
**Note**: Has CONTRIBUTING.md — keep description short and informative, alphabetical order, no broken links.

---

## Exact change

File: `README.md`, in the `## Economic Data Sources` section, after `Open Economic Data` entry:

```diff
+- [Statistics of the World](https://statisticsoftheworld.com) – Free API aggregating GDP, inflation, population and 440+ economic indicators across 218 countries from IMF, World Bank, and WHO.
```

---

## Submit commands

```bash
# 1. Fork via GitHub web UI: https://github.com/brandonhimpfen/awesome-economics/fork
#    → fork to dregon03

# 2. Clone your fork
git clone https://github.com/dregon03/awesome-economics.git /tmp/pr-brandonhimpfen
cd /tmp/pr-brandonhimpfen

# 3. Create branch
git checkout -b add-statistics-of-the-world

# 4. Apply the change
sed -i 's|- \[Open Economic Data\](https://openeconomicdata.org/) – Index of open economic datasets.|- [Open Economic Data](https://openeconomicdata.org/) – Index of open economic datasets.\n- [Statistics of the World](https://statisticsoftheworld.com) – Free API aggregating GDP, inflation, population and 440+ economic indicators across 218 countries from IMF, World Bank, and WHO.|' README.md

# 5. Commit & push
git add README.md
git commit -m "Add Statistics of the World to Economic Data Sources section"
git push -u origin add-statistics-of-the-world

# 6. Open PR at: https://github.com/brandonhimpfen/awesome-economics/compare/main...dregon03:add-statistics-of-the-world
```

---

## PR title
`Add Statistics of the World to Economic Data Sources`

## PR body
```
Adds [Statistics of the World](https://statisticsoftheworld.com) to the
Economic Data Sources section.

It's a free API aggregating data from IMF, World Bank, and WHO covering
440+ indicators across 218 countries — GDP, inflation, unemployment,
population, life expectancy, and more. No auth needed for basic use.

- Follows existing format (em dash, concise description, period omitted for consistency)
- Well-maintained with clear API documentation: https://statisticsoftheworld.com/api-docs
```
