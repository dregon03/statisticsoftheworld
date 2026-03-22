import { INDICATORS, type Indicator } from './data';

/**
 * Find related indicators in the same category.
 */
export function getRelatedIndicators(indicatorId: string, limit = 5): { id: string; label: string; category: string }[] {
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) return [];
  return INDICATORS
    .filter(i => i.category === ind.category && i.id !== indicatorId)
    .slice(0, limit)
    .map(i => ({ id: i.id, label: i.label, category: i.category }));
}

/**
 * Generate suggested follow-up queries for an indicator.
 */
export function getSuggestedQueries(indicatorId: string, countryId?: string): string[] {
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) return [];

  const queries: string[] = [];

  if (countryId) {
    queries.push(`GET /api/v2/history?indicator=${indicatorId}&country=${countryId}`);
    queries.push(`GET /api/v2/country/${countryId}`);
  }

  queries.push(`GET /api/v2/indicator/${encodeURIComponent(indicatorId)}?limit=10`);

  // Suggest related indicators
  const related = getRelatedIndicators(indicatorId, 2);
  for (const r of related) {
    queries.push(`GET /api/v2/indicator/${encodeURIComponent(r.id)}?limit=10`);
  }

  return queries;
}

/**
 * Get source name from indicator.
 */
export function getSourceName(ind: Indicator): string {
  if (ind.source === 'imf') return 'IMF World Economic Outlook';
  if (ind.source === 'who') return 'WHO Global Health Observatory';
  if (ind.id.startsWith('YF.')) return 'Yahoo Finance';
  if (ind.id.startsWith('FRED.')) return 'FRED (Federal Reserve)';
  if (ind.id.startsWith('ECB.')) return 'ECB';
  if (ind.id.startsWith('UN.')) return 'United Nations';
  return 'World Bank World Development Indicators';
}

/**
 * Format a value as markdown-friendly string.
 */
export function formatValueMd(value: number | null, format: string, decimals?: number): string {
  if (value === null) return 'N/A';
  const d = decimals ?? 0;
  switch (format) {
    case 'currency':
      if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: d })}`;
    case 'percent':
      return `${value.toFixed(d)}%`;
    case 'years':
      return `${value.toFixed(d)} years`;
    default:
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      return value.toLocaleString('en-US', { maximumFractionDigits: d });
  }
}

/**
 * Convert a response to markdown format for LLM consumption.
 */
export function toMarkdown(title: string, rows: { label: string; value: string }[]): string {
  const lines = [`# ${title}`, ''];
  for (const row of rows) {
    lines.push(`- **${row.label}**: ${row.value}`);
  }
  return lines.join('\n');
}

/**
 * Convert a ranking table to markdown.
 */
export function rankingToMarkdown(
  title: string,
  data: { rank: number; country: string; value: string; year: string }[],
): string {
  const lines = [`# ${title}`, '', '| Rank | Country | Value | Year |', '|------|---------|-------|------|'];
  for (const row of data) {
    lines.push(`| ${row.rank} | ${row.country} | ${row.value} | ${row.year} |`);
  }
  return lines.join('\n');
}
