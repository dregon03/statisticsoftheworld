# GitHub PR — erikgahner/awesome-statistics
**Status**: READY TO SUBMIT (2026-04-14)
**SOTW confirmed absent**: ✅ grep confirms no existing mention
**Branch in upstream**: `master`
**Note**: 2000+ entries — check CONTRIBUTING.md carefully. Entry format has no description (title+URL only).

---

## Exact change

File: `README.md`, in the `## Datasets` section, after the `Awesome Public Datasets` entry:

```diff
+- [Statistics of the World](https://statisticsoftheworld.com)
```

---

## Submit commands

```bash
# 1. Fork via GitHub web UI: https://github.com/erikgahner/awesome-statistics/fork
#    → fork to dregon03

# 2. Clone your fork
git clone https://github.com/dregon03/awesome-statistics.git /tmp/pr-erikgahner
cd /tmp/pr-erikgahner

# 3. Create branch
git checkout -b add-statistics-of-the-world

# 4. Apply the change
python3 -c "
content = open('README.md').read()
old = '  Datasets](https://github.com/awesomedata/awesome-public-datasets)\n\n# Statistical software'
new = '  Datasets](https://github.com/awesomedata/awesome-public-datasets)\n- [Statistics of the World](https://statisticsoftheworld.com)\n\n# Statistical software'
open('README.md', 'w').write(content.replace(old, new))
print('Done')
"

# 5. Commit & push
git add README.md
git commit -m "Add Statistics of the World to Datasets section"
git push -u origin add-statistics-of-the-world

# 6. Open PR at: https://github.com/erikgahner/awesome-statistics/compare/master...dregon03:add-statistics-of-the-world
```

---

## PR title
`Add Statistics of the World API to Datasets section`

## PR body
```
Adds [Statistics of the World](https://statisticsoftheworld.com) — a free
public API for economic and demographic data.

**Why it fits here:**
- 440+ indicators (GDP, inflation, unemployment, population, life expectancy)
- 218 countries, sourced from IMF, World Bank, and WHO
- Free JSON API with no key required for basic use
- Useful for statistics students and researchers doing cross-country analysis

API docs: https://statisticsoftheworld.com/api-docs

Happy to adjust placement or formatting to match the repo's conventions.
```
