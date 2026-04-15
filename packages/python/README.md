# statisticsoftheworld

Official Python SDK for [Statistics of the World](https://statisticsoftheworld.com) — free API for 490+ global economic indicators across 218 countries with 20+ years of history.

Data sourced from IMF, World Bank, FRED, UN, and more.

## Install

```bash
pip install statisticsoftheworld
```

With pandas support:

```bash
pip install statisticsoftheworld[pandas]
```

## Quick Start

```python
from sotw import SOTW

sotw = SOTW()

# List all countries
countries = sotw.countries()
for c in countries["data"][:5]:
    print(c["id"], c["name"])

# Get all indicators for Canada
canada = sotw.country("CAN")
for ind in canada["indicators"][:5]:
    print(ind["id"], ind["value"])

# GDP rankings — top 10
top10 = sotw.rankings("IMF.NGDPD", limit=10)
for entry in top10["data"]:
    print(f"#{entry['rank']} {entry['country']}: ${entry['value']:,.0f}")

# Historical GDP for Canada
history = sotw.history("IMF.NGDPD", "CAN")
for row in history["data"][-5:]:
    print(row["year"], row["value"])
```

## Pandas Integration

```python
from sotw import SOTW

sotw = SOTW()

# Historical data as DataFrame
df = sotw.history_df("IMF.NGDPD", "CAN")
print(df.tail())
#    year          value
# 20  2020  1.644037e+12
# 21  2021  2.001000e+12
# ...

# Rankings as DataFrame
df = sotw.rankings_df("SP.POP.TOTL", limit=10)
print(df)
#    rank countryId       country        value
# 0     1       CHN         China  1425893000.0
# 1     2       IND         India  1428628000.0
# ...

# All indicators for a country
df = sotw.country_df("USA")
print(df[["id", "value"]].head())
```

## API Key (Optional)

Without a key you get 1,000 requests/day. For higher limits, get a free key at [statisticsoftheworld.com/pricing](https://statisticsoftheworld.com/pricing):

```python
sotw = SOTW(api_key="sotw_your_key_here")
```

## API Reference

### `SOTW(api_key=None, base_url=None)`

Create a new client.

### Methods

| Method | Description |
|--------|-------------|
| `sotw.countries()` | List all 218 countries |
| `sotw.country(id)` | Get a country with all indicator values |
| `sotw.indicators()` | List all 490+ indicators |
| `sotw.indicator(id)` | Get an indicator ranked across all countries |
| `sotw.history(indicator, country)` | Get 20+ years of historical data |
| `sotw.rankings(indicator, limit=None)` | Get countries ranked by indicator |
| `sotw.history_df(indicator, country)` | Historical data as pandas DataFrame |
| `sotw.rankings_df(indicator, limit=None)` | Rankings as pandas DataFrame |
| `sotw.country_df(country_id)` | Country indicators as pandas DataFrame |

### Common Indicator IDs

| ID | Indicator |
|----|-----------|
| `IMF.NGDPD` | GDP (nominal, USD) |
| `SP.POP.TOTL` | Population |
| `IMF.PCPIPCH` | Inflation rate (%) |
| `SL.UEM.TOTL.ZS` | Unemployment rate (%) |
| `SP.DYN.LE00.IN` | Life expectancy |
| `NY.GDP.PCAP.CD` | GDP per capita |

## Links

- [API Documentation](https://statisticsoftheworld.com/api-docs)
- [All Indicators](https://statisticsoftheworld.com/indicators)
- [All Countries](https://statisticsoftheworld.com/countries)
- [Pricing & API Keys](https://statisticsoftheworld.com/pricing)

## License

MIT
