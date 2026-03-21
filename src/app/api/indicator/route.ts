import { getIndicatorForAllCountries } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Missing indicator id' }, { status: 400 });
  }
  const data = await getIndicatorForAllCountries(id);
  return Response.json(data);
}
