import { getHistoricalData, getHistoricalDataMultiCountry, getHistoricalStats, getYoYChange, getIndicatorMeta, getCountry, INDICATORS } from '@/lib/data';
import { getSourceName, formatValueMd, getRelatedIndicators } from '@/lib/api-v2-helpers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indicatorId = searchParams.get('indicator');
  const countryId = searchParams.get('country');
  const countriesParam = searchParams.get('countries');
  const format = searchParams.get('format');

  if (!indicatorId) {
    return Response.json({
      error: 'Missing indicator parameter',
      hint: 'Use GET /api/v1/indicators to list all indicators, or GET /api/v1/search?q=gdp to search.',
      example: 'GET /api/v2/history?indicator=IMF.NGDPD&country=USA',
    }, { status: 400 });
  }

  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) {
    return Response.json({ error: 'Indicator not found' }, { status: 404 });
  }

  // Multi-country comparison
  if (countriesParam) {
    const ids = countriesParam.split(',').slice(0, 10);
    const data = await getHistoricalDataMultiCountry(indicatorId, ids);

    if (format === 'markdown') {
      const lines = [`# ${ind.label} — Historical Comparison`, ''];
      for (const [cid, points] of Object.entries(data)) {
        const last = (points as any[]).filter((p: any) => p.value !== null).at(-1);
        lines.push(`## ${cid}: ${last ? formatValueMd(last.value, ind.format, ind.decimals) : 'N/A'} (${last?.year || '?'})`);
      }
      return new Response(lines.join('\n'), {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      });
    }

    return Response.json({
      indicator: { id: ind.id, label: ind.label, category: ind.category, source: getSourceName(ind) },
      countries: data,
      meta: { source: 'statisticsoftheworld.com', api: 'v2' },
    });
  }

  if (!countryId) {
    return Response.json({
      error: 'Missing country parameter',
      example: 'GET /api/v2/history?indicator=IMF.NGDPD&country=USA',
    }, { status: 400 });
  }

  const [history, stats, yoy, meta, country] = await Promise.all([
    getHistoricalData(indicatorId, countryId),
    getHistoricalStats(indicatorId, countryId),
    getYoYChange(indicatorId, countryId),
    getIndicatorMeta(indicatorId),
    getCountry(countryId),
  ]);

  const validHistory = history.filter(d => d.value !== null);

  const result = {
    indicator: {
      id: ind.id,
      label: ind.label,
      category: ind.category,
      format: ind.format,
      source: getSourceName(ind),
      description: meta?.description || null,
      unit: meta?.unit || null,
    },
    country: country ? {
      id: country.id,
      name: country.name,
      iso2: country.iso2,
      region: country.region,
    } : { id: countryId },
    summary: {
      latest: validHistory.length > 0 ? {
        value: validHistory[validHistory.length - 1].value,
        formattedValue: formatValueMd(validHistory[validHistory.length - 1].value, ind.format, ind.decimals),
        year: validHistory[validHistory.length - 1].year,
      } : null,
      yoyChange: yoy ? {
        changePercent: yoy.changePercent,
        previousValue: yoy.previousValue,
        previousYear: yoy.previousYear,
        currentYear: yoy.currentYear,
      } : null,
      stats: stats ? {
        max: { value: stats.max, year: stats.maxYear },
        min: { value: stats.min, year: stats.minYear },
        cagr: stats.cagr,
        dataPoints: stats.dataPoints,
      } : null,
    },
    dataPoints: validHistory.length,
    coverageYears: validHistory.length > 0
      ? `${validHistory[0].year}–${validHistory[validHistory.length - 1].year}`
      : null,
    data: validHistory.map(d => ({
      year: d.year,
      value: d.value,
      formattedValue: formatValueMd(d.value, ind.format, ind.decimals),
    })),
    relatedIndicators: getRelatedIndicators(indicatorId, 3),
    suggestedQueries: [
      `GET /api/v2/indicator/${encodeURIComponent(indicatorId)}?limit=10`,
      `GET /api/v2/country/${countryId}`,
    ],
    meta: { source: 'statisticsoftheworld.com', api: 'v2' },
  };

  if (format === 'markdown') {
    const lines = [
      `# ${country?.name || countryId} — ${ind.label}`,
      '',
      result.summary.latest
        ? `**Latest:** ${result.summary.latest.formattedValue} (${result.summary.latest.year})`
        : '',
      result.summary.yoyChange?.changePercent != null
        ? `**YoY Change:** ${result.summary.yoyChange.changePercent >= 0 ? '+' : ''}${result.summary.yoyChange.changePercent.toFixed(1)}%`
        : '',
      result.summary.stats
        ? `**Range:** ${formatValueMd(result.summary.stats.min.value, ind.format, ind.decimals)} (${result.summary.stats.min.year}) – ${formatValueMd(result.summary.stats.max.value, ind.format, ind.decimals)} (${result.summary.stats.max.year})`
        : '',
      '',
      '| Year | Value |',
      '|------|-------|',
      ...validHistory.slice(-10).map(d => `| ${d.year} | ${formatValueMd(d.value, ind.format, ind.decimals)} |`),
      '',
      `*${validHistory.length} data points total. Source: ${getSourceName(ind)}*`,
    ].filter(Boolean);

    return new Response(lines.join('\n'), {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  return Response.json(result);
}
