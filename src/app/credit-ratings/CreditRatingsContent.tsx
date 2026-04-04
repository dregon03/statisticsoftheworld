'use client';

import { useState } from 'react';
import Link from 'next/link';
import Flag from '../Flag';
import WorldMap from '@/components/charts/WorldMap';

interface CountryRating {
  countryId: string;
  country: string;
  iso2: string;
  region: string;
  score: number;
  governance: number;
  gdpPerCapita: number | null;
  debtToGdp: number | null;
  grade: string;
}

function gradeColor(grade: string): string {
  if (grade.startsWith('AAA') || grade.startsWith('AA')) return 'text-[#2ecc40] bg-[#f0fff4]';
  if (grade.startsWith('A')) return 'text-[#27ae60] bg-[#f0fff4]';
  if (grade.startsWith('BBB')) return 'text-[#f39c12] bg-[#fffdf0]';
  if (grade.startsWith('BB')) return 'text-[#e67e22] bg-[#fff8f0]';
  if (grade.startsWith('B')) return 'text-[#e74c3c] bg-[#fff5f5]';
  return 'text-[#c0392b] bg-[#fff0f0]';
}

export default function CreditRatingsContent({ ratings }: { ratings: CountryRating[] }) {
  const [sortBy, setSortBy] = useState<'score' | 'country' | 'grade'>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [filterRegion, setFilterRegion] = useState('');

  const regions = [...new Set(ratings.map(r => r.region))].sort();

  const filtered = filterRegion
    ? ratings.filter(r => r.region === filterRegion)
    : ratings;

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortBy === 'country') return a.country.localeCompare(b.country) * mul;
    return (b.score - a.score) * mul;
  });

  const mapData = ratings.map(r => ({
    countryId: r.countryId,
    value: r.score,
    year: '',
  }));

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold mb-1">Country Credit Ratings</h1>
        <p className="text-[15px] text-[#64748b]">
          SOTW Credit Score (0-100) based on World Bank Governance Indicators, GDP per capita, and government debt levels.
          Higher scores indicate stronger institutional quality and creditworthiness.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterRegion}
          onChange={e => setFilterRegion(e.target.value)}
          className="border border-[#d5dce6] rounded-lg px-3 py-1.5 text-[14px] outline-none"
        >
          <option value="">All Regions ({ratings.length} countries)</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex gap-1 ml-auto bg-[#f0f0f0] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded text-[14px] transition ${viewMode === 'table' ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'}`}
          >Table</button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded text-[14px] transition ${viewMode === 'map' ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'}`}
          >Map</button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div>
          <WorldMap data={mapData} format="number" decimals={0} label="SOTW Credit Score (0-100)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <h3 className="text-[15px] font-semibold mb-3">Highest Rated</h3>
              {sorted.slice(0, 10).map((r, i) => (
                <div key={r.countryId} className="flex items-center justify-between py-1 text-[14px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748b] w-4">{i + 1}.</span>
                    <Flag iso2={r.iso2} size={16} />
                    <Link href={`/country/${r.countryId}`} className="text-[#0066cc] hover:underline">{r.country}</Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] px-1.5 py-0.5 rounded font-mono font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
                    <span className="font-mono text-[#0d1b2a] w-8 text-right">{r.score}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-[#d5dce6] rounded-xl p-4">
              <h3 className="text-[15px] font-semibold mb-3">Lowest Rated</h3>
              {[...sorted].reverse().slice(0, 10).map((r, i) => (
                <div key={r.countryId} className="flex items-center justify-between py-1 text-[14px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748b] w-4">{sorted.length - i}.</span>
                    <Flag iso2={r.iso2} size={16} />
                    <Link href={`/country/${r.countryId}`} className="text-[#0066cc] hover:underline">{r.country}</Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] px-1.5 py-0.5 rounded font-mono font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
                    <span className="font-mono text-[#0d1b2a] w-8 text-right">{r.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-[#d5dce6] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[15px] text-[#64748b] uppercase border-b border-[#d5dce6] bg-[#f4f6f9]">
                <th className="px-4 py-2.5 text-left w-10">#</th>
                <th className="px-4 py-2.5 text-left">Country</th>
                <th className="px-4 py-2.5 text-center">
                  <button onClick={() => { setSortBy('grade'); setSortAsc(!sortAsc); }} className="hover:text-[#0d1b2a] transition">
                    SOTW Grade
                  </button>
                </th>
                <th className="px-4 py-2.5 text-right">
                  <button onClick={() => { setSortBy('score'); setSortAsc(!sortAsc); }} className="hover:text-[#0d1b2a] transition">
                    Score (0-100)
                  </button>
                </th>
                <th className="px-4 py-2.5 text-right hidden md:table-cell">Governance</th>
                <th className="px-4 py-2.5 text-right hidden md:table-cell">GDP/Capita</th>
                <th className="px-4 py-2.5 text-right hidden md:table-cell">Debt/GDP</th>
                <th className="px-4 py-2.5 text-left hidden lg:table-cell">Region</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.countryId} className="border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition">
                  <td className="px-4 py-2 text-[14px] text-[#64748b]">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link href={`/country/${r.countryId}`} className="inline-flex items-center gap-2 text-[15px] text-[#0066cc] hover:underline">
                      <Flag iso2={r.iso2} size={18} />
                      {r.country}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-[14px] px-2 py-0.5 rounded font-mono font-bold ${gradeColor(r.grade)}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[15px] font-semibold">{r.score}</td>
                  <td className="px-4 py-2 text-right font-mono text-[14px] text-[#64748b] hidden md:table-cell">{r.governance}</td>
                  <td className="px-4 py-2 text-right font-mono text-[14px] text-[#64748b] hidden md:table-cell">
                    {r.gdpPerCapita ? `$${r.gdpPerCapita.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[14px] text-[#64748b] hidden md:table-cell">
                    {r.debtToGdp ? `${r.debtToGdp}%` : '—'}
                  </td>
                  <td className="px-4 py-2 text-[15px] text-[#64748b] hidden lg:table-cell">{r.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Methodology */}
      <div className="mt-8 border border-[#d5dce6] rounded-xl p-5 bg-[#f4f6f9]">
        <h3 className="text-[14px] font-semibold mb-2">Methodology</h3>
        <p className="text-[14px] text-[#64748b] leading-relaxed mb-3">
          The SOTW Credit Score is a composite index (0-100) computed from six World Bank Worldwide Governance Indicators:
          Control of Corruption, Government Effectiveness, Rule of Law, Political Stability, Voice & Accountability, and Regulatory Quality.
          These are supplemented by GDP per capita (higher income = small bonus) and government debt-to-GDP ratio (very high debt = small penalty).
        </p>
        <p className="text-[14px] text-[#64748b] leading-relaxed mb-3">
          Unlike S&P, Moody&apos;s, or Fitch ratings, the SOTW Score is fully transparent, unsolicited, and based entirely on publicly available data.
          It is designed to be comparable across countries and updated whenever the World Bank publishes new governance data.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-[15px]">
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${gradeColor('AAA')}`}>AAA</span>
            <span className="text-[#64748b]">90-100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${gradeColor('A')}`}>A</span>
            <span className="text-[#64748b]">60-74</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${gradeColor('BBB')}`}>BBB</span>
            <span className="text-[#64748b]">45-59</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${gradeColor('B')}`}>B</span>
            <span className="text-[#64748b]">15-29</span>
          </div>
        </div>
      </div>
    </section>
  );
}
