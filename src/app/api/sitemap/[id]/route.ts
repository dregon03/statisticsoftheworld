import { getSitemapUrls, getSitemapCount, escapeXml } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id) || id < 0) {
      return new Response('Not found', { status: 404 });
    }

    const count = await getSitemapCount();
    if (id >= count) {
      return new Response('Not found', { status: 404 });
    }

    const urls = await getSitemapUrls(id);

    if (urls.length === 0) {
      return new Response('Sitemap temporarily unavailable', { status: 503 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

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
