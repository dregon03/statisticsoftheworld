'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatValue } from '@/lib/data';

interface IndicatorData {
  id: string;
  label: string;
  format: string;
  decimals?: number;
  data: { country: string; countryId: string; value: number; year: string }[];
}

export default function CategorySection({
  category,
  indicators,
}: {
  category: string;
  indicators: IndicatorData[];
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? indicators : indicators.slice(0, 2);
  const rest = indicators.slice(2);

  return (
    <section
      id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
      className="max-w-6xl mx-auto px-6 pb-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">{category}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {indicators.length} indicators
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shown.map((ind) => (
          <div key={ind.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">{ind.label}</h3>
              <Link href={`/rankings?id=${encodeURIComponent(ind.id)}`} className="text-xs text-gray-400 hover:text-gray-600 transition">
                All countries &rarr;
              </Link>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {ind.data.map((d, i) => (
                <Link
                  key={d.countryId}
                  href={`/country/${d.countryId}`}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                >
                  <span className="text-gray-300 text-xs w-5">{i + 1}</span>
                  <span className="flex-1 text-sm">{d.country}</span>
                  <span className="text-sm font-mono text-gray-500">
                    {formatValue(d.value, ind.format, ind.decimals)}
                  </span>
                  <span className="text-xs text-gray-300 ml-2 w-8 text-right">{d.year}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {rest.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 px-4 py-2 text-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition"
        >
          {expanded ? 'Show less' : `+ ${rest.length} more indicators`}
        </button>
      )}
    </section>
  );
}
