'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Flag from '../Flag';
import ExportButton from '@/components/ExportButton';
import HeroTabs from '@/components/HeroTabs';

interface Indicator { id: string; label: string; higherIsBetter: boolean; neutral?: boolean; }
interface Range { min: number; max: number; }
interface CountryRow {
  countryId: string;
  country: string;
  iso2: string;
  values: Record<string, { value: number; year: string }>;
}

function getColor(value: number, range: Range, higherIsBetter: boolean, neutral?: boolean): string {
  if (!range || range.max === range.min) return 'bg-gray-100';
  const normalized = (value - range.min) / (range.max - range.min); // 0-1

  // Neutral scale (blue) — no value judgment, just magnitude
  if (neutral) {
    if (normalized >= 0.8) return 'bg-blue-600 text-white';
    if (normalized >= 0.6) return 'bg-blue-400 text-white';
    if (normalized >= 0.4) return 'bg-blue-200 text-blue-900';
    if (normalized >= 0.2) return 'bg-blue-100 text-blue-800';
    return 'bg-slate-50 text-slate-600';
  }

  const score = higherIsBetter ? normalized : 1 - normalized; // 0=bad, 1=good

  if (score >= 0.8) return 'bg-green-500 text-white';
  if (score >= 0.6) return 'bg-green-200 text-green-900';
  if (score >= 0.4) return 'bg-yellow-100 text-yellow-900';
  if (score >= 0.2) return 'bg-orange-200 text-orange-900';
  return 'bg-red-400 text-white';
}

function formatCell(value: number, indId: string): string {
  // IMF.NGDPD is in billions of USD — convert to trillions for display
  if (indId === 'IMF.NGDPD') {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}T`;
    return `$${Math.round(value)}B`;
  }
  if (indId.includes('NGDPDPC')) {
    return `$${Math.round(value).toLocaleString()}`;
  }
  // Military spending in raw USD
  if (indId === 'MS.MIL.XPND.CD') {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${Math.round(value).toLocaleString()}`;
  }
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) < 100) return value.toFixed(1);
  return Math.round(value).toLocaleString();
}

export default function HeatmapPage() {
  const [preset, setPreset] = useState('macro');
  const [group, setGroup] = useState('Top20');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [ranges, setRanges] = useState<Record<string, Range>>({});
  const [rows, setRows] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [presets, setPresets] = useState<{ id: string; label: string }[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/heatmap?preset=${preset}&group=${group}`)
      .then(r => r.json())
      .then(data => {
        setIndicators(data.indicators || []);
        setRanges(data.ranges || {});
        setRows(data.countries || []);
        setPresets(data.availablePresets || []);
        setGroups(data.availableGroups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [preset, group]);

  const sorted = sortBy
    ? [...rows].sort((a, b) => {
        const aVal = a.values[sortBy]?.value ?? -Infinity;
        const bVal = b.values[sortBy]?.value ?? -Infinity;
        return sortAsc ? aVal - bVal : bVal - aVal;
      })
    : rows;

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <HeroTabs active="/heatmap" />

      <section className="max-w-[1400px] mx-auto px-4 py-6">

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-1 bg-[#f0f0f0] rounded-lg p-0.5">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => { setPreset(p.id); setSortBy(null); }}
                className={`px-3 py-1.5 rounded text-[12px] transition ${
                  preset === p.id ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="border border-[#d5dce6] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="ml-auto self-center">
            <ExportButton
              filename={`sotw-heatmap-${preset}-${new Date().toISOString().slice(0, 10)}`}
              getData={() => ({
                headers: ['Country', 'Code', ...indicators.map(ind => ind.label)],
                rows: sorted.map(r => [
                  r.country, r.countryId,
                  ...indicators.map(ind => r.values[ind.id]?.value ?? null),
                ]),
              })}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading heatmap...</div>
        ) : (
          <div className="border border-[#d5dce6] rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f4f6f9] border-b border-[#d5dce6]">
                  <th className="px-3 py-2.5 text-left text-[11px] text-[#64748b] uppercase sticky left-0 bg-[#f4f6f9] z-10 min-w-[160px]">
                    Country
                  </th>
                  {indicators.map(ind => (
                    <th key={ind.id} className="px-2 py-2.5 text-center min-w-[90px]">
                      <button
                        onClick={() => { setSortBy(ind.id); setSortAsc(sortBy === ind.id ? !sortAsc : false); }}
                        className={`text-[11px] uppercase transition ${
                          sortBy === ind.id ? 'text-[#0066cc] font-bold' : 'text-[#64748b] hover:text-[#0d1b2a]'
                        }`}
                        title={`Sort by ${ind.label}`}
                      >
                        {ind.label}
                        {sortBy === ind.id && (sortAsc ? ' ↑' : ' ↓')}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(row => (
                  <tr key={row.countryId} className="border-b border-[#edf0f5] hover:bg-[#fafafa]">
                    <td className="px-3 py-2 sticky left-0 bg-white z-10">
                      <Link href={`/country/${row.countryId}`} className="inline-flex items-center gap-2 text-[13px] text-[#0066cc] hover:underline">
                        <Flag iso2={row.iso2} size={18} />
                        {row.country}
                      </Link>
                    </td>
                    {indicators.map(ind => {
                      const d = row.values[ind.id];
                      if (!d) {
                        return <td key={ind.id} className="px-2 py-2 text-center text-[11px] text-[#94a3b8]">—</td>;
                      }
                      const colorClass = getColor(d.value, ranges[ind.id], ind.higherIsBetter, ind.neutral);
                      return (
                        <td key={ind.id} className="px-1 py-1 text-center">
                          <div className={`rounded px-1.5 py-1 text-[11px] font-mono ${colorClass}`} title={`${d.value} (${d.year})`}>
                            {formatCell(d.value, ind.id)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 text-[11px] text-[#64748b]">
          <span>Color scale:</span>
          {preset === 'military' ? (
            <>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded">Highest</span>
              <span className="bg-blue-400 text-white px-2 py-0.5 rounded">High</span>
              <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded">Medium</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Low</span>
              <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">Lowest</span>
            </>
          ) : (
            <>
              <span className="bg-green-500 text-white px-2 py-0.5 rounded">Strong</span>
              <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded">Good</span>
              <span className="bg-yellow-100 text-yellow-900 px-2 py-0.5 rounded">Average</span>
              <span className="bg-orange-200 text-orange-900 px-2 py-0.5 rounded">Weak</span>
              <span className="bg-red-400 text-white px-2 py-0.5 rounded">Poor</span>
            </>
          )}
          <span className="ml-auto">Click column headers to sort</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
