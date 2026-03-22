import { getIndicatorForAllCountries, getIndicatorMeta, INDICATORS } from '@/lib/data';
import { getSourceName, getRelatedIndicators, formatValueMd, rankingToMarkdown } from '@/lib/api-v2-helpers';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  const { id: rawId } = await params;
  const indicatorId = decodeURIComponent(rawId);
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '0') || 218, 218);
  const format = searchParams.get('format');
  const region = searchParams.get('region'); // filter by region
  const income = searchParams.get('income'); // filter by income level
  const order = searchParams.get('order') || 'desc'; // 'asc' for bottom N

  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) {
    return Response.json({
      error: 'Indicator not found',
      hint: 'Use GET /api/v1/indicators to list all available indicators, or GET /api/v1/search?q=gdp to search by keyword.',
    }, { status: 404 });
  }

  const [data, meta] = await Promise.all([
    getIndicatorForAllCountries(indicatorId),
    getIndicatorMeta(indicatorId),
  ]);

  // Apply order
  let sorted = order === 'asc' ? [...data].reverse() : data;

  // Note: region/income filtering would require country metadata joins.
  // For now we'll just limit.
  const limited = limit > 0 ? sorted.slice(0, limit) : sorted;

  const enrichedData = limited.map((d, i) => ({
    rank: order === 'asc' ? data.length - i : i + 1,
    countryId: d.countryId,
    country: d.country,
    iso2: d.iso2,
    value: d.value,
    formattedValue: formatValueMd(d.value, ind.format, ind.decimals),
    year: d.year,
  }));

  const result = {
    indicator: {
      id: ind.id,
      label: ind.label,
      category: ind.category,
      format: ind.format,
      decimals: ind.decimals,
      source: getSourceName(ind),
      description: meta?.description || null,
      methodology: meta?.methodology || null,
      unit: meta?.unit || null,
      sourceUrl: meta?.sourceUrl || null,
    },
    count: enrichedData.length,
    total: data.length,
    order,
    data: enrichedData,
    relatedIndicators: getRelatedIndicators(indicatorId),
    suggestedQueries: [
      `GET /api/v2/history?indicator=${indicatorId}&country=${enrichedData[0]?.countryId || 'USA'}`,
      ...getRelatedIndicators(indicatorId, 2).map(r =>
        `GET /api/v2/indicator/${encodeURIComponent(r.id)}?limit=10`
      ),
    ],
    meta: {
      source: 'statisticsoftheworld.com',
      api: 'v2',
    },
  };

  if (format === 'markdown') {
    const md = rankingToMarkdown(
      `${ind.label} — Country Rankings`,
      enrichedData.map(d => ({
        rank: d.rank,
        country: d.country,
        value: d.formattedValue,
        year: d.year,
      })),
    );
    return new Response(md, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  return Response.json(result);
}
