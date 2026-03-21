'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { INDICATORS, formatValue } from '@/lib/data';
import Flag from '../Flag';

interface Country {
  id: string;
  iso2: string;
  name: string;
  region: string;
  incomeLevel: string;
  capitalCity: string;
}

interface CountryStats {
  [countryId: string]: {
    gdp?: number;
    population?: number;
    gdpPerCapita?: number;
    lifeExpectancy?: number;
  };
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [stats, setStats] = useState<CountryStats>({});
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterIncome, setFilterIncome] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(({ countries: list, stats: s }) => {
        const sorted = list.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(sorted);
        setStats(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regions = [...new Set(countries.map(c => c.region))].sort();
  const incomeLevels = [...new Set(countries.map(c => c.incomeLevel))].sort();

  const filtered = countries.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchRegion = !filterRegion || c.region === filterRegion;
    const matchIncome = !filterIncome || c.incomeLevel === filterIncome;
    return matchSearch && matchRegion && matchIncome;
  });

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-192.png" alt="SOTW" width={28} height={28} className="rounded" />
            <span className="font-semibold">Statistics of the World</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/countries" className="text-gray-900 font-medium">Countries</Link>
            <Link href="/rankings" className="hover:text-gray-900 transition">Indicators</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">All Countries</h1>
        <p className="text-gray-500 mb-8">{countries.length} countries and territories with {INDICATORS.length} indicators each.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-600 transition w-64"
          />
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterIncome}
            onChange={(e) => setFilterIncome(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none cursor-pointer"
          >
            <option value="">All Income Levels</option>
            {incomeLevels.map(il => <option key={il} value={il}>{il}</option>)}
          </select>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >Grid</button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg text-sm transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >Table</button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">{filtered.length} countries shown</div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading countries...</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => {
              const s = stats[c.id] || {};
              return (
                <Link
                  key={c.id}
                  href={`/country/${c.id}`}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-300 hover:bg-gray-100/50 transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-blue-600 transition flex items-center gap-2">
                      <Flag iso2={c.iso2} size={24} />
                      {c.name}
                    </h3>
                      <div className="text-xs text-gray-500">{c.capitalCity || 'N/A'}</div>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{c.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">GDP</div>
                      <div className="font-mono text-blue-600">{s.gdp ? formatValue(s.gdp, 'currency') : '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Population</div>
                      <div className="font-mono text-gray-900">{s.population ? formatValue(s.population, 'number') : '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">GDP/Capita</div>
                      <div className="font-mono">{s.gdpPerCapita ? formatValue(s.gdpPerCapita, 'currency') : '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Life Exp.</div>
                      <div className="font-mono">{s.lifeExpectancy ? `${s.lifeExpectancy.toFixed(1)}y` : '-'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{c.region}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{c.incomeLevel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Income Level</th>
                  <th className="px-4 py-3 text-right">GDP</th>
                  <th className="px-4 py-3 text-right">Population</th>
                  <th className="px-4 py-3 text-right">GDP/Cap</th>
                  <th className="px-4 py-3 text-right">Life Exp.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const s = stats[c.id] || {};
                  return (
                    <tr key={c.id} className="border-b border-gray-100/50 hover:bg-gray-50 transition">
                      <td className="px-4 py-2.5">
                        <Link href={`/country/${c.id}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm transition">
                          <Flag iso2={c.iso2} size={20} />
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{c.region}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">{c.incomeLevel}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">{s.gdp ? formatValue(s.gdp, 'currency') : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">{s.population ? formatValue(s.population, 'number') : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">{s.gdpPerCapita ? formatValue(s.gdpPerCapita, 'currency') : '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">{s.lifeExpectancy ? `${s.lifeExpectancy.toFixed(1)}y` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-500">
          <p>Data sourced from World Bank, WHO, UNESCO, ILO, FAO, and international organizations.</p>
          <p className="mt-1">Statistics of the World 2026. {INDICATORS.length} indicators. {countries.length} countries.</p>
        </div>
      </footer>
    </main>
  );
}
