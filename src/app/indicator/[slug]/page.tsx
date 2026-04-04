import Link from 'next/link';
import { getIndicatorForAllCountries, INDICATORS, formatValue } from '@/lib/data';
import { getIndicatorBySlug, getAllIndicatorSlugs, getSlugForIndicator } from '@/lib/indicator-slugs';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Flag from '../../Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getCleanCountryIndicatorUrl } from '@/lib/country-slugs';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const match = getIndicatorBySlug(slug);
  if (!match) return { title: 'Not Found' };

  const ind = INDICATORS.find(i => i.id === match.id);
  if (!ind) return { title: 'Not Found' };

  const source = ind.source === 'imf' ? 'IMF' : ind.source === 'who' ? 'WHO' : 'World Bank';

  return {
    title: `${ind.label} by Country — 2026 Data & Rankings`,
    description: `${ind.label} for all countries ranked and compared. View data, charts, and historical trends across 218 countries. Source: ${source}. Category: ${ind.category}. Free API available.`,
    alternates: {
      canonical: `https://statisticsoftheworld.com/indicator/${slug}`,
    },
    openGraph: {
      title: `${ind.label} by Country — Global Rankings`,
      description: `Compare ${ind.label.toLowerCase()} across 218 countries with interactive data.`,
      siteName: 'Statistics of the World',
    },
  };
}

export async function generateStaticParams() {
  return getAllIndicatorSlugs().map(slug => ({ slug }));
}

