'use client';

import CategorySection from './CategorySection';

interface CategoryData {
  category: string;
  indicators: {
    id: string;
    label: string;
    format: string;
    decimals?: number;
    data: { country: string; countryId: string; iso2: string; value: number; year: string }[];
  }[];
  featuredCount: number;
}

export default function IndicatorsTab({ categories }: { categories: CategoryData[] }) {
  if (categories.length === 0) {
    return <div className="text-center py-20 text-[#999] text-[13px]">Loading indicators...</div>;
  }

  return (
    <>
      {/* Category nav */}
      <nav className="max-w-[1200px] mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] border-b border-[#f0f0f0]">
        {categories.map(({ category }) => (
          <a
            key={category}
            href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="text-[#999] hover:text-[#333] transition whitespace-nowrap"
          >
            {category}
          </a>
        ))}
      </nav>

      {/* Category sections */}
      {categories.map(({ category, indicators, featuredCount }) => (
        <CategorySection key={category} category={category} indicators={indicators} featuredCount={featuredCount} />
      ))}
    </>
  );
}
