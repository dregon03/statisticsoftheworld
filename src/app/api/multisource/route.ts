import { getMultiSourceData } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  const data = await getMultiSourceData(id);
  return Response.json(data);
}
