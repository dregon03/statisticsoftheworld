import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, BLOG_POSTS } from '@/lib/blog-posts';
import { getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';
import { getCleanCountryUrl, getCleanCountryIndicatorUrl } from '@/lib/country-slugs';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} (2026)`,
    description: post.description,
    alternates: { canonical: `https://statisticsoftheworld.com/blog/${slug}` },
    openGraph: {
      title: `${post.title} (2026)`,
      description: post.description,
      siteName: 'Statistics of the World',
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const ind = INDICATORS.find(i => i.id === post.indicatorId);
  if (!ind) notFound();

  const allData = await getIndicatorForAllCountries(post.indicatorId);
  const data = post.direction === 'top'
    ? allData.slice(0, post.count)
    : allData.slice(-post.count).reverse();

  const year = data[0]?.year || '2026';
  const source = ind.source === 'imf' ? 'IMF World Economic Outlook' : ind.source === 'who' ? 'WHO' : 'World Bank';

  // Fill intro template
  const introText = post.intro
    .replace(/{year}/g, year)
    .replace(/{count}/g, String(post.count));

  // Generate a paragraph per top-5 entry
  const highlights = data.slice(0, 5).map((entry, i) => {
    const val = formatValue(entry.value, ind.format, ind.decimals);
    const rank = i + 1;
    if (rank === 1) return `**${entry.country}** leads with ${ind.label.toLowerCase()} of ${val}.`;
    return `**${entry.country}** ranks #${rank} at ${val}.`;
  });

  // FAQ
  const faqs = [
    {
      q: `What is the ${post.direction === 'top' ? 'highest' : 'lowest'} ${ind.label.toLowerCase()} in ${year}?`,
      a: data[0] ? `${data[0].country} has the ${post.direction === 'top' ? 'highest' : 'lowest'} ${ind.label.toLowerCase()} at ${formatValue(data[0].value, ind.format, ind.decimals)} in ${year}.` : '',
    },
    {
      q: `How many countries are included in this ranking?`,
      a: `This article features the ${post.direction === 'top' ? 'top' : 'bottom'} ${post.count} countries out of ${allData.length} with available data. Full rankings available on the indicator page.`,
    },
    {
      q: `Where does this data come from?`,
      a: `Data is sourced from the ${source}. It is updated regularly as new releases become available.`,
    },
  ].filter(f => f.a);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${post.title} (${year})`,
        description: post.description,
        url: `https://statisticsoftheworld.com/blog/${slug}`,
        datePublished: '2026-04-03',
        dateModified: new Date().toISOString().slice(0, 10),
        author: { '@type': 'Organization', name: 'Statistics of the World' },
        publisher: { '@type': 'Organization', name: 'Statistics of the World' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://statisticsoftheworld.com/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: `https://statisticsoftheworld.com/blog/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'ItemList',
        name: post.title,
        numberOfItems: data.length,
        itemListOrder: post.direction === 'top' ? 'https://schema.org/ItemListOrderDescending' : 'https://schema.org/ItemListOrderAscending',
        itemListElement: data.slice(0, 10).map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${d.country}: ${formatValue(d.value, ind.format, ind.decimals)}`,
        })),
      },
    ],
  };

  // Related posts
  const related = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 4);

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <article className="max-w-[800px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gray-600 transition">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{post.title}</span>
        </nav>

        <h1 className="text-[32px] font-extrabold mb-3 text-[#0d1b2a] leading-tight">{post.title} ({year})</h1>
        <div className="flex items-center gap-3 mb-6 text-[13px] text-[#94a3b8]">
          <span>Source: {source}</span>
          <span>·</span>
          <span>{post.count} countries</span>
          <span>·</span>
          <span>Updated {year}</span>
        </div>

        {/* Intro */}
        <p className="text-[15px] text-[#374151] leading-relaxed mb-6">{introText}</p>

        {/* Highlight paragraphs */}
        <div className="text-[15px] text-[#374151] leading-relaxed mb-8 space-y-2">
          {highlights.map((h, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </div>

        {/* Data table */}
        <h2 className="text-[20px] font-bold mb-3 text-[#0d1b2a]">
          {post.direction === 'top' ? 'Top' : 'Bottom'} {post.count} Countries by {ind.label}
        </h2>
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[13px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 w-12">#</th>
                <th className="px-4 py-2.5">Country</th>
                <th className="px-4 py-2.5 text-right">{ind.label}</th>
                <th className="px-4 py-2.5 text-right w-16">Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => (
                <tr key={entry.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-gray-300 text-[13px]">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link href={getCleanCountryIndicatorUrl(entry.countryId, post.indicatorId)} className="inline-flex items-center gap-2 text-[14px] text-blue-600 hover:text-blue-800">
                      <Flag iso2={entry.iso2} size={20} />
                      {entry.country}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[14px]">
                    {formatValue(entry.value, ind.format, ind.decimals)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-400 text-[13px]">{entry.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[14px] text-[#64748b] mb-8">
          Data from {allData.length} countries is available.{' '}
          <Link href={`/ranking/${slug.includes('gdp-per-capita') ? 'gdp-per-capita' : slug.includes('gdp') ? 'gdp' : slug.includes('inflation') ? 'inflation-rate' : slug.includes('population') ? 'population' : slug.includes('unemployment') ? 'unemployment-rate' : 'gdp'}`} className="text-[#0066cc] hover:underline">
            View full rankings →
          </Link>
        </p>

        {/* FAQ */}
        {faqs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[18px] font-semibold mb-4">FAQ</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="border border-gray-100 rounded-xl" open={i === 0}>
                  <summary className="px-4 py-3 cursor-pointer text-[14px] font-medium hover:bg-gray-50 transition">{faq.q}</summary>
                  <p className="px-4 pb-3 text-[13px] text-[#475569] leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related posts */}
        <div className="mb-8">
          <h2 className="text-[16px] font-semibold mb-3">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map(r => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="text-[14px] font-medium text-[#0d1b2a] mb-1">{r.title}</div>
                <div className="text-[12px] text-[#94a3b8]">{r.category}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Cross-links for SEO */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-[16px] font-semibold mb-3">Explore More Data</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/largest-economies', label: 'Largest Economies' },
              { href: '/richest-countries', label: 'Richest Countries' },
              { href: '/gdp-by-country', label: 'GDP by Country' },
              { href: '/gdp-per-capita-by-country', label: 'GDP per Capita' },
              { href: '/inflation-by-country', label: 'Inflation' },
              { href: '/population-by-country', label: 'Population' },
              { href: '/unemployment-by-country', label: 'Unemployment' },
              { href: '/life-expectancy-by-country', label: 'Life Expectancy' },
              { href: '/g7-economy', label: 'G7' },
              { href: '/brics-economy', label: 'BRICS' },
              { href: '/us-economy', label: 'US Economy' },
              { href: '/china-economy', label: 'China Economy' },
              { href: '/world-economy', label: 'World Economy' },
              { href: '/countries', label: 'All Countries' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="px-3 py-1.5 bg-[#f1f5f9] border border-[#d5dce6] rounded-lg text-[12px] text-[#475569] hover:text-[#0d1b2a] transition">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
