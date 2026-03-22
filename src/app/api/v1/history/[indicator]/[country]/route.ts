import { getHistoricalData, getHistoricalDataMultiCountry, INDICATORS } from '@/lib/data';

type Props = { params: Promise<{ indicator: string; country: string }> };

export async function GET(request: Request, { params }: Props) {
  const { indicator: rawIndicator, country } = await params;
  const indicatorId = decodeURIComponent(rawIndicator);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!ind) {
    return Response.json({ error: 'Indicator not found' }, { status: 404 });
  }

  // Support multi-country via comma-separated country param
  const countryIds = country.split(',').slice(0, 10);

  if (countryIds.length === 1) {
    const data = await getHistoricalData(indicatorId, countryIds[0]);
    return Response.json({
      indicator: { id: ind.id, label: ind.label, format: ind.format },
      country: countryIds[0],
      count: data.length,
      data,
    });
  }

  const data = await getHistoricalDataMultiCountry(indicatorId, countryIds);
  return Response.json({
    indicator: { id: ind.id, label: ind.label, format: ind.format },
    countries: countryIds,
    data,
  });
}
