#!/usr/bin/env node

/**
 * Statistics of the World MCP Server
 *
 * A local MCP server that proxies to the SOTW remote API.
 * Install: npm install -g @sotw/mcp-server
 * Run: sotw-mcp
 *
 * Claude Desktop config (~/.claude/claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "statistics-of-the-world": {
 *       "command": "npx",
 *       "args": ["@sotw/mcp-server"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const BASE_URL = process.env.SOTW_URL || 'https://statisticsoftheworld.com';

const TOOLS = [
  {
    name: 'get_country_overview',
    description: 'Get all key statistics and AI narrative for a country (GDP, population, life expectancy, inflation, etc.)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country_id: { type: 'string', description: 'ISO 3166-1 alpha-3 code (e.g., USA, CAN, GBR, CHN, JPN)' },
      },
      required: ['country_id'],
    },
  },
  {
    name: 'get_indicator_ranking',
    description: 'Rank countries by any indicator (top/bottom N). E.g., "top 10 by GDP", "lowest unemployment".',
    inputSchema: {
      type: 'object' as const,
      properties: {
        indicator_id: { type: 'string', description: 'Indicator ID (e.g., IMF.NGDPD for GDP, SP.POP.TOTL for population)' },
        limit: { type: 'number', description: 'Number of results (default 10)' },
        order: { type: 'string', enum: ['desc', 'asc'], description: '"desc" = highest first, "asc" = lowest first' },
      },
      required: ['indicator_id'],
    },
  },
  {
    name: 'get_historical_data',
    description: 'Get 20+ years of historical data for a country and indicator.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        indicator_id: { type: 'string', description: 'Indicator ID' },
        country_id: { type: 'string', description: 'ISO 3166-1 alpha-3 code' },
      },
      required: ['indicator_id', 'country_id'],
    },
  },
  {
    name: 'compare_countries',
    description: 'Compare 2-10 countries side by side on selected indicators.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        country_ids: { type: 'array', items: { type: 'string' }, description: 'Country codes (max 10)' },
        indicator_ids: { type: 'array', items: { type: 'string' }, description: 'Indicator IDs (default: key macro stats)' },
      },
      required: ['country_ids'],
    },
  },
  {
    name: 'search_indicators',
    description: 'Search for indicators by keyword to find the right indicator ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search term (e.g., "gdp", "education", "co2")' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_available_indicators',
    description: 'List all 443 indicators grouped by category.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        category: { type: 'string', description: 'Filter by category' },
      },
    },
  },
  {
    name: 'get_country_list',
    description: 'List all 218 countries with region and income level.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        region: { type: 'string', description: 'Filter by region' },
      },
    },
  },
];

async function callRemoteMCP(toolName: string, args: Record<string, unknown>): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
    });

    if (!response.ok) {
      return JSON.stringify({ error: `API returned ${response.status}` });
    }

    const data = await response.json();
    return data.result?.content?.[0]?.text || JSON.stringify(data);
  } catch (error) {
    return JSON.stringify({ error: `Failed to reach SOTW API: ${(error as Error).message}` });
  }
}

async function main() {
  const server = new Server(
    {
      name: 'statistics-of-the-world',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = await callRemoteMCP(name, args || {});

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Statistics of the World MCP server running on stdio');
}

main().catch(console.error);
