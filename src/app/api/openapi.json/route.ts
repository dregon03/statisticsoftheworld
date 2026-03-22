import { INDICATORS } from '@/lib/data';

export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Statistics of the World API',
      description: `Free REST API for global statistics. ${INDICATORS.length} indicators for 218 countries from IMF, World Bank, UN, WHO, FRED, and more. No authentication required for basic access.`,
      version: '2.0.0',
      contact: {
        name: 'Statistics of the World',
        url: 'https://statisticsoftheworld.com',
      },
    },
    servers: [
      { url: 'https://statisticsoftheworld.com', description: 'Production' },
    ],
    paths: {
      '/api/v1/countries': {
        get: {
          operationId: 'listCountries',
          summary: 'List all 218 countries with metadata',
          description: 'Returns all countries with ISO codes, region, income level, and capital city.',
          responses: {
            '200': {
              description: 'List of countries',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', description: 'ISO 3166-1 alpha-3 code' },
                            iso2: { type: 'string' },
                            name: { type: 'string' },
                            region: { type: 'string' },
                            incomeLevel: { type: 'string' },
                            capitalCity: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v2/country/{id}': {
        get: {
          operationId: 'getCountryData',
          summary: 'Get enriched data for a country',
          description: 'Returns all latest indicator values with metadata, AI narrative, suggested follow-up queries. Supports markdown format.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ISO 3166-1 alpha-3 code (e.g., USA, CAN, GBR)' },
            { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'markdown'] }, description: 'Response format. "markdown" returns LLM-friendly text.' },
          ],
          responses: {
            '200': { description: 'Country data with indicators, narrative, and suggestions' },
            '404': { description: 'Country not found' },
          },
        },
      },
      '/api/v2/indicator/{id}': {
        get: {
          operationId: 'getIndicatorRanking',
          summary: 'Rank all countries by an indicator',
          description: 'Returns countries ranked by the specified indicator, with metadata, related indicators, and suggested queries.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Indicator ID (e.g., IMF.NGDPD, SP.POP.TOTL)' },
            { name: 'limit', in: 'query', required: false, schema: { type: 'number' }, description: 'Number of countries (default all)' },
            { name: 'order', in: 'query', required: false, schema: { type: 'string', enum: ['desc', 'asc'] }, description: 'Sort order (default desc)' },
            { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'markdown'] } },
          ],
          responses: {
            '200': { description: 'Ranked countries with enriched data' },
            '404': { description: 'Indicator not found' },
          },
        },
      },
      '/api/v2/history': {
        get: {
          operationId: 'getHistoricalData',
          summary: 'Get historical time series for a country and indicator',
          description: 'Returns 20+ years of historical data with summary statistics (YoY change, min, max, CAGR). Supports multi-country comparison.',
          parameters: [
            { name: 'indicator', in: 'query', required: true, schema: { type: 'string' }, description: 'Indicator ID' },
            { name: 'country', in: 'query', required: false, schema: { type: 'string' }, description: 'Single country code' },
            { name: 'countries', in: 'query', required: false, schema: { type: 'string' }, description: 'Comma-separated country codes for comparison (max 10)' },
            { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'markdown'] } },
          ],
          responses: {
            '200': { description: 'Historical data with summary statistics' },
          },
        },
      },
      '/api/v1/search': {
        get: {
          operationId: 'searchIndicators',
          summary: 'Search indicators by keyword',
          description: 'Fuzzy search across all indicator names, categories, and IDs.',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query (e.g., "gdp", "population", "education")' },
            { name: 'category', in: 'query', required: false, schema: { type: 'string' }, description: 'Filter by category' },
            { name: 'limit', in: 'query', required: false, schema: { type: 'number' }, description: 'Max results (default 20)' },
          ],
          responses: {
            '200': { description: 'Matching indicators' },
          },
        },
      },
      '/api/v1/compare': {
        get: {
          operationId: 'compareCountries',
          summary: 'Compare multiple countries side by side',
          description: 'Returns selected indicators for multiple countries. Defaults to key macro indicators if none specified.',
          parameters: [
            { name: 'countries', in: 'query', required: true, schema: { type: 'string' }, description: 'Comma-separated country codes (e.g., USA,CHN,JPN)' },
            { name: 'indicators', in: 'query', required: false, schema: { type: 'string' }, description: 'Comma-separated indicator IDs (default: GDP, population, etc.)' },
          ],
          responses: {
            '200': { description: 'Comparison data' },
          },
        },
      },
      '/api/v1/indicators': {
        get: {
          operationId: 'listIndicators',
          summary: 'List all available indicators',
          description: `Returns all ${INDICATORS.length} indicators with categories and metadata.`,
          responses: {
            '200': { description: 'List of indicators' },
          },
        },
      },
      '/api/chat': {
        post: {
          operationId: 'askSOTW',
          summary: 'Natural language query (AI-powered)',
          description: 'Ask a question in plain English about global statistics. Returns AI-generated response with real data.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', description: 'Natural language question' },
                    history: { type: 'array', description: 'Previous messages for context' },
                  },
                  required: ['message'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'AI response with data' },
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
