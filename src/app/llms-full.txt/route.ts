import { INDICATORS, CATEGORIES } from '@/lib/data';

export async function GET() {
  const lines: string[] = [
    '# Statistics of the World — Complete Indicator Catalog',
    '',
    '> This file lists all indicators available on statisticsoftheworld.com.',
    '> Use indicator IDs with the API: GET /api/v1/rankings/:id or /api/v1/history/:id/:country',
    '> For a concise overview, see /llms.txt',
    '',
    `Total: ${INDICATORS.length} indicators across ${CATEGORIES.length} categories for 218 countries.`,
    '',
  ];

  // Group by category
  const byCategory: Record<string, typeof INDICATORS> = {};
  for (const ind of INDICATORS) {
    if (!byCategory[ind.category]) byCategory[ind.category] = [];
    byCategory[ind.category].push(ind);
  }

  for (const category of CATEGORIES) {
    const indicators = byCategory[category];
    if (!indicators || indicators.length === 0) continue;

    lines.push(`## ${category} (${indicators.length} indicators)`);
    lines.push('');
    lines.push('| ID | Label | Format | Source |');
    lines.push('|----|-------|--------|--------|');

    for (const ind of indicators) {
      const source = ind.source === 'imf' ? 'IMF'
        : ind.source === 'who' ? 'WHO'
        : ind.id.startsWith('YF.') ? 'Yahoo Finance'
        : ind.id.startsWith('FRED.') ? 'FRED'
        : ind.id.startsWith('ECB.') ? 'ECB'
        : ind.id.startsWith('AV.') ? 'Alpha Vantage'
        : ind.id.startsWith('UN.') ? 'United Nations'
        : 'World Bank';
      lines.push(`| ${ind.id} | ${ind.label} | ${ind.format} | ${source} |`);
    }

    lines.push('');
  }

  // Add country list
  lines.push('## Country Codes (ISO 3166-1 alpha-3)');
  lines.push('');
  lines.push('Use these codes with the API. Example: /api/v1/countries/USA');
  lines.push('');
  lines.push('Major economies: USA, CHN, JPN, DEU, GBR, FRA, IND, BRA, CAN, AUS, KOR, MEX, RUS, ITA, ESP');
  lines.push('');
  lines.push('G7: USA, GBR, FRA, DEU, ITA, JPN, CAN');
  lines.push('BRICS: BRA, RUS, IND, CHN, ZAF');
  lines.push('G20: USA, GBR, FRA, DEU, ITA, JPN, CAN, AUS, ARG, BRA, CHN, IND, IDN, KOR, MEX, RUS, SAU, ZAF, TUR, EU');
  lines.push('');
  lines.push('Full list available at: GET /api/v1/countries');
  lines.push('');

  // API reference
  lines.push('## API Quick Reference');
  lines.push('');
  lines.push('Base URL: https://statisticsoftheworld.com');
  lines.push('');
  lines.push('```');
  lines.push('# List all countries');
  lines.push('GET /api/v1/countries');
  lines.push('');
  lines.push('# Get all indicators for a country');
  lines.push('GET /api/v1/countries/USA');
  lines.push('');
  lines.push('# Rank countries by an indicator');
  lines.push('GET /api/v1/rankings/IMF.NGDPD?limit=20');
  lines.push('');
  lines.push('# Historical time series');
  lines.push('GET /api/v1/history/IMF.NGDPD/USA');
  lines.push('');
  lines.push('# Search indicators');
  lines.push('GET /api/v1/indicators');
  lines.push('');
  lines.push('# Compare countries (historical)');
  lines.push('GET /api/history?indicator=IMF.NGDPD&countries=USA,CHN,JPN');
  lines.push('```');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
