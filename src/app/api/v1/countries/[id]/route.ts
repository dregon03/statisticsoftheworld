import { getCountry, getAllIndicatorsForCountry, INDICATORS } from '@/lib/data';

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const country = await getCountry(id);
  if (!country) {
    return Response.json({ error: 'Country not found' }, { status: 404 });
  }

  const indicators = await getAllIndicatorsForCountry(id);

  return Response.json({
    country: {
      id: country.id,
      iso2: country.iso2,
      name: country.name,
      region: country.region,
      incomeLevel: country.incomeLevel,
      capitalCity: country.capitalCity,
    },
    indicators: Object.entries(indicators).map(([indId, d]) => {
      const ind = INDICATORS.find(i => i.id === indId);
      return {
        id: indId,
        label: ind?.label || indId,
        category: ind?.category || 'Unknown',
        value: d.value,
        year: d.year,
        format: ind?.format || 'number',
      };
    }),
  });
}
