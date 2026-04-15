# statisticsoftheworld

Official JavaScript/TypeScript SDK for [Statistics of the World](https://statisticsoftheworld.com) — free API for 490+ global economic indicators across 218 countries with 20+ years of history.

Data sourced from IMF, World Bank, FRED, UN, and more.

## Install

```bash
npm install statisticsoftheworld
```

## Quick Start

```typescript
import { createClient } from 'statisticsoftheworld';

const sotw = createClient();

// List all countries
const { data: countries } = await sotw.countries();
console.log(countries[0]); // { id: "USA", name: "United States", ... }

// Get all indicators for a country
const { indicators } = await sotw.country('CAN');
console.log(indicators); // [{ id: "IMF.NGDPD", value: 2420000000000, ... }, ...]

// GDP rankings — top 10
const { data: top10 } = await sotw.rankings('IMF.NGDPD', { limit: 10 });
console.log(top10); // [{ rank: 1, country: "United States", value: ... }, ...]

// Historical GDP for Canada (20+ years)
const { data: history } = await sotw.history('IMF.NGDPD', 'CAN');
console.log(history); // [{ year: 2000, value: 744631000000 }, ...]
```

## API Key (Optional)

Without a key you get 1,000 requests/day. For higher limits, get a free key at [statisticsoftheworld.com/pricing](https://statisticsoftheworld.com/pricing):

```typescript
const sotw = createClient({ apiKey: 'sotw_your_key_here' });
```

## API Reference

### `createClient(options?)`

Create a new client instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | API key for higher rate limits |
| `baseUrl` | `string` | `https://statisticsoftheworld.com` | Base URL override |

### Methods

| Method | Description |
|--------|-------------|
| `sotw.countries()` | List all 218 countries |
| `sotw.country(id)` | Get a country with all indicator values (e.g., `'USA'`, `'CAN'`) |
| `sotw.indicators()` | List all 490+ indicators |
| `sotw.indicator(id)` | Get an indicator ranked across all countries |
| `sotw.history(indicator, country)` | Get 20+ years of historical data |
| `sotw.rankings(indicator, { limit? })` | Get countries ranked by an indicator |

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
