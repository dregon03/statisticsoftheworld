import Link from 'next/link';
import type { Metadata } from 'next';
import { GLOSSARY_TERMS } from '@/lib/glossary';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Economics Glossary — Key Terms & Definitions',
  description: 'Clear definitions of GDP, inflation, Gini index, PPP, and 30+ economics terms used in global data. Understand the numbers behind the world economy.',
  alternates: { canonical: 'https://statisticsoftheworld.com/glossary' },
  openGraph: {
    title: 'Economics Glossary — Statistics of the World',
    description: 'Definitions of 30+ economics and development terms used in global data.',
  },
};

export default function GlossaryIndex() {
  const categories = [...new Set(GLOSSARY_TERMS.map(t => t.category))];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://statisticsoftheworld.com' },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://statisticsoftheworld.com/glossary' },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      <section className="max-w-[800px] mx-auto px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Glossary</span>
        </nav>

        <h1 className="text-[32px] font-extrabold text-[#0d1b2a] mb-2">Economics Glossary</h1>
        <p className="text-[15px] text-[#64748b] mb-8">
          Clear definitions of key economics, demographics, and development terms used across our data platform.
        </p>

        {categories.map(cat => {
          const terms = GLOSSARY_TERMS.filter(t => t.category === cat);
          return (
            <div key={cat} className="mb-8">
              <h2 className="text-[18px] font-bold text-[#0d1b2a] mb-3">{cat}</h2>
              <div className="space-y-2">
                {terms.map(t => (
                  <Link
                    key={t.slug}
                    href={`/glossary/${t.slug}`}
                    className="block bg-white border border-[#d5dce6] rounded-lg px-4 py-3 hover:border-[#2563eb] hover:shadow-sm transition group"
                  >
                    <div className="text-[15px] font-semibold text-[#0d1b2a] group-hover:text-[#2563eb] transition">{t.term}</div>
                    <div className="text-[13px] text-[#64748b] mt-0.5 line-clamp-1">{t.definition}</div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Footer />
    </main>
  );
}
