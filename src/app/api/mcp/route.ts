import {
  getCountry,
  getCountries,
  getAllIndicatorsForCountry,
  getIndicatorForAllCountries,
  getHistoricalData,
  INDICATORS,
  CATEGORIES,
  formatValue,
} from '@/lib/data';
import { supabase } from '@/lib/supabase';

// MCP tool definitions
const TOOLS = [
  {
    name: 'get_country_overview',
    description: 'Get all key statistics and AI narrative for a country. Returns GDP, population, life expectancy, inflation, unemployment, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        country_id: { type: 'string', description: 'ISO 3166-1 alpha-3 code (e.g., USA, CAN, GBR, CHN, JPN, DEU)' },
      },
      required: ['country_id'],
    },
  },
  {
    name: 'get_indicator_ranking',
    description: 'Rank countries by any indicator. Supports top N, bottom N. Use for "highest GDP", "lowest unemployment", "most populated" queries.',
    inputSchema: {
      type: 'object',
      properties: {
        indicator_id: { type: 'string', description: 'Indicator ID (e.g., IMF.NGDPD for GDP, SP.POP.TOTL for population, IMF.PCPIPCH for inflation)' },
        limit: { type: 'number', description: 'Number of results (default 10)' },
        order: { type: 'string', enum: ['desc', 'asc'], description: '"desc" for highest first, "asc" for lowest first' },
      },
      required: ['indicator_id'],
    },
  },
  {
    name: 'get_historical_data',
    description: 'Get historical time series (20+ years) for a country and indicator pair.',
    inputSchema: {
      type: 'object',
      properties: {
        indicator_id: { type: 'string', description: 'Indicator ID' },
        country_id: { type: 'string', description: 'ISO 3166-1 alpha-3 code' },
      },
      required: ['indicator_id', 'country_id'],
    },
  },
  {
    name: 'compare_countries',
    description: 'Compare 2-10 countries on selected indicators.',
    inputSchema: {
      type: 'object',
      properties: {
        country_ids: { type: 'array', items: { type: 'string' }, description: 'List of country codes (max 10)' },
        indicator_ids: { type: 'array', items: { type: 'string' }, description: 'Indicator IDs to compare (default: GDP, population, life expectancy, etc.)' },
      },
      required: ['country_ids'],
    },
  },
  {
    name: 'search_indicators',
    description: 'Search for indicators by keyword. Use when you need to find the right indicator ID.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term (e.g., "gdp", "population", "education", "co2")' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_available_indicators',
    description: 'List all available indicators grouped by category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional: filter by category name' },
      },
    },
  },
  {
    name: 'get_country_list',
    description: 'List all 218 countries with metadata (region, income level, capital).',
    inputSchema: {
      type: 'object',
      properties: {
        region: { type: 'string', description: 'Optional: filter by region' },
      },
    },
  },
];

const KEY_IDS = ['IMF.NGDPD', 'IMF.NGDPDPC', 'IMF.NGDP_RPCH', 'SP.POP.TOTL', 'SP.DYN.LE00.IN', 'IMF.PCPIPCH', 'IMF.LUR', 'IMF.GGXWDG_NGDP'];

