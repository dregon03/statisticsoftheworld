import { getIndicatorForAllCountries, INDICATORS } from '@/lib/data';

type Props = { params: Promise<{ indicator: string }> };

export async function GET(request: Request, { params }: Props) {
  const { indicator: rawIndicator } = await params;
  const indicatorId = decodeURIComponent(rawIndicator);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) {
    return Response.json({ error: 'Indicator not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '0') || 217, 217);

  const data = await getIndicatorForAllCountries(indicatorId);
  const limited = limit > 0 ? data.slice(0, limit) : data;

  return Response.json({
    indicator: { id: ind.id, label: ind.label, category: ind.category, format: ind.format },
    count: limited.length,
    total: data.length,
    data: limited.map((d, i) => ({
      rank: i + 1,
      countryId: d.countryId,
      country: d.country,
      value: d.value,
      year: d.year,
    })),
  });
}
