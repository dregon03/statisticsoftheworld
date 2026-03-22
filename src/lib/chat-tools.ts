import {
  getCountry,
  getCountries,
  getAllIndicatorsForCountry,
  getIndicatorForAllCountries,
  getHistoricalData,
  getHistoricalDataMultiCountry,
  INDICATORS,
  formatValue,
} from './data';

// Tool definitions for Mistral function calling
export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_country_data',
      description: 'Get all latest indicator values for a country. Use this when the user asks about a specific country\'s statistics.',
      parameters: {
        type: 'object',
        properties: {
          country_id: {
            type: 'string',
            description: 'ISO 3166-1 alpha-3 country code (e.g., USA, CAN, GBR, CHN, JPN, DEU, FRA, IND, BRA, AUS)',
          },
          indicators: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of specific indicator IDs to return. If omitted, returns key stats (GDP, population, life expectancy, inflation, unemployment).',
          },
        },
        required: ['country_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_indicator_ranking',
      description: 'Rank countries by a specific indicator. Use for questions like "top countries by GDP", "which countries have highest inflation", "lowest unemployment".',
      parameters: {
        type: 'object',
        properties: {
          indicator_id: {
            type: 'string',
            description: 'Indicator ID (e.g., IMF.NGDPD for GDP, SP.POP.TOTL for population, IMF.PCPIPCH for inflation, SP.DYN.LE00.IN for life expectancy)',
          },
          limit: {
            type: 'number',
            description: 'Number of countries to return (default 10)',
          },
          order: {
            type: 'string',
            enum: ['desc', 'asc'],
            description: 'Sort order. "desc" for highest first (default), "asc" for lowest first.',
          },
        },
        required: ['indicator_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_historical_data',
      description: 'Get historical time series data for a country and indicator. Use for trend questions, comparisons over time, charts.',
      parameters: {
        type: 'object',
        properties: {
          indicator_id: { type: 'string', description: 'Indicator ID' },
          country_id: { type: 'string', description: 'ISO 3166-1 alpha-3 country code' },
        },
        required: ['indicator_id', 'country_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'compare_countries',
      description: 'Compare multiple countries on specific indicators. Use for side-by-side comparisons.',
      parameters: {
        type: 'object',
        properties: {
          country_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of ISO 3166-1 alpha-3 country codes (max 10)',
          },
          indicator_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of indicator IDs to compare',
          },
        },
        required: ['country_ids', 'indicator_ids'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_indicators',
      description: 'Search for indicators by keyword. Use when the user asks about a topic and you need to find the right indicator ID.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g., "gdp", "population", "inflation", "co2", "education")',
          },
        },
        required: ['query'],
      },
    },
  },
];

// Key indicators mapping for common queries
const KEY_INDICATORS = [
  'IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'SP.POP.TOTL',
  'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP',
];

