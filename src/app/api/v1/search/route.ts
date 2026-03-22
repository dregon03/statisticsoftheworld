import { INDICATORS } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  if (!q && !category) {
    return Response.json({
      error: 'Missing q (search query) or category parameter',
      example: 'GET /api/v1/search?q=gdp or GET /api/v1/search?category=Economy',
    }, { status: 400 });
  }

  let results = INDICATORS;

  if (category) {
    results = results.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    // Score-based fuzzy search
    const scored = results.map(ind => {
      const label = ind.label.toLowerCase();
      const cat = ind.category.toLowerCase();
      const id = ind.id.toLowerCase();

      let score = 0;
      if (label === q) score = 100;
      else if (label.startsWith(q)) score = 80;
      else if (label.includes(q)) score = 60;
      else if (cat.includes(q)) score = 40;
      else if (id.includes(q)) score = 30;
      else {
        // Check individual words
        const words = q.split(/\s+/);
        const matchedWords = words.filter(w => label.includes(w) || cat.includes(w));
        if (matchedWords.length > 0) score = 20 + (matchedWords.length / words.length) * 30;
      }

      return { ind, score };
    });

    results = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.ind);
  }

  return Response.json({
    query: q || undefined,
    category: category || undefined,
    count: Math.min(results.length, limit),
    total: results.length,
    data: results.slice(0, limit).map(ind => ({
      id: ind.id,
      label: ind.label,
      category: ind.category,
      format: ind.format,
      source: ind.source || 'wb',
    })),
  });
}
