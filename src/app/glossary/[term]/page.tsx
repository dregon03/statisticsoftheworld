import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GLOSSARY_TERMS, getGlossaryTerm } from '@/lib/glossary';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type Props = { params: Promise<{ term: string }> };

export async function generateStaticParams() {
  return GLOSSARY_TERMS.map(t => ({ term: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params;
  const t = getGlossaryTerm(slug);
  if (!t) return { title: 'Not Found' };

  return {
    title: `What is ${t.term}? — Definition & Explanation`,
    description: `${t.definition} Learn how ${t.term.toLowerCase()} is measured, what it means for economies, and see current global data.`,
    alternates: { canonical: `https://statisticsoftheworld.com/glossary/${slug}` },
    openGraph: {
      title: `What is ${t.term}?`,
      description: t.definition,
      siteName: 'Statistics of the World',
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params;
  const t = getGlossaryTerm(slug);
  if (!t) notFound();

  const relatedTerms = t.related
    .map(s => GLOSSARY_TERMS.find(g => g.slug === s))
    .filter(Boolean) as typeof GLOSSARY_TERMS;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        name: t.term,
        description: t.definition,
        url: `https://statisticsoftheworld.com/glossary/${slug}`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Economics Glossary',
          url: 'https://statisticsoftheworld.com/glossary',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://statisticsoftheworld.com/glossary' },
          { '@type': 'ListItem', position: 3, name: t.term },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${t.term}?`,
            acceptedAnswer: { '@type': 'Answer', text: t.definition },
          },
          ...(t.rankingSlug ? [{
            '@type': 'Question',
            name: `Which country has the highest ${t.term.toLowerCase()}?`,
            acceptedAnswer: { '@type': 'Answer', text: `See the full ${t.term.toLowerCase()} rankings on our ranking page for up-to-date data across 218 countries.` },
          }] : []),
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <article className="max-w-[800px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/glossary" className="hover:text-gray-600 transition">Glossary</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{t.term}</span>
        </nav>

        {/* Term header */}
        <div className="mb-1 text-[12px] text-[#2563eb] font-semibold uppercase tracking-wider">{t.category}</div>
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0d1b2a] mb-4">{t.term}</h1>

        {/* Definition box — optimized for featured snippet */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5 mb-6">
          <div className="text-[11px] text-[#2563eb] font-bold uppercase tracking-wider mb-2">Definition</div>
          <p className="text-[16px] text-[#1e3a5f] leading-relaxed font-medium">{t.definition}</p>
        </div>

        {/* Explanation */}
        <div className="prose prose-slate max-w-none mb-8">
          <h2 className="text-[20px] font-bold text-[#0d1b2a] mb-3">Explanation</h2>
          <p className="text-[15px] text-[#475569] leading-[1.8]">{t.explanation}</p>
        </div>

        {/* Link to ranking */}
        {t.rankingSlug && (
          <div className="bg-white border border-[#d5dce6] rounded-xl p-5 mb-8">
            <h2 className="text-[16px] font-bold text-[#0d1b2a] mb-2">See Current Data</h2>
            <p className="text-[14px] text-[#64748b] mb-3">
              Explore {t.term.toLowerCase()} data for all 218 countries with interactive charts and historical trends.
            </p>
            <Link
              href={`/ranking/${t.rankingSlug}`}
              className="inline-block px-4 py-2 bg-[#2563eb] text-white text-[14px] font-medium rounded-lg hover:bg-[#1d4ed8] transition"
            >
              View {t.term} Rankings →
            </Link>
          </div>
        )}

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[16px] font-bold text-[#0d1b2a] mb-3">Related Terms</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map(rt => (
                <Link
                  key={rt.slug}
                  href={`/glossary/${rt.slug}`}
                  className="px-3 py-1.5 bg-white border border-[#d5dce6] rounded-lg text-[13px] text-[#475569] hover:border-[#2563eb] hover:text-[#2563eb] transition"
                >
                  {rt.term}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All terms link */}
        <div className="text-center pt-4 border-t border-[#e5e7eb]">
          <Link href="/glossary" className="text-[14px] text-[#2563eb] hover:underline">
            ← View all glossary terms
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
