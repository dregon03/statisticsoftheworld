import { INDICATORS, CATEGORIES } from '@/lib/data';

export async function GET() {
  return Response.json({
    count: INDICATORS.length,
    categories: CATEGORIES,
    data: INDICATORS.map(ind => ({
      id: ind.id,
      label: ind.label,
      category: ind.category,
      format: ind.format,
      decimals: ind.decimals,
      source: ind.source || 'wb',
    })),
  });
}
