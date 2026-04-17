# SUBMIT: public-apis/public-apis PR

**Status**: Ready to submit  
**Verified SOTW-free**: Yes (confirmed 2026-04-17 — no entry in Finance section between SmartAPI and StockData)  
**Priority**: CRITICAL — ~300K stars, most-linked API directory on GitHub, dofollow

---

## Step-by-step instructions for Tom

1. Go to https://github.com/public-apis/public-apis
2. Fork the repo (top-right "Fork" button)
3. In your fork, edit `README.md`
4. Find the `### Finance` section
5. Use Ctrl+F to find `SmartAPI` — the new entry goes on the **next line** after the SmartAPI row

---

## Exact line to insert

```
| [Statistics of the World](https://statisticsoftheworld.com/api-docs) | Free API for GDP, inflation, population & 440+ economic indicators across 218 countries | `apiKey` | Yes | Yes |
```

---

## Context (surrounding rows for reference)

```
| [SmartAPI](https://smartapi.angelbroking.com/) | Gain access to set of <SmartAPI> and create end-to-end broking services | `apiKey` | Yes | Unknown |
| [Statistics of the World](https://statisticsoftheworld.com/api-docs) | Free API for GDP, inflation, population & 440+ economic indicators across 218 countries | `apiKey` | Yes | Yes |
| [StockData](https://www.StockData.org) | Real-Time, Intraday & Historical Market Data, News and Sentiment API | `apiKey` | Yes | Yes |
```

**Alphabetical check**: SmartAPI (Sm) → Statistics (St-a) → StockData (St-o) ✓

---

## PR Checklist (from their PULL_REQUEST_TEMPLATE.md)

Fill these checkboxes in the PR body:
- [x] I have followed the contributing guidelines
- [x] My entry is in alphabetical order within its category
- [x] My description is meaningful and not just the project name
- [x] My description is under 100 characters (current: 87 characters)
- [x] My description does not end with punctuation
- [x] I have added one space padding on each column side
- [x] I have searched the repository for duplicate issues or PRs
- [x] This is not a new category (Finance already exists)
- [x] I have squashed my commits

---

## PR Details

**Title**: `Add Statistics of the World to Finance`

**Branch**: Create from `master` — name it `add-statistics-of-the-world`

**Commit message**: `Add Statistics of the World to Finance section`

**PR description**:
> Adding Statistics of the World (statisticsoftheworld.com/api-docs) to the Finance section.
>
> It provides a free REST API for 440+ macroeconomic indicators (GDP, inflation, population, life expectancy, etc.) across 218 countries. Data normalized from IMF, World Bank, and WHO. Free tier: 100 req/day without auth; free API key unlocks 1,000/day. Relevant for developers building dashboards, visualizations, or data pipelines over country-level economic data.

---

## Post-submit
Once PR is submitted, update tracker.json:
- Change status from `pending_submit` to `pending_review`
- Add the actual PR URL
- This is the most important GitHub PR — follow up if no response in 2 weeks
