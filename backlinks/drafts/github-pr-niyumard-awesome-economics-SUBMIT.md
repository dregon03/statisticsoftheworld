# GitHub PR — niyumard/awesome-economics
**Status**: READY TO SUBMIT (2026-04-14)
**SOTW confirmed absent**: ✅ grep confirms no existing mention
**Branch in upstream**: `master`

---

## Exact change

File: `README.md`, after `Measuring Worth` entry and before `#### International Trade`:

```diff
+* [Statistics of the World](https://statisticsoftheworld.com) - Free API aggregating GDP, population, inflation, and 440+ economic indicators across 218 countries from IMF, World Bank, and WHO sources.
```

---

## Submit commands

```bash
# 1. Fork via GitHub web UI: https://github.com/niyumard/awesome-economics/fork
#    → fork to dregon03

# 2. Clone your fork
git clone https://github.com/dregon03/awesome-economics.git /tmp/pr-niyumard
cd /tmp/pr-niyumard

# 3. Create branch
git checkout -b add-statistics-of-the-world

# 4. Apply the change
python3 -c "
content = open('README.md').read()
old = '* [Measuring Worth](https://www.measuringworth.com/) GDP, CPI, Gold Prices, Wages, Interest Rates, mainly for US and UK but also for Spain and Australia\n#### International Trade'
new = old.replace('#### International Trade', '* [Statistics of the World](https://statisticsoftheworld.com) - Free API aggregating GDP, population, inflation, and 440+ economic indicators across 218 countries from IMF, World Bank, and WHO sources.\n#### International Trade')
open('README.md', 'w').write(content.replace(old, new))
print('Done')
"

# 5. Commit & push
git add README.md
git commit -m "Add Statistics of the World to Global Datasets section"
git push -u origin add-statistics-of-the-world

# 6. Open PR at: https://github.com/niyumard/awesome-economics/compare/master...dregon03:add-statistics-of-the-world
```

---

## PR title
`Add Statistics of the World to Global Datasets section`

## PR body
```
Adds [Statistics of the World](https://statisticsoftheworld.com) to the
Global Datasets section.

It aggregates data from IMF, World Bank, and WHO into a single normalized
JSON API covering 440+ indicators across 218 countries — GDP, inflation,
unemployment, population, life expectancy, and more. Free tier available
with no auth required for basic use.

API docs: https://statisticsoftheworld.com/api-docs
```