async function handleToolCall(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case 'get_country_overview': {
      const country = await getCountry(args.country_id);
      if (!country) return { error: `Country "${args.country_id}" not found` };

      const indicators = await getAllIndicatorsForCountry(args.country_id);
      const { data: narrative } = await supabase
        .from('sotw_country_narratives')
        .select('narrative')
        .eq('country_id', args.country_id)
        .single();

      const keyStats: Record<string, any> = {};
      for (const indId of KEY_IDS) {
        const ind = INDICATORS.find(i => i.id === indId);
        const d = indicators[indId];
        if (ind && d) {
          keyStats[ind.label] = { value: d.value, formatted: formatValue(d.value, ind.format, ind.decimals), year: d.year };
        }
      }

      return {
        country: { id: country.id, name: country.name, region: country.region, incomeLevel: country.incomeLevel, capital: country.capitalCity },
        narrative: narrative?.narrative || null,
        keyStatistics: keyStats,
        totalIndicators: Object.keys(indicators).length,
      };
    }

    case 'get_indicator_ranking': {
      const ind = INDICATORS.find(i => i.id === args.indicator_id);
      if (!ind) return { error: `Indicator "${args.indicator_id}" not found` };

      let data = await getIndicatorForAllCountries(args.indicator_id);
      if (args.order === 'asc') data = [...data].reverse();
      const limit = args.limit || 10;

      return {
        indicator: { id: ind.id, label: ind.label, category: ind.category },
        totalCountries: data.length,
        data: data.slice(0, limit).map((d, i) => ({
          rank: i + 1,
          countryId: d.countryId,
          country: d.country,
          value: d.value,
          formatted: formatValue(d.value, ind.format, ind.decimals),
          year: d.year,
        })),
      };
    }

    case 'get_historical_data': {
      const ind = INDICATORS.find(i => i.id === args.indicator_id);
      if (!ind) return { error: `Indicator "${args.indicator_id}" not found` };

      const history = await getHistoricalData(args.indicator_id, args.country_id);
      const valid = history.filter(d => d.value !== null);

      return {
        indicator: { id: ind.id, label: ind.label },
        country: args.country_id,
        dataPoints: valid.length,
        data: valid.map(d => ({
          year: d.year,
          value: d.value,
          formatted: formatValue(d.value, ind.format, ind.decimals),
        })),
      };
    }

    case 'compare_countries': {
      const countryIds = (args.country_ids || []).slice(0, 10);
      const indicatorIds = args.indicator_ids || KEY_IDS;

      const results = await Promise.all(
        countryIds.map(async (cid: string) => {
          const country = await getCountry(cid);
          const indicators = await getAllIndicatorsForCountry(cid);
          const data: Record<string, any> = {};
          for (const indId of indicatorIds) {
            const ind = INDICATORS.find(i => i.id === indId);
            const d = indicators[indId];
            if (ind) {
              data[ind.label] = d ? { value: d.value, formatted: formatValue(d.value, ind.format, ind.decimals), year: d.year } : null;
            }
          }
          return { countryId: cid, country: country?.name || cid, data };
        })
      );

      return { comparison: results };
    }

    case 'search_indicators': {
      const q = (args.query || '').toLowerCase();
      const matches = INDICATORS
        .filter(i => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
        .slice(0, 15);
      return { results: matches.map(i => ({ id: i.id, label: i.label, category: i.category, format: i.format })) };
    }

    case 'get_available_indicators': {
      let indicators = INDICATORS;
      if (args.category) {
        indicators = indicators.filter(i => i.category.toLowerCase() === args.category.toLowerCase());
      }
      return {
        count: indicators.length,
        categories: CATEGORIES,
        indicators: indicators.map(i => ({ id: i.id, label: i.label, category: i.category })),
      };
    }

    case 'get_country_list': {
      let countries = await getCountries();
      if (args.region) {
        countries = countries.filter(c => c.region.toLowerCase().includes(args.region.toLowerCase()));
      }
      return {
        count: countries.length,
        countries: countries.map(c => ({ id: c.id, name: c.name, region: c.region, incomeLevel: c.incomeLevel, capital: c.capitalCity })),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Handle MCP JSON-RPC messages
async function handleMCPMessage(message: any): Promise<any> {
  const { method, params, id } = message;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: {
            name: 'statistics-of-the-world',
            version: '1.0.0',
          },
        },
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS },
      };

    case 'tools/call': {
      const { name, arguments: args } = params;
      const result = await handleToolCall(name, args || {});
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    }

    case 'notifications/initialized':
      return null; // No response needed for notifications

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

// POST handler for MCP Streamable HTTP transport
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle single message or batch
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(handleMCPMessage));
      const responses = results.filter(r => r !== null);
      return Response.json(responses);
    }

    const result = await handleMCPMessage(body);
    if (result === null) {
      return new Response(null, { status: 204 });
    }

    return Response.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('MCP error:', error);
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } },
      { status: 400 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET handler for discovery
export async function GET() {
  return Response.json({
    name: 'statistics-of-the-world',
    version: '1.0.0',
    description: 'MCP server for global statistics — 443 indicators for 218 countries',
    protocol: 'MCP Streamable HTTP',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    usage: {
      endpoint: 'POST https://statisticsoftheworld.com/api/mcp',
      transport: 'Streamable HTTP (JSON-RPC 2.0)',
      example: {
        method: 'tools/call',
        params: { name: 'get_country_overview', arguments: { country_id: 'USA' } },
      },
    },
  });
}
