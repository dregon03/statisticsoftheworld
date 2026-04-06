'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatValue } from '@/lib/data';
import Flag from '@/app/Flag';
import ExportButton from '@/components/ExportButton';
import Sparkline from '@/components/Sparkline';

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

const SORT_KEY_TO_INDICATOR: Record<string, string> = {
  gdp: 'IMF.NGDPD', population: 'SP.POP.TOTL', gdpPerCapita: 'IMF.NGDPDPC',
  gdpGrowth: 'IMF.NGDP_RPCH', inflation: 'IMF.PCPIPCH', unemployment: 'IMF.LUR',
  debtToGdp: 'IMF.GGXWDG_NGDP', lifeExpectancy: 'SP.DYN.LE00.IN', tradeOpenness: 'NE.TRD.GNFS.ZS',
};

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
  return { p10: sorted[Math.floor(sorted.length * 0.1)] ?? -Infinity, p90: sorted[Math.floor(sorted.length * 0.9)] ?? Infinity };
}

export default function HomeTable({ countries, stats }: { countries: Country[]; stats: CountryStats }) {
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('gdp');
  const [sortAsc, setSortAsc] = useState(false);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [sparklineKey, setSparklineKey] = useState<string>('');

  const fetchSparklines = useCallback((key: string) => {
    const indicatorId = SORT_KEY_TO_INDICATOR[key];
    if (!indicatorId || key === 'name') { setSparklines({}); setSparklineKey(''); return; }
    if (key === sparklineKey) return;
    fetch(`/api/sparklines?indicator=${encodeURIComponent(indicatorId)}`)
      .then(r => r.json())
      .then(data => { setSparklines(data); setSparklineKey(key); })
      .catch(() => {});
  }, [sparklineKey]);

  useEffect(() => { fetchSparklines(sortKey); }, [sortKey, fetchSparklines]);

  const regions = useMemo(() => [...new Set(countries.map(c => c.region))].sort(), [countries]);

  const outlierThresholds = useMemo(() => {
    const thresholds: Record<string, { p10: number; p90: number }> = {};
    for (const col of COLUMNS) {
      if (!col.outlier) continue;
      const values = Object.values(stats)
        .map(s => (s as any)[col.key] as number | undefined)
        .filter((v): v is number => v != null && isFinite(v));
      if (values.length > 10) thresholds[col.key] = computePercentiles(values);
    }
    return thresholds;
  }, [stats]);

  const getOutlierClass = (col: typeof COLUMNS[0], value: number | undefined): string => {
    if (!col.outlier || value == null || !isFinite(value)) return '';
    const t = outlierThresholds[col.key];
    if (!t) return '';
    if (col.higherIsBetter) {
      if (value >= t.p90) return 'text-[#0066cc] font-bold';
      if (value <= t.p10) return 'text-[#cc3333] font-bold';
    } else {
      if (value <= t.p10) return 'text-[#0066cc] font-bold';
      if (value >= t.p90) return 'text-[#cc3333] font-bold';
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
      if (sortKey === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const aVal = (stats[a.id] as any)?.[sortKey] ?? -Infinity;
      const bVal = (stats[b.id] as any)?.[sortKey] ?? -Infinity;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [countries, stats, search, filterRegion, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'name'); }
  };

  const sortIcon = (key: SortKey) => sortKey !== key ? '' : sortAsc ? ' ↑' : ' ↓';

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-white border border-[#d5dce6] rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#0066cc] transition w-56"
        />
        <select
          value={filterRegion}
          onChange={e => setFilterRegion(e.target.value)}
          className="bg-white border border-[#d5dce6] rounded-lg px-3 py-2 text-[14px] outline-none cursor-pointer"
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-[15px] text-[#64748b] self-center ml-auto flex items-center gap-3">
          {filtered.length} countries
          <ExportButton
            filename={`sotw-countries-${new Date().toISOString().slice(0, 10)}`}
            getData={() => ({
              headers: ['Country', 'Code', ...COLUMNS.map(c => c.label)],
              rows: filtered.map(c => {
                const s = stats[c.id] || {};
                return [c.name, c.id, ...COLUMNS.map(col => (s as any)[col.key] ?? null)];
              }),
            })}
          />
        </span>
      </div>

      <div className="bg-white border border-[#d5dce6] rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#f4f6f9] border-b border-[#d5dce6] text-[14px] text-[#64748b] uppercase tracking-wider">
              <th className="px-3 py-3 text-left font-semibold sticky left-0 bg-[#f4f6f9] z-10 min-w-[180px]">
                <button onClick={() => handleSort('name')} className="hover:text-[#0d1b2a] transition">
                  Country{sortIcon('name')}
                </button>
              </th>
              {sortKey !== 'name' && (
                <th className="px-1 py-3 text-center font-semibold hidden md:table-cell w-[70px]">Trend</th>
              )}
              {COLUMNS.map(col => (
                <th key={col.key} className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${col.hideOnMobile ? 'hidden lg:table-cell' : ''}`}>
                  <button onClick={() => handleSort(col.key)} className="hover:text-[#0d1b2a] transition">
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
                  className={`border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfd]'}`}
                  onClick={() => window.location.href = `/country/${c.id}`}
                >
                  <td className="px-3 py-2.5 sticky left-0 bg-inherit z-10">
                    <Link href={`/country/${c.id}`} className="inline-flex items-center gap-2 hover:text-[#0066cc] transition font-medium text-[#0d1b2a]" onClick={e => e.stopPropagation()}>
                      <Flag iso2={c.iso2} size={18} />
                      {c.name}
                    </Link>
                  </td>
                  {sortKey !== 'name' && (
                    <td className="px-1 py-2.5 text-center hidden md:table-cell">
                      <Sparkline data={(s as any)[sortKey] != null ? (sparklines[c.id] || []) : []} />
                    </td>
                  )}
                  {COLUMNS.map(col => {
                    const val = (s as any)[col.key] as number | undefined;
                    const outlierCls = getOutlierClass(col, val);
                    return (
                      <td key={col.key} className={`px-3 py-2.5 text-right font-mono text-[15px] ${outlierCls || 'text-[#475569]'} ${col.hideOnMobile ? 'hidden lg:table-cell' : ''}`}>
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
    </section>
  );
}