export default async function IndicatorPage({ params }: Props) {
  const { slug } = await params;
  const match = getIndicatorBySlug(slug);
  if (!match) notFound();

  const ind = INDICATORS.find(i => i.id === match.id);
  if (!ind) notFound();

  const data = await getIndicatorForAllCountries(match.id);

  const top = data[0];
  const bottom = data[data.length - 1];
  const year = top?.year || '2026';
  const fmtTop = top ? formatValue(top.value, ind.format, ind.decimals) : '';
  const fmtBottom = bottom ? formatValue(bottom.value, ind.format, ind.decimals) : '';
  const midIdx = Math.floor(data.length / 2);
  const median = data[midIdx];
  const fmtMedian = median ? formatValue(median.value, ind.format, ind.decimals) : '';

  const source = ind.source === 'imf' ? 'IMF World Economic Outlook'
    : ind.source === 'who' ? 'WHO Global Health Observatory'
    : 'World Bank World Development Indicators';

  // Related indicators in same category
  const related = INDICATORS
    .filter(i => i.category === ind.category && i.id !== ind.id)
    .slice(0, 10)
    .map(i => ({ ...i, slug: getSlugForIndicator(i.id) }))
    .filter(i => i.slug);

  // FAQ
  const faqs = [
    {
      q: `Which country has the highest ${ind.label.toLowerCase()} in ${year}?`,
      a: top ? `${top.country} ranks #1 with ${ind.label.toLowerCase()} of ${fmtTop} as of ${year}, based on data from the ${source}.` : '',
    },
    {
      q: `Which country has the lowest ${ind.label.toLowerCase()}?`,
      a: bottom ? `${bottom.country} ranks last (#${data.length}) with ${fmtBottom} as of ${year}.` : '',
    },
    {
      q: `What is the global median for ${ind.label.toLowerCase()}?`,
      a: median ? `The median value is ${fmtMedian} (${median.country}, ranked #${midIdx + 1} out of ${data.length} countries).` : '',
    },
    {
      q: `How many countries report data for ${ind.label.toLowerCase()}?`,
      a: `${data.length} countries have available data for ${ind.label.toLowerCase()}. Data is sourced from the ${source} and updated regularly.`,
    },
    {
      q: `What category does ${ind.label.toLowerCase()} belong to?`,
      a: `${ind.label} is classified under the "${ind.category}" category. Statistics of the World tracks 440+ indicators across 27 categories.`,
    },
  ].filter(f => f.a);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Indicators', item: 'https://statisticsoftheworld.com/indicators' },
          { '@type': 'ListItem', position: 3, name: ind.label, item: `https://statisticsoftheworld.com/indicator/${slug}` },
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
        '@type': 'Dataset',
        name: `${ind.label} — Global Data by Country`,
        description: ind.description || `${ind.label} data for ${data.length} countries.`,
        url: `https://statisticsoftheworld.com/indicator/${slug}`,
        creator: { '@type': 'Organization', name: 'Statistics of the World' },
        temporalCoverage: `${year}`,
        spatialCoverage: { '@type': 'Place', name: 'World' },
        isAccessibleForFree: true,
      },
    ],
  };

  // SEO paragraph
  const top5 = data.slice(0, 5);
  const bottom3 = data.slice(-3).reverse();
  const summaryParagraph = top && bottom ? (
    `As of ${year}, ${top.country} leads globally in ${ind.label.toLowerCase()} at ${fmtTop}, ` +
    `followed by ${top5.slice(1, 4).map(d => d.country).join(', ')}. ` +
    `At the lower end, ${bottom3.map(d => d.country).join(', ')} rank among the lowest. ` +
    `The global median is ${fmtMedian} (${median?.country}). ` +
    `This indicator falls under the "${ind.category}" category and is sourced from the ${source}. ` +
    `Data is available for ${data.length} countries.`
  ) : '';

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="max-w-[1000px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/indicators" className="hover:text-gray-600 transition">Indicators</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{ind.label}</span>
        </nav>

        <h1 className="text-[28px] font-bold mb-1">{ind.label} by Country</h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[13px] px-2 py-0.5 bg-[#f0f0f0] rounded text-[#64748b]">{ind.category}</span>
          <span className="text-[13px] text-[#94a3b8]">Source: {source}</span>
        </div>

        {summaryParagraph && (
          <p className="text-[14px] text-[#475569] mb-6 leading-relaxed max-w-[800px]">
            {summaryParagraph}
          </p>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-[13px] text-gray-400 mb-1">Countries</div>
            <div className="text-[20px] font-bold">{data.length}</div>
          </div>
          {top && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-[13px] text-gray-400 mb-1">Highest</div>
              <div className="text-[16px] font-bold text-green-600">{fmtTop}</div>
              <Link href={getCleanCountryIndicatorUrl(top.countryId, match.id)}} className="text-[13px] text-[#0066cc] hover:underline">{top.country}</Link>
            </div>
          )}
          {bottom && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-[13px] text-gray-400 mb-1">Lowest</div>
              <div className="text-[16px] font-bold text-red-500">{fmtBottom}</div>
              <Link href={getCleanCountryIndicatorUrl(bottom.countryId, match.id)}} className="text-[13px] text-[#0066cc] hover:underline">{bottom.country}</Link>
            </div>
          )}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-[13px] text-gray-400 mb-1">Median</div>
            <div className="text-[16px] font-bold">{fmtMedian}</div>
            {median && <div className="text-[13px] text-gray-400">{median.country}</div>}
          </div>
        </div>

        {/* Rankings table */}
        <h2 className="text-[18px] font-semibold mb-3">All Countries Ranked</h2>
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[13px] text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 w-12">#</th>
                <th className="px-4 py-2.5">Country</th>
                <th className="px-4 py-2.5 text-right">{ind.label}</th>
                <th className="px-4 py-2.5 w-48 hidden md:table-cell"></th>
                <th className="px-4 py-2.5 text-right w-16">Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const maxVal = Math.max(...data.map(d => Math.abs(d.value || 0)));
                const barWidth = maxVal > 0 ? (Math.abs(entry.value || 0) / maxVal) * 100 : 0;
                return (
                  <tr key={entry.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-gray-300 text-[13px]">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link href={getCleanCountryIndicatorUrl(entry.countryId, match.id)}} className="inline-flex items-center gap-2 text-[14px] text-blue-600 hover:text-blue-800">
                        <Flag iso2={entry.iso2} size={20} />
                        {entry.country}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[14px]">
                      {formatValue(entry.value, ind.format, ind.decimals)}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${barWidth}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400 text-[13px]">{entry.year}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[18px] font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="border border-gray-100 rounded-xl" open={i === 0}>
                  <summary className="px-4 py-3 cursor-pointer text-[14px] font-medium hover:bg-gray-50 transition">
                    {faq.q}
                  </summary>
                  <p className="px-4 pb-3 text-[13px] text-[#475569] leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related indicators */}
        {related.length > 0 && (
          <div>
            <h2 className="text-[16px] font-semibold mb-3">Related Indicators in {ind.category}</h2>
            <div className="flex flex-wrap gap-2">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/indicator/${r.slug}`}
                  className="text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-[#64748b]"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
