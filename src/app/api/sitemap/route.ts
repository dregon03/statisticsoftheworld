import { getSitemapCount, BASE_URL } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await getSitemapCount();

    if (count === 0) {
      return new Response('Sitemap temporarily unavailable', { status: 503 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: count }, (_, i) => `  <sitemap>
    <loc>${BASE_URL}/sitemap/${i}.xml</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch {
    return new Response('Sitemap temporarily unavailable', { status: 503 });
  }
}
