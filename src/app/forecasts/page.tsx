'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import HeroTabs from '@/components/HeroTabs';
import Flag from '../Flag';

interface ForecastIndicator {
  id: string;
  label: string;
  format: string;
}

interface ForecastRow {
  countryId: string;
  country: string;
  iso2: string;
  region: string;
  values: Record<number, number>;
}

function formatVal(value: number | undefined, format: string): string {
  if (value == null) return '—';
  if (format === 'percent') return `${value.toFixed(1)}%`;
  if (format === 'currency') {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function ForecastsContent() {
  const [indicators, setIndicators] = useState<ForecastIndicator[]>([]);
  const [selectedId, setSelectedId] = useState('IMF.NGDP_RPCH');
  const [selectedIndicator, setSelectedIndicator] = useState<ForecastIndicator | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [rows, setRows] = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);
  const [sortYear, setSortYear] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forecasts?indicator=${encodeURIComponent(selectedId)}`)
      .then(r => r.json())
      .then(data => {
        setIndicators(data.indicators || []);
        setSelectedIndicator(data.indicator || null);
        setYears(data.years || []);
        setRows(data.countries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedId]);

  const activeYear = sortYear || years[0];
  const filtered = search
    ? rows.filter(r => r.country.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a.values[activeYear] ?? -Infinity;
    const bVal = b.values[activeYear] ?? -Infinity;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const content = (
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <h2 className="text-[20px] font-bold mb-1">IMF Forecasts</h2>
        <p className="text-[14px] text-[#64748b] mb-5">
          IMF World Economic Outlook projections for {years.join(' & ')}. Free data that Trading Economics charges for.
        </p>

        {/* Indicator selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {indicators.map(ind => (
            <button
              key={ind.id}
              onClick={() => setSelectedId(ind.id)}
              className={`px-3 py-1.5 text-[14px] rounded-lg border transition ${
                selectedId === ind.id
                  ? 'bg-[#0d1b2a] text-white border-[#0066cc]'
                  : 'border-[#d5dce6] text-[#64748b] hover:bg-[#f4f6f9]'
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filter countries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-[#d5dce6] rounded-lg px-3 py-1.5 text-[14px] outline-none w-64"
          />
          <span className="text-[14px] text-[#64748b] ml-3">{sorted.length} countries</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading forecasts...</div>
        ) : (
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[15px] text-[#64748b] uppercase border-b border-[#d5dce6] bg-[#f4f6f9]">
                  <th className="px-4 py-2.5 text-left w-10">
                    <button onClick={() => setSortAsc(!sortAsc)} className="text-[#64748b] hover:text-[#0d1b2a]">
                      {sortAsc ? '#↑' : '#↓'}
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left">Country</th>
                  <th className="px-4 py-2.5 text-left text-[#64748b] hidden md:table-cell">Region</th>
                  {years.map(y => (
                    <th key={y} className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => { setSortYear(y); setSortAsc(false); }}
                        className={`font-semibold transition ${
                          activeYear === y ? 'text-[#0066cc]' : 'text-[#64748b] hover:text-[#0d1b2a]'
                        }`}
                      >
                        {y}{activeYear === y ? ' ▼' : ''}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const format = selectedIndicator?.format || 'number';
                  return (
                    <tr key={row.countryId} className="border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition">
                      <td className="px-4 py-2 text-[#94a3b8] text-[14px]">{i + 1}</td>
                      <td className="px-4 py-2">
                        <Link href={`/country/${row.countryId}`} className="inline-flex items-center gap-2 text-[15px] text-[#0066cc] hover:underline">
                          <Flag iso2={row.iso2} size={20} />
                          {row.country}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-[14px] text-[#64748b] hidden md:table-cell">{row.region}</td>
                      {years.map(y => {
                        const val = row.values[y];
                        const isNeg = val != null && val < 0;
                        return (
                          <td key={y} className={`px-4 py-2 text-right font-mono text-[15px] ${
                            isNeg ? 'text-red-600' : 'text-[#0d1b2a]'
                          }`}>
                            {formatVal(val, format)}
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

        <div className="mt-4 text-[15px] text-[#64748b]">
          Source: <a href="https://www.imf.org/en/publications/weo" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">IMF World Economic Outlook</a>.
          Forecasts are IMF staff projections, not guarantees.
        </div>
      </section>
  );

  return content;
}

export default function ForecastsPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/forecasts" />
      <ForecastsContent />
      <Footer />
    </main>
  );
}
