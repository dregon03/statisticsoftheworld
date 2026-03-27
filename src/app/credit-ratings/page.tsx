'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatValue } from '@/lib/data';
import Flag from '../Flag';
import WorldMap from '@/components/charts/WorldMap';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

interface CountryRating {
  countryId: string;
  country: string;
  iso2: string;
  region: string;
  score: number; // 0-100 SOTW composite score
  governance: number; // avg governance estimate (-2.5 to 2.5)
  gdpPerCapita: number | null;
  debtToGdp: number | null;
  grade: string; // letter grade
}

// Convert governance score (-2.5 to +2.5) to 0-100 scale
function governanceToScore(avg: number): number {
  // Map -2.5..+2.5 to 0..100
  return Math.max(0, Math.min(100, ((avg + 2.5) / 5) * 100));
}

// Convert 0-100 score to letter grade (similar to S&P scale)
function scoreToGrade(score: number): string {
  if (score >= 90) return 'AAA';
  if (score >= 85) return 'AA+';
  if (score >= 80) return 'AA';
  if (score >= 75) return 'AA-';
  if (score >= 70) return 'A+';
  if (score >= 65) return 'A';
  if (score >= 60) return 'A-';
  if (score >= 55) return 'BBB+';
  if (score >= 50) return 'BBB';
  if (score >= 45) return 'BBB-';
  if (score >= 40) return 'BB+';
  if (score >= 35) return 'BB';
  if (score >= 30) return 'BB-';
  if (score >= 25) return 'B+';
  if (score >= 20) return 'B';
  if (score >= 15) return 'B-';
  if (score >= 10) return 'CCC';
  if (score >= 5) return 'CC';
  return 'C';
}

function gradeColor(grade: string): string {
  if (grade.startsWith('AAA') || grade.startsWith('AA')) return 'text-[#2ecc40] bg-[#f0fff4]';
  if (grade.startsWith('A')) return 'text-[#27ae60] bg-[#f0fff4]';
  if (grade.startsWith('BBB')) return 'text-[#f39c12] bg-[#fffdf0]';
  if (grade.startsWith('BB')) return 'text-[#e67e22] bg-[#fff8f0]';
  if (grade.startsWith('B')) return 'text-[#e74c3c] bg-[#fff5f5]';
  return 'text-[#c0392b] bg-[#fff0f0]';
}

