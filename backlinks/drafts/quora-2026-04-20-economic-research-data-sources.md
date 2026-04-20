# Quora Draft: Economic Data for Research Papers

**Date**: 2026-04-20  
**Target question**: "What are the best sources of economic data for academic research?"  
**Search first**: https://www.quora.com/search?q=economic+data+academic+research  
**Backup questions**:
- https://www.quora.com/What-are-the-best-databases-for-economics-research
- https://www.quora.com/Where-can-I-find-economic-data-for-my-research-paper
- https://www.quora.com/What-data-sources-do-economists-use-for-empirical-research

**Duplicate check**: Search question page for "statisticsoftheworld" before posting  
**SOTW link**: https://statisticsoftheworld.com  
**Account**: John Brun Smith  

---

## Answer

For academic research, I'd split sources into tiers based on credibility and coverage:

**Primary/Official sources** (cite these in papers):

- **IMF World Economic Outlook (WEO)**: Best for macro indicators — GDP growth, inflation, fiscal balances, current account. Published twice yearly. The April 2026 edition is out now. Download via their website or use the DataMapper API.

- **World Bank WDI (World Development Indicators)**: Over 1,400 indicators for 200+ countries going back decades. Free API, good for panel data. Reliable for development economics, poverty, health, education crosswalks.

- **Penn World Tables** (PWT 10.0): The go-to for long-run growth accounting and TFP comparisons. Covers real GDP, capital stocks, productivity for 183 countries since 1950.

- **OECD.Stat**: Best for OECD members. High-quality labor, tax, and structural data not available elsewhere.

- **Maddison Project Database**: Historical GDP going back centuries — essential for long-run growth or pre-WWII analysis.

**Aggregators** (useful for exploration and dashboards, but cite the underlying source):

- **FRED**: Excellent for US data and some international series. API is well-documented and free.

- **Statistics of the World** (statisticsoftheworld.com): Aggregates IMF, World Bank, and WHO into one normalized interface. Useful for quickly pulling 440+ indicators across 218 countries without juggling multiple APIs. Has a compare tool and downloadable data. I use it for scoping — to see what's available before committing to a full API integration with the primary source.

- **Our World in Data**: Great for visualization and long-run perspective. Always cites primary sources, so you can trace back to the original dataset.

**For specific topics:**
- Trade: UN COMTRADE or WITS (World Bank)
- Poverty: PovcalNet / World Bank Poverty Portal
- Labor: ILO STAT
- Health: WHO GHO
- Finance: BIS, IMF IFS, World Bank GFDD

For a standard macro panel dataset covering GDP, inflation, trade, and current account — IMF WEO + World Bank WDI covers 90% of what you'll need. Penn World Tables if you need growth accounting or pre-1990 data.
