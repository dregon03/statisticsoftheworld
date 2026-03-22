import { getCountry, getAllIndicatorsForCountry, getIndicatorMeta, INDICATORS } from '@/lib/data';
import { getSourceName, formatValueMd, toMarkdown, getSuggestedQueries } from '@/lib/api-v2-helpers';
import { supabase } from '@/lib/supabase';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format'); // 'markdown' for LLM-friendly

  const country = await getCountry(id);
  if (!country) {
    return Response.json({ error: 'Country not found. Use ISO 3166-1 alpha-3 codes (e.g., USA, CAN, GBR).' }, { status: 404 });
  }

  const indicators = await getAllIndicatorsForCountry(id);

  // Get AI narrative if available
  const { data: narrative } = await supabase
    .from('sotw_country_narratives')
    .select('narrative')
    .eq('country_id', id)
    .single();

  // Build enriched indicator list
  const enrichedIndicators = Object.entries(indicators).map(([indId, d]) => {
    const ind = INDICATORS.find(i => i.id === indId);
    if (!ind) return null;
    return {
      id: indId,
      label: ind.label,
      category: ind.category,
      value: d.value,
      formattedValue: formatValueMd(d.value, ind.format, ind.decimals),
      year: d.year,
      format: ind.format,
      unit: ind.format === 'currency' ? 'USD' : ind.format === 'percent' ? '%' : ind.format === 'years' ? 'years' : undefined,
      source: getSourceName(ind),
    };
  }).filter(Boolean);

  // Group by category
  const byCategory: Record<string, typeof enrichedIndicators> = {};
  for (const ind of enrichedIndicators) {
    if (!ind) continue;
    if (!byCategory[ind.category]) byCategory[ind.category] = [];
    byCategory[ind.category].push(ind);
  }

  const result = {
    country: {
      id: country.id,
      iso2: country.iso2,
      name: country.name,
      region: country.region,
      incomeLevel: country.incomeLevel,
      capitalCity: country.capitalCity,
    },
    narrative: narrative?.narrative || null,
    indicatorCount: enrichedIndicators.length,
    indicators: enrichedIndicators,
    indicatorsByCategory: byCategory,
    suggestedQueries: [
      `GET /api/v2/history?indicator=IMF.NGDPD&country=${id}`,
      `GET /api/v2/history?indicator=SP.POP.TOTL&country=${id}`,
      `GET /api/v2/indicator/IMF.NGDPD?limit=10`,
      `GET /api/v1/compare?countries=${id},USA&indicators=IMF.NGDPD,SP.POP.TOTL`,
    ],
    meta: {
      source: 'statisticsoftheworld.com',
      api: 'v2',
      documentation: 'https://statisticsoftheworld.com/api-docs',
    },
  };

  if (format === 'markdown') {
    const rows = enrichedIndicators
      .filter((i): i is NonNullable<typeof i> => i !== null)
      .slice(0, 30)
      .map(i => ({ label: `${i.label} (${i.year})`, value: i.formattedValue }));

    const md = toMarkdown(`${country.name} — Key Statistics`, rows);
    return new Response(md, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  return Response.json(result);
}