// Execute a tool call and return formatted result
export async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case 'get_country_data': {
      const country = await getCountry(args.country_id);
      if (!country) return `Country "${args.country_id}" not found. Use ISO 3166-1 alpha-3 codes.`;

      const allInds = await getAllIndicatorsForCountry(args.country_id);
      const targetIds = args.indicators || KEY_INDICATORS;

      const rows: string[] = [`**${country.name}** (${country.region}, ${country.incomeLevel})`];
      if (country.capitalCity) rows.push(`Capital: ${country.capitalCity}`);
      rows.push('');

      for (const indId of targetIds) {
        const ind = INDICATORS.find(i => i.id === indId);
        const d = allInds[indId];
        if (ind && d) {
          rows.push(`- ${ind.label}: ${formatValue(d.value, ind.format, ind.decimals)} (${d.year})`);
        }
      }
      return rows.join('\n');
    }

    case 'get_indicator_ranking': {
      const ind = INDICATORS.find(i => i.id === args.indicator_id);
      if (!ind) return `Indicator "${args.indicator_id}" not found.`;

      let data = await getIndicatorForAllCountries(args.indicator_id);
      if (args.order === 'asc') data = [...data].reverse();
      const limit = args.limit || 10;
      const sliced = data.slice(0, limit);

      const rows = [`**${ind.label}** — ${args.order === 'asc' ? 'Bottom' : 'Top'} ${limit}`, ''];
      rows.push('| Rank | Country | Value | Year |');
      rows.push('|------|---------|-------|------|');
      sliced.forEach((d, i) => {
        rows.push(`| ${i + 1} | ${d.country} | ${formatValue(d.value, ind.format, ind.decimals)} | ${d.year} |`);
      });
      return rows.join('\n');
    }

    case 'get_historical_data': {
      const ind = INDICATORS.find(i => i.id === args.indicator_id);
      if (!ind) return `Indicator "${args.indicator_id}" not found.`;

      const country = await getCountry(args.country_id);
      const history = await getHistoricalData(args.indicator_id, args.country_id);
      const valid = history.filter(d => d.value !== null);

      if (valid.length === 0) return `No historical data found for ${args.indicator_id} in ${args.country_id}.`;

      const rows = [`**${country?.name || args.country_id}** — ${ind.label}`, ''];
      rows.push('| Year | Value |');
      rows.push('|------|-------|');
      // Show last 15 years
      valid.slice(-15).forEach(d => {
        rows.push(`| ${d.year} | ${formatValue(d.value, ind.format, ind.decimals)} |`);
      });
      if (valid.length > 15) rows.push(`\n*${valid.length} total data points available*`);
      return rows.join('\n');
    }

    case 'compare_countries': {
      const countryIds: string[] = (args.country_ids || []).slice(0, 10);
      const indicatorIds: string[] = (args.indicator_ids || KEY_INDICATORS).slice(0, 15);

      const countriesData = await Promise.all(
        countryIds.map(async cid => ({
          id: cid,
          country: await getCountry(cid),
          indicators: await getAllIndicatorsForCountry(cid),
        }))
      );

      // Build comparison table
      const header = ['Indicator', ...countriesData.map(c => c.country?.name || c.id)];
      const rows = [header.join(' | '), header.map(() => '---').join(' | ')];

      for (const indId of indicatorIds) {
        const ind = INDICATORS.find(i => i.id === indId);
        if (!ind) continue;
        const values = countriesData.map(c => {
          const d = c.indicators[indId];
          return d ? formatValue(d.value, ind.format, ind.decimals) : 'N/A';
        });
        rows.push(`${ind.label} | ${values.join(' | ')}`);
      }

      return `| ${rows.join('\n| ')} |`;
    }

    case 'search_indicators': {
      const q = (args.query || '').toLowerCase();
      const matches = INDICATORS
        .filter(i =>
          i.label.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
        )
        .slice(0, 10);

      if (matches.length === 0) return `No indicators found matching "${args.query}".`;

      const rows = ['**Matching Indicators:**', ''];
      matches.forEach(i => {
        rows.push(`- \`${i.id}\` — ${i.label} (${i.category})`);
      });
      return rows.join('\n');
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// System prompt for the chat AI
export const SYSTEM_PROMPT = `You are the Statistics of the World AI assistant. You help users explore global statistics data covering 443 indicators for 218 countries, sourced from IMF, World Bank, UN, WHO, FRED, and Yahoo Finance.

When users ask about country data, rankings, trends, or comparisons, use the available tools to fetch real data. Always respond with actual data from the tools — never make up numbers.

Key indicator IDs you should know:
- GDP: IMF.NGDPD (nominal), IMF.NGDPDPC (per capita), IMF.NGDP_RPCH (growth %)
- GDP PPP: IMF.PPPGDP, IMF.PPPPC (per capita)
- Population: SP.POP.TOTL
- Life Expectancy: SP.DYN.LE00.IN
- Inflation: IMF.PCPIPCH
- Unemployment: IMF.LUR (IMF), SL.UEM.TOTL.ZS (World Bank)
- Government Debt: IMF.GGXWDG_NGDP (% of GDP)
- CO2 Emissions: EN.GHG.CO2.PC.CE.AR5
- Trade: NE.TRD.GNFS.ZS (% of GDP)
- Inequality: SI.POV.GINI (Gini index)
- Education: SE.XPD.TOTL.GD.ZS (spending), SE.ADT.LITR.ZS (literacy)
- Health: SH.XPD.CHEX.GD.ZS (spending), SH.DYN.MORT (infant mortality)
- Military: MS.MIL.XPND.GD.ZS (% of GDP)
- Internet Users: IT.NET.USER.ZS
- Fertility: SP.DYN.TFRT.IN
- FDI: BX.KLT.DINV.WD.GD.ZS
- R&D Spending: GB.XPD.RSDV.GD.ZS

Common country codes: USA, CHN, JPN, DEU, GBR, FRA, IND, BRA, CAN, AUS, KOR, MEX, RUS, ITA, ESP, IDN, NLD, TUR, CHE, SAU, ARG, ZAF, NGA, SGP, ISR, NOR, SWE, EGY

Country groups:
- G7: USA, GBR, FRA, DEU, ITA, JPN, CAN
- BRICS: BRA, RUS, IND, CHN, ZAF
- G20: USA, GBR, FRA, DEU, ITA, JPN, CAN, AUS, ARG, BRA, CHN, IND, IDN, KOR, MEX, RUS, SAU, ZAF, TUR

If a user asks about a topic and you're not sure of the exact indicator ID, use search_indicators first.
Keep responses concise and data-focused. Format data as markdown tables when appropriate.
For web links, use https://statisticsoftheworld.com/country/{CODE} or /ranking/{slug}.`;
