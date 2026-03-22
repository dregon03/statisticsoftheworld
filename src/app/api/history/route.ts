import { getHistoricalData, getHistoricalDataMultiCountry } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indicator = searchParams.get('indicator');
  const country = searchParams.get('country');
  const countries = searchParams.get('countries'); // comma-separated

  if (!indicator) {
    return Response.json({ error: 'Missing indicator param' }, { status: 400 });
  }

  if (countries) {
    const ids = countries.split(',').slice(0, 10); // max 10 countries
    const data = await getHistoricalDataMultiCountry(indicator, ids);
    return Response.json(data);
  }

  if (country) {
    const data = await getHistoricalData(indicator, country);
    return Response.json(data);
  }

  return Response.json({ error: 'Missing country or countries param' }, { status: 400 });
}
