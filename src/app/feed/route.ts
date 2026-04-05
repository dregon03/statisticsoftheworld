import { BLOG_POSTS } from '@/lib/blog-posts';

export async function GET() {
  const baseUrl = 'https://statisticsoftheworld.com';
  const now = new Date().toUTCString();

  const items = BLOG_POSTS.slice(0, 30).map(post => `
    <item>
      <title><![CDATA[${post.title} (2026)]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <category>${post.category}</category>
      <pubDate>${now}</pubDate>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Statistics of the World — Global Economic Data</title>
    <link>${baseUrl}</link>
    <description>440+ economic indicators for 218 countries. GDP, population, inflation, and more from IMF, World Bank, and WHO. Free API available.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.svg</url>
      <title>Statistics of the World</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
