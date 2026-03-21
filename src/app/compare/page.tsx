'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { INDICATORS, CATEGORIES, formatValue, type Indicator } from '@/lib/data';

interface CountryOption {
  id: string;
  name: string;
  region: string;
}

interface ComparisonData {
  [indicatorId: string]: {
    [countryId: string]: { value: number | null; year: string };
  };
}

export default function ComparePage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selected, setSelected] = useState<string[]>(['USA', 'CHN']);
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [data, setData] = useState<ComparisonData>({});
  const [loading, setLoading] = useState(false);
  const [addingMore, setAddingMore] = useState(false);
  const [searchMore, setSearchMore] = useState('');

  // Fetch country list
  useEffect(() => {
    fetch('https://api.worldbank.org/v2/country?format=json&per_page=300')
      .then(r => r.json())
      .then(d => {
        const list = d[1]
          .filter((c: any) => c.region.id !== 'NA')
          .map((c: any) => ({ id: c.id, name: c.name, region: c.region.value }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(list);
      });
  }, []);

  // Fetch comparison data when selected countries change
  useEffect(() => {
    if (selected.length < 2) return;
    setLoading(true);

    const fetchData = async () => {
      const result: ComparisonData = {};

      await Promise.all(
        INDICATORS.map(async (ind) => {
          result[ind.id] = {};
          await Promise.all(
            selected.map(async (countryId) => {
              try {
                const res = await fetch(
                  `https://api.worldbank.org/v2/country/${countryId}/indicator/${ind.id}?format=json&mrv=1`
                );
                const d = await res.json();
                if (d[1] && d[1].length > 0) {
                  result[ind.id][countryId] = { value: d[1][0].value, year: d[1][0].date };
                }
              } catch {}
            })
          );
        })
      );

      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [selected]);

  const addCountry = (id: string) => {
    if (!selected.includes(id) && selected.length < 5) {
      setSelected([...selected, id]);
    }
    setAddingMore(false);
    setSearchMore('');
  };

  const removeCountry = (id: string) => {
    if (selected.length > 2) {
      setSelected(selected.filter(s => s !== id));
    }
  };

  const getCountryName = (id: string) => countries.find(c => c.id === id)?.name || id;

  const categories = CATEGORIES;

  const getHighlight = (ind: Indicator, countryId: string): string => {
    const values = selected
      .map(id => data[ind.id]?.[id]?.value)
      .filter(v => v !== null && v !== undefined) as number[];

    if (values.length < 2) return '';
    const val = data[ind.id]?.[countryId]?.value;
    if (val === null || val === undefined) return '';

    const isHigherBetter = !ind.label.includes('Mortality') && !ind.label.includes('Poverty') &&
      !ind.label.includes('Unemployment') && !ind.label.includes('Debt') && !ind.label.includes('CO₂');

    const best = isHigherBetter ? Math.max(...values) : Math.min(...values);
    if (val === best) return isHigherBetter ? 'text-green-400' : 'text-green-400';
    return '';
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-sm">SW</div>
            <span className="font-semibold text-lg">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-zinc-400">
            <Link href="/countries" className="hover:text-white transition">Countries</Link>
            <Link href="/compare" className="text-white font-medium">Compare</Link>
            <Link href="/rankings" className="hover:text-white transition">Rankings</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Compare Countries</h1>
        <p className="text-zinc-400 mb-8">Side-by-side comparison of key statistics across countries.</p>

        {/* Country selectors */}
        <div className="flex flex-wrap gap-3 mb-8">
          {selected.map((id, idx) => (
            <div key={id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2">
              <select
                value={id}
                onChange={(e) => {
                  const newSelected = [...selected];
                  newSelected[idx] = e.target.value;
                  setSelected(newSelected);
                }}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                ))}
              </select>
              {selected.length > 2 && (
                <button onClick={() => removeCountry(id)} className="text-zinc-500 hover:text-red-400 text-xs">✕</button>
              )}
            </div>
          ))}
          {selected.length < 5 && (
            <div className="relative">
              {addingMore ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchMore}
                    onChange={(e) => setSearchMore(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm outline-none w-48"
                    autoFocus
                  />
                  {searchMore && (
                    <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg max-h-48 overflow-y-auto w-48 z-10">
                      {countries
                        .filter(c => c.name.toLowerCase().includes(searchMore.toLowerCase()) && !selected.includes(c.id))
                        .slice(0, 8)
                        .map(c => (
                          <button
                            key={c.id}
                            onClick={() => addCountry(c.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 transition"
                          >
                            {c.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAddingMore(true)}
                  className="bg-zinc-900 border border-dashed border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition"
                >
                  + Add Country
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm text-zinc-500">Quick compare:</span>
          <button onClick={() => setSelected(['USA', 'CHN'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">US vs China</button>
          <button onClick={() => setSelected(['USA', 'CHN', 'IND', 'JPN', 'DEU'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">Top 5 Economies</button>
          <button onClick={() => setSelected(['CAN', 'USA'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">Canada vs US</button>
          <button onClick={() => setSelected(['GBR', 'FRA', 'DEU'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">UK vs France vs Germany</button>
          <button onClick={() => setSelected(['BRA', 'IND', 'CHN', 'ZAF'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">BRICS</button>
          <button onClick={() => setSelected(['KOR', 'JPN'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">Korea vs Japan</button>
          <button onClick={() => setSelected(['NOR', 'SWE', 'DNK', 'FIN'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">Nordics</button>
          <button onClick={() => setSelected(['SGP', 'HKG', 'KOR', 'TWN'])} className="text-xs bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700 transition">Asian Tigers</button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Loading data from World Bank...</div>
        ) : (
          <div className="space-y-10">
            {categories.map(category => {
              const categoryIndicators = INDICATORS.filter(ind => ind.category === category);
              return (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-4 text-blue-400">{category}</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-zinc-500 border-b border-zinc-800">
                          <th className="px-6 py-3 w-1/4">Indicator</th>
                          {selected.map(id => (
                            <th key={id} className="px-6 py-3 text-right">{getCountryName(id)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categoryIndicators.map(ind => (
                          <tr key={ind.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition">
                            <td className="px-6 py-3 text-sm text-zinc-300">{ind.label}</td>
                            {selected.map(id => {
                              const d = data[ind.id]?.[id];
                              return (
                                <td key={id} className={`px-6 py-3 text-right font-mono text-sm ${getHighlight(ind, id)}`}>
                                  {d ? (
                                    <div>
                                      <div>{formatValue(d.value, ind.format, ind.decimals)}</div>
                                      <div className="text-xs text-zinc-600">{d.year}</div>
                                    </div>
                                  ) : (
                                    <span className="text-zinc-600">N/A</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-zinc-500">
          <p>Data sourced from World Bank, United Nations, and international organizations.</p>
          <p className="mt-1">Statistics of the World 2026. Built for clarity.</p>
        </div>
      </footer>
    </main>
  );
}
