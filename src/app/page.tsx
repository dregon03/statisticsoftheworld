'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { INDICATORS, formatValue } from '@/lib/data';
import Flag from './Flag';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

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
    inflation?: number;
    unemployment?: number;
    debtToGdp?: number;
    gdpGrowth?: number;
    tradeOpenness?: number;
    fdi?: number;
  };
}

type SortKey = 'name' | 'gdp' | 'population' | 'gdpPerCapita' | 'gdpGrowth' | 'inflation' | 'unemployment' | 'debtToGdp' | 'lifeExpectancy' | 'tradeOpenness';

// higherIsBetter: true = high values are good (blue), false = high values are bad (red)
const COLUMNS: { key: SortKey; label: string; short: string; format: (v: number | undefined) => string; hideOnMobile?: boolean; outlier?: boolean; higherIsBetter?: boolean }[] = [
  { key: 'gdp', label: 'GDP (USD)', short: 'GDP', format: v => v ? formatValue(v, 'currency') : '-' },
  { key: 'population', label: 'Population', short: 'Pop.', format: v => v ? formatValue(v, 'number') : '-' },
  { key: 'gdpPerCapita', label: 'GDP/Capita', short: 'GDP/Cap', format: v => v ? formatValue(v, 'currency') : '-' },
  { key: 'gdpGrowth', label: 'GDP Growth', short: 'Growth', format: v => v != null ? `${v.toFixed(1)}%` : '-', outlier: true, higherIsBetter: true },
  { key: 'inflation', label: 'Inflation', short: 'CPI', format: v => v != null ? `${v.toFixed(1)}%` : '-', outlier: true, higherIsBetter: false },
  { key: 'unemployment', label: 'Unemployment', short: 'Unemp.', format: v => v != null ? `${v.toFixed(1)}%` : '-', hideOnMobile: true, outlier: true, higherIsBetter: false },
  { key: 'debtToGdp', label: 'Debt/GDP', short: 'Debt', format: v => v != null ? `${v.toFixed(1)}%` : '-', hideOnMobile: true, outlier: true, higherIsBetter: false },
  { key: 'lifeExpectancy', label: 'Life Exp.', short: 'Life', format: v => v != null ? `${v.toFixed(1)}` : '-', hideOnMobile: true, outlier: true, higherIsBetter: true },
  { key: 'tradeOpenness', label: 'Trade/GDP', short: 'Trade', format: v => v != null ? `${v.toFixed(1)}%` : '-', hideOnMobile: true, outlier: true, higherIsBetter: true },
];

function computePercentiles(values: number[]): { p10: number; p90: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)] ?? -Infinity;
  const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? Infinity;
  return { p10, p90 };
}

export default function Home() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [stats, setStats] = useState<CountryStats>({});
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('gdp');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(({ countries: list, stats: s }) => {
        setCountries(list);
        setStats(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regions = useMemo(() => [...new Set(countries.map(c => c.region))].sort(), [countries]);

  // Compute outlier thresholds for rate columns
  const outlierThresholds = useMemo(() => {
    const thresholds: Record<string, { p10: number; p90: number }> = {};
    for (const col of COLUMNS) {
      if (!col.outlier) continue;
      const values = Object.values(stats)
        .map(s => (s as any)[col.key] as number | undefined)
        .filter((v): v is number => v != null && isFinite(v));
      if (values.length > 10) {
        thresholds[col.key] = computePercentiles(values);
      }
    }
    return thresholds;
  }, [stats]);

  const getOutlierClass = (col: typeof COLUMNS[0], value: number | undefined): string => {
    if (!col.outlier || value == null || !isFinite(value)) return '';
    const t = outlierThresholds[col.key];
    if (!t) return '';
    if (col.higherIsBetter) {
      if (value >= t.p90) return 'text-[#0066cc] font-bold'; // good: high
      if (value <= t.p10) return 'text-[#cc3333] font-bold'; // bad: low
    } else {
      if (value <= t.p10) return 'text-[#0066cc] font-bold'; // good: low
      if (value >= t.p90) return 'text-[#cc3333] font-bold'; // bad: high
    }
    return '';
  };

  const filtered = useMemo(() => {
    let list = countries.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
      const matchRegion = !filterRegion || c.region === filterRegion;
      return matchSearch && matchRegion;
    });

    list.sort((a, b) => {
      if (sortKey === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      const aVal = (stats[a.id] as any)?.[sortKey] ?? -Infinity;
      const bVal = (stats[b.id] as any)?.[sortKey] ?? -Infinity;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [countries, stats, search, filterRegion, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u2191' : ' \u2193';
  };

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      {/* Hero */}
      <section className="border-b border-[#e8e8e8]">
        <div className="max-w-[1400px] mx-auto px-4 py-8 text-center">
          <h1 className="text-[26px] font-bold mb-2">Statistics of the World</h1>
          <p className="text-[13px] text-[#999] mb-5">{countries.length} countries. {INDICATORS.length} indicators. Free global data from IMF, World Bank, FRED, and more.</p>
          <div className="flex flex-wrap justify-center gap-2 text-[12px]">
            <Link href="/indicators" className="px-3 py-1.5 bg-[#0066cc] text-white rounded-lg hover:bg-[#0055aa] transition">Indicators</Link>
            <Link href="/compare" className="px-3 py-1.5 border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">Compare</Link>
            <Link href="/map" className="px-3 py-1.5 border border-[#e8e8e8] rounded-lg hover:bg-[#f5f7fa] transition">Map</Link>
          </div>
        </div>
      </section>

      {/* Countries table */}
      <section className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc] transition w-56"
          />
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span className="text-[12px] text-[#999] self-center ml-auto">{filtered.length} countries</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#999] text-[13px]">Loading countries...</div>
        ) : (
          <div className="border border-[#e8e8e8] rounded-xl overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e8e8e8] text-[11px] text-[#999] uppercase tracking-wider">
                  <th className="px-3 py-2.5 text-left font-medium sticky left-0 bg-[#f8f9fa] z-10 min-w-[180px]">
                    <button onClick={() => handleSort('name')} className="hover:text-[#333] transition">
                      Country{sortIcon('name')}
                    </button>
                  </th>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2.5 text-right font-medium whitespace-nowrap ${col.hideOnMobile ? 'hidden lg:table-cell' : ''}`}
                    >
                      <button onClick={() => handleSort(col.key)} className="hover:text-[#333] transition">
                        <span className="hidden md:inline">{col.label}</span>
                        <span className="md:hidden">{col.short}</span>
                        {sortIcon(col.key)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const s = stats[c.id] || {};
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition cursor-pointer ${i % 2 === 0 ? '' : 'bg-[#fafbfc]'}`}
                      onClick={() => window.location.href = `/country/${c.id}`}
                    >
                      <td className="px-3 py-2 sticky left-0 bg-inherit z-10">
                        <Link href={`/country/${c.id}`} className="inline-flex items-center gap-2 hover:text-[#0066cc] transition font-medium" onClick={e => e.stopPropagation()}>
                          <Flag iso2={c.iso2} size={18} />
                          {c.name}
                        </Link>
                      </td>
                      {COLUMNS.map(col => {
                        const val = (s as any)[col.key] as number | undefined;
                        const outlierCls = getOutlierClass(col, val);
                        return (
                          <td
                            key={col.key}
                            className={`px-3 py-2 text-right font-mono text-[12px] ${outlierCls || 'text-[#555]'} ${col.hideOnMobile ? 'hidden lg:table-cell' : ''}`}
                          >
                            {col.format(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
