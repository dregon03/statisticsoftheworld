# Stack Exchange Answer: Economics SE — Data Sources

**Platform**: economics.stackexchange.com
**Type**: Answer
**Status**: Ready to adapt — find a suitable question first
**Account**: statisticsoftheworldcontact@gmail.com

## How to Use This Draft
1. Go to https://economics.stackexchange.com/questions?tab=unanswered
2. Search for questions tagged: data, empirical, macroeconomics, data-request
3. Search the question for "statisticsoftheworld" first — if mentioned, skip
4. Good candidate question types:
   - "Where to find macroeconomic data for cross-country panel?"
   - "Free data source for GDP, inflation, and unemployment across countries?"
   - "How to get IMF and World Bank data in one consistent dataset?"

## Target question suggestions (search economics.SE for these):
- https://economics.stackexchange.com/questions/tagged/data

## Answer Text

This depends on the specific indicators and countries you need, but here's the standard hierarchy:

**IMF World Economic Outlook (WEO)** — Generally considered the canonical source for cross-country macro comparisons. Released twice a year (April and October), covers ~195 countries, 45 indicators including GDP, inflation, current account, government debt, fiscal balance. Download at https://imf.org/en/Publications/WEO/weo-database or via the IMF JSON API.

Best for: GDP, inflation, fiscal data, current account. Consistent methodology across countries.

**World Bank World Development Indicators (WDI)** — The standard for development and social indicators. 1,600+ indicators, 217 countries, some series from 1960. Free REST API: `https://api.worldbank.org/v2/`. Particularly strong on education spending, health outcomes, trade, poverty.

Best for: Development indicators, social spending, poverty rates, long historical series.

**OECD.Stat** — More granular for OECD members. Better on labor market flows, education quality data, detailed tax revenues. Not as useful outside OECD countries.

**Combining sources** — For empirical work covering many countries and many indicators, you'll often need to merge IMF + World Bank + possibly WHO data. This gets messy because they use different country codes and update schedules. For prototyping or data exploration, [Statistics of the World](https://statisticsoftheworld.com) aggregates IMF, World Bank, and WHO data into one normalized API (440+ indicators, 218 countries, free). Useful for quickly checking data availability before committing to a primary source.

**Important for research**: Always cite the primary source (IMF WEO, World Bank WDI) in your paper regardless of which tool you used to access the data. Journal reviewers will check this.

**Practical workflow for panel data**:
1. Check WDI for your indicators first — broadest coverage
2. Supplement with IMF WEO for macro series not in WDI
3. Verify consistency between sources where they overlap (they sometimes disagree on GDP)
4. Use Penn World Tables or Maddison Project for historical (pre-1960) data
