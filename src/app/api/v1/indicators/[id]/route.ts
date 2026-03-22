import { getIndicatorForAllCountries, getIndicatorMeta, INDICATORS } from '@/lib/data';

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const indicatorId = decodeURIComponent(id);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) {
    return Response.json({ error: 'Indicator not found' }, { status: 404 });
  }

  const [data, meta] = await Promise.all([
    getIndicatorForAllCountries(indicatorId),
    getIndicatorMeta(indicatorId),
  ]);

  return Response.json({
    indicator: {
      id: ind.id,
      label: ind.label,
      category: ind.category,
      format: ind.format,
      source: ind.source || 'wb',
      description: meta?.description || null,
      methodology: meta?.methodology || null,
      unit: meta?.unit || null,
      sourceUrl: meta?.sourceUrl || null,
    },
    count: data.length,
    data: data.map((d, i) => ({
      rank: i + 1,
      countryId: d.countryId,
      country: d.country,
      value: d.value,
      year: d.year,
    })),
  });
}
