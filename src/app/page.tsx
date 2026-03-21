import Link from 'next/link';
import { getCountries, getTop10AllIndicators, formatValue, INDICATORS, CATEGORIES } from '@/lib/data';
import CategorySection from './CategorySection';

export default async function Home() {
  const [countries, allTop10] = await Promise.all([
    getCountries(),
    getTop10AllIndicators(),
  ]);

  // Group indicators by category, only include ones with data
  const categoriesWithData = CATEGORIES.map(category => {
    const indicators = INDICATORS
      .filter(ind => ind.category === category && allTop10[ind.id]?.length > 0)
      .map(ind => ({
        ...ind,
        data: allTop10[ind.id] || [],
      }));
    return { category, indicators };
  }).filter(c => c.indicators.length > 0);

  const totalIndicatorsWithData = categoriesWithData.reduce((sum, c) => sum + c.indicators.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Statistics of the World',
    url: 'https://statisticsoftheworld.com',
    description: `${countries.length} countries. ${INDICATORS.length} indicators. Free global statistics from IMF, World Bank, WHO, and UNESCO.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://statisticsoftheworld.com/countries?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">SW</div>
            <span className="font-semibold">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-gray-900 transition">Countries</Link>
            <Link href="/rankings" className="hover:text-gray-900 transition">Indicators</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          The world&apos;s data,
          <br />
          <span className="text-blue-600">in one place.</span>
        </h1>
        <p className="text-lg text-gray-500 mt-4 max-w-xl">
          {countries.length} countries. {totalIndicatorsWithData} indicators. Sourced from IMF, World Bank, WHO, and UNESCO.
        </p>
        <div className="flex gap-3 mt-8">
          <Link href="/countries" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            Explore Countries
          </Link>
          <Link href="/rankings" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
            Browse Indicators
          </Link>
        </div>
      </section>

      {/* Category jump nav */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-2">
          {categoriesWithData.map(({ category, indicators }) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
            >
              {category} <span className="text-gray-300">({indicators.length})</span>
            </a>
          ))}
        </div>
      </section>

      {/* All indicators by category — top 2 shown, expandable */}
      {categoriesWithData.map(({ category, indicators }) => (
        <CategorySection key={category} category={category} indicators={indicators} />
      ))}

      {/* Browse countries */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Browse Countries</h2>
          <Link href="/countries" className="text-xs text-gray-400 hover:text-gray-600 transition">View all {countries.length}</Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {countries
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 40)
            .map(c => (
              <Link
                key={c.id}
                href={`/country/${c.id}`}
                className="px-2.5 py-1.5 border border-gray-100 rounded text-xs hover:bg-gray-50 hover:border-gray-200 transition truncate text-center"
              >
                {c.name}
              </Link>
            ))}
          <Link
            href="/countries"
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-blue-600 hover:bg-gray-100 transition text-center"
          >
            +{countries.length - 40} more
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">
          <p>Data from IMF World Economic Outlook, World Bank, WHO, UNESCO, ILO, and FAO.</p>
          <p className="mt-1">Statistics of the World 2026</p>
        </div>
      </footer>
    </main>
  );
}
