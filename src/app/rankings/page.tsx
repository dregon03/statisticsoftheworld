'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INDICATORS, CATEGORIES, formatValue, MULTI_SOURCE } from '@/lib/data';
import Flag from '../Flag';

interface RankingEntry {
  country: string;
  countryId: string;
  iso2: string;
  value: number | null;
  year: string;
}

interface MultiSourceData {
  sources: { id: string; org: string }[];
  countries: { countryId: string; country: string; iso2: string; values: Record<string, { value: number | null; year: string }> }[];
}

export default function IndicatorsPage() {
  return (
    <Suspense>
      <IndicatorsContent />
    </Suspense>
  );
}

function IndicatorsContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  const initialIndicator = (initialId && INDICATORS.find(i => i.id === initialId)) || INDICATORS[0];
  const [selectedIndicator, setSelectedIndicator] = useState(initialIndicator);
  const [data, setData] = useState<RankingEntry[]>([]);
  const [multiData, setMultiData] = useState<MultiSourceData | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);
  const [searchIndicator, setSearchIndicator] = useState('');

  const hasMultiSource = !!MULTI_SOURCE[selectedIndicator.id];

  useEffect(() => {
    setLoading(true);
    setMultiData(null);
    fetch(`/api/indicator?id=${encodeURIComponent(selectedIndicator.id)}`)
      .then(r => r.json())
      .then(entries => {
        setData(entries);
        setLoading(false);
      })
      .catch(() => { setData([]); setLoading(false); });

    // Also fetch multi-source data if available
    if (MULTI_SOURCE[selectedIndicator.id]) {
      fetch(`/api/multisource?id=${encodeURIComponent(selectedIndicator.id)}`)
        .then(r => r.json())
        .then(ms => setMultiData(ms))
        .catch(() => {});
    }
  }, [selectedIndicator]);

  const sorted = sortAsc ? [...data].reverse() : data;
  const maxValue = data.length > 0 ? Math.max(...data.map(d => Math.abs(d.value || 0))) : 1;

  const filteredIndicators = INDICATORS.filter(ind => {
    if (!searchIndicator) return true;
    return ind.label.toLowerCase().includes(searchIndicator.toLowerCase()) ||
           ind.category.toLowerCase().includes(searchIndicator.toLowerCase());
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">SW</div>
            <span className="font-semibold">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="hover:text-gray-900 transition">Countries</Link>
            <Link href="/rankings" className="text-gray-900 font-medium">Indicators</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-1">Indicators</h1>
        <p className="text-gray-400 mb-8 text-sm">{INDICATORS.length} indicators across {CATEGORIES.length} categories</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <input
              type="text"
              placeholder="Search indicators..."
              value={searchIndicator}
              onChange={(e) => setSearchIndicator(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:border-blue-500 transition"
            />
            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
              {CATEGORIES.map(category => {
                const categoryInds = filteredIndicators.filter(ind => ind.category === category);
                if (categoryInds.length === 0) return null;
                return (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                      {category}
                    </div>
                    {categoryInds.map(ind => (
                      <button
                        key={ind.id}
                        onClick={() => setSelectedIndicator(ind)}
                        className={`w-full text-left px-4 py-2 text-sm transition ${
                          selectedIndicator.id === ind.id
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data table */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedIndicator.label}</h2>
                <div className="text-sm text-gray-400">{selectedIndicator.category} &middot; {data.length} countries</div>
              </div>
              <div className="flex items-center gap-2">
                {hasMultiSource && multiData && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewMode('single')}
                      className={`px-3 py-2 rounded-lg text-xs transition ${viewMode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >Single source</button>
                    <button
                      onClick={() => setViewMode('multi')}
                      className={`px-3 py-2 rounded-lg text-xs transition ${viewMode === 'multi' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >Compare sources</button>
                  </div>
                )}
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                >
                  {sortAsc ? 'Lowest first' : 'Highest first'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading data...</div>
            ) : data.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No data available for this indicator.</div>
            ) : viewMode === 'multi' && multiData ? (
              /* Wikipedia-style multi-source table */
              <div className="border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-2.5 w-14">Rank</th>
                      <th className="px-4 py-2.5">Country</th>
                      {multiData.sources.map(src => (
                        <th key={src.id} className="px-4 py-2.5 text-right">
                          <div className="font-semibold text-gray-600">{src.org}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sortAsc ? [...multiData.countries].reverse() : multiData.countries).map((row, i) => {
                      const rank = sortAsc ? multiData.countries.length - i : i + 1;
                      return (
                        <tr key={row.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-2 text-gray-300 text-sm">{rank}</td>
                          <td className="px-4 py-2">
                            <Link href={`/country/${row.countryId}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm">
                              <Flag iso2={row.iso2} size={24} />
                              {row.country}
                            </Link>
                          </td>
                          {multiData.sources.map(src => {
                            const d = row.values[src.id];
                            return (
                              <td key={src.id} className="px-4 py-2 text-right font-mono text-sm">
                                {d ? (
                                  <span>
                                    {formatValue(d.value, selectedIndicator.format, selectedIndicator.decimals)}
                                    <span className="text-gray-300 text-xs ml-1">{d.year}</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Single source table */
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-2.5 w-14">Rank</th>
                      <th className="px-4 py-2.5">Country</th>
                      <th className="px-4 py-2.5 text-right w-36">Value</th>
                      <th className="px-4 py-2.5 w-56 hidden md:table-cell"></th>
                      <th className="px-4 py-2.5 text-right w-14">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((entry, i) => {
                      const barWidth = maxValue > 0 ? (Math.abs(entry.value || 0) / maxValue) * 100 : 0;
                      const rank = sortAsc ? data.length - i : i + 1;
                      return (
                        <tr key={entry.countryId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-2 text-gray-300 text-sm">{rank}</td>
                          <td className="px-4 py-2">
                            <Link href={`/country/${entry.countryId}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm">
                              <Flag iso2={entry.iso2} size={24} />
                              {entry.country}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-sm">
                            {formatValue(entry.value, selectedIndicator.format, selectedIndicator.decimals)}
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell">
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right text-gray-400 text-xs">{entry.year}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-gray-400">
          <p>Data from IMF, World Bank, WHO, UNESCO, ILO, and FAO.</p>
          <p className="mt-1">Statistics of the World 2026</p>
        </div>
      </footer>
    </main>
  );
}
