import { getCountries } from '@/lib/data';

export async function GET() {
  const countries = await getCountries();
  return Response.json({
    count: countries.length,
    data: countries.map(c => ({
      id: c.id,
      iso2: c.iso2,
      name: c.name,
      region: c.region,
      incomeLevel: c.incomeLevel,
      capitalCity: c.capitalCity,
      latitude: c.latitude || null,
      longitude: c.longitude || null,
    })),
  });
}