export default function CreditRatingsPage() {
  const [ratings, setRatings] = useState<CountryRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'country' | 'grade'>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [filterRegion, setFilterRegion] = useState('');

  useEffect(() => {
    // Fetch governance indicators + GDP per capita + debt
    Promise.all([
      fetch('/api/indicator?id=CC.EST').then(r => r.json()),
      fetch('/api/indicator?id=GE.EST').then(r => r.json()),
      fetch('/api/indicator?id=RL.EST').then(r => r.json()),
      fetch('/api/indicator?id=PV.EST').then(r => r.json()),
      fetch('/api/indicator?id=VA.EST').then(r => r.json()),
      fetch('/api/indicator?id=RQ.EST').then(r => r.json()),
      fetch('/api/indicator?id=IMF.NGDPDPC').then(r => r.json()),
      fetch('/api/indicator?id=IMF.GGXWDG_NGDP').then(r => r.json()),
      fetch('/api/countries').then(r => r.json()),
    ]).then(([cc, ge, rl, pv, va, rq, gdppc, debt, { countries }]) => {
      // Build maps
      const makeMap = (data: any[]) => Object.fromEntries(data.map((d: any) => [d.countryId, d]));
      const ccMap = makeMap(cc);
      const geMap = makeMap(ge);
      const rlMap = makeMap(rl);
      const pvMap = makeMap(pv);
      const vaMap = makeMap(va);
      const rqMap = makeMap(rq);
      const gdpMap = makeMap(gdppc);
      const debtMap = makeMap(debt);
      const countryMap = Object.fromEntries(countries.map((c: any) => [c.id, c]));

      // Compute composite score for each country
      const results: CountryRating[] = [];
      for (const c of countries) {
        const scores = [ccMap[c.id], geMap[c.id], rlMap[c.id], pvMap[c.id], vaMap[c.id], rqMap[c.id]]
          .filter(s => s?.value != null)
          .map(s => s.value);

        if (scores.length < 3) continue; // need at least 3 governance indicators

        const avgGovernance = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        const baseScore = governanceToScore(avgGovernance);

        // Adjust slightly for GDP per capita (richer countries tend to be more stable)
        const gdp = gdpMap[c.id]?.value;
        let gdpBonus = 0;
        if (gdp) {
          if (gdp > 50000) gdpBonus = 5;
          else if (gdp > 20000) gdpBonus = 3;
          else if (gdp > 10000) gdpBonus = 1;
        }

        // Penalize for very high debt
        const debtVal = debtMap[c.id]?.value;
        let debtPenalty = 0;
        if (debtVal) {
          if (debtVal > 150) debtPenalty = 5;
          else if (debtVal > 100) debtPenalty = 2;
        }

        const finalScore = Math.max(0, Math.min(100, baseScore + gdpBonus - debtPenalty));
        const grade = scoreToGrade(finalScore);

        results.push({
          countryId: c.id,
          country: c.name,
          iso2: c.iso2 || c.id.toLowerCase().slice(0, 2),
          region: c.region,
          score: Math.round(finalScore * 10) / 10,
          governance: Math.round(avgGovernance * 100) / 100,
          gdpPerCapita: gdp ? Math.round(gdp) : null,
          debtToGdp: debtVal ? Math.round(debtVal * 10) / 10 : null,
          grade,
        });
      }

      results.sort((a, b) => b.score - a.score);
      setRatings(results);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const regions = [...new Set(ratings.map(r => r.region))].sort();

  const filtered = filterRegion
    ? ratings.filter(r => r.region === filterRegion)
    : ratings;

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortBy === 'country') return a.country.localeCompare(b.country) * mul;
    if (sortBy === 'grade') return (b.score - a.score) * mul;
    return (b.score - a.score) * mul;
  });

  const mapData = ratings.map(r => ({
    countryId: r.countryId,
    value: r.score,
    year: '',
  }));

  return (
    <main className="min-h-screen">
      <Nav />

      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold mb-1">Country Credit Ratings</h1>
          <p className="text-[13px] text-[#64748b]">
            SOTW Credit Score (0-100) based on World Bank Governance Indicators, GDP per capita, and government debt levels.
            Higher scores indicate stronger institutional quality and creditworthiness.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="border border-[#d5dce6] rounded-lg px-3 py-1.5 text-[12px] outline-none"
          >
            <option value="">All Regions ({ratings.length} countries)</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex gap-1 ml-auto bg-[#f0f0f0] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-[12px] transition ${viewMode === 'table' ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'}`}
            >Table</button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded text-[12px] transition ${viewMode === 'map' ? 'bg-white shadow-sm font-medium' : 'text-[#64748b]'}`}
            >Map</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Computing credit scores...</div>
        ) : viewMode === 'map' ? (
          <div>
            <WorldMap
              data={mapData}
              format="number"
              decimals={0}
              label="SOTW Credit Score (0-100)"
            />
            {/* Top and bottom 10 below map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border border-[#d5dce6] rounded-xl p-4">
                <h3 className="text-[13px] font-semibold mb-3">Highest Rated</h3>
                {sorted.slice(0, 10).map((r, i) => (
                  <div key={r.countryId} className="flex items-center justify-between py-1 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748b] w-4">{i + 1}.</span>
                      <Flag iso2={r.iso2} size={16} />
                      <Link href={`/country/${r.countryId}`} className="text-[#0066cc] hover:underline">{r.country}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
                      <span className="font-mono text-[#0d1b2a] w-8 text-right">{r.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border border-[#d5dce6] rounded-xl p-4">
                <h3 className="text-[13px] font-semibold mb-3">Lowest Rated</h3>
                {[...sorted].reverse().slice(0, 10).map((r, i) => (
                  <div key={r.countryId} className="flex items-center justify-between py-1 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748b] w-4">{sorted.length - i}.</span>
                      <Flag iso2={r.iso2} size={16} />
                      <Link href={`/country/${r.countryId}`} className="text-[#0066cc] hover:underline">{r.country}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
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
                <tr className="text-[11px] text-[#64748b] uppercase border-b border-[#d5dce6] bg-[#f4f6f9]">
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
                    <td className="px-4 py-2 text-[12px] text-[#64748b]">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link href={`/country/${r.countryId}`} className="inline-flex items-center gap-2 text-[13px] text-[#0066cc] hover:underline">
                        <Flag iso2={r.iso2} size={18} />
                        {r.country}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-[12px] px-2 py-0.5 rounded font-mono font-bold ${gradeColor(r.grade)}`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[13px] font-semibold">{r.score}</td>
                    <td className="px-4 py-2 text-right font-mono text-[12px] text-[#64748b] hidden md:table-cell">{r.governance}</td>
                    <td className="px-4 py-2 text-right font-mono text-[12px] text-[#64748b] hidden md:table-cell">
                      {r.gdpPerCapita ? `$${r.gdpPerCapita.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-[12px] text-[#64748b] hidden md:table-cell">
                      {r.debtToGdp ? `${r.debtToGdp}%` : '—'}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-[#64748b] hidden lg:table-cell">{r.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Methodology */}
        <div className="mt-8 border border-[#d5dce6] rounded-xl p-5 bg-[#f4f6f9]">
          <h3 className="text-[14px] font-semibold mb-2">Methodology</h3>
          <p className="text-[12px] text-[#64748b] leading-relaxed mb-3">
            The SOTW Credit Score is a composite index (0-100) computed from six World Bank Worldwide Governance Indicators:
            Control of Corruption, Government Effectiveness, Rule of Law, Political Stability, Voice & Accountability, and Regulatory Quality.
            These are supplemented by GDP per capita (higher income = small bonus) and government debt-to-GDP ratio (very high debt = small penalty).
          </p>
          <p className="text-[12px] text-[#64748b] leading-relaxed mb-3">
            Unlike S&P, Moody&apos;s, or Fitch ratings, the SOTW Score is fully transparent, unsolicited, and based entirely on publicly available data.
            It is designed to be comparable across countries and updated whenever the World Bank publishes new governance data.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-[11px]">
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

      <Footer />
    </main>
  );
}
