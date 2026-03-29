'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ExportButton from '@/components/ExportButton';
import AnimatedPrice from '@/components/AnimatedPrice';
import MarketsHeader from './MarketsHeader';
import Flag from '../Flag';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Quote {
  id: string;
  label: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
}

interface QuotesResponse {
  count: number;
  updatedAt: string | null;
  quotes: Quote[];
}

// Map SOTW IDs to country codes for linking
const ID_TO_COUNTRY: Record<string, string> = {
  'YF.IDX.USA': 'USA', 'YF.IDX.CAN': 'CAN', 'YF.IDX.BRA': 'BRA', 'YF.IDX.MEX': 'MEX',
  'YF.IDX.ARG': 'ARG', 'YF.IDX.GBR': 'GBR', 'YF.IDX.DEU': 'DEU', 'YF.IDX.FRA': 'FRA',
  'YF.IDX.NLD': 'NLD', 'YF.IDX.ESP': 'ESP', 'YF.IDX.ITA': 'ITA', 'YF.IDX.CHE': 'CHE',
  'YF.IDX.JPN': 'JPN', 'YF.IDX.HKG': 'HKG', 'YF.IDX.CHN': 'CHN', 'YF.IDX.KOR': 'KOR',
  'YF.IDX.IND': 'IND', 'YF.IDX.AUS': 'AUS', 'YF.IDX.NZL': 'NZL', 'YF.IDX.SGP': 'SGP',
  'YF.IDX.IDN': 'IDN', 'YF.IDX.MYS': 'MYS', 'YF.IDX.ISR': 'ISR', 'YF.IDX.SAU': 'SAU',
  'YF.IDX.ZAF': 'ZAF',
  'YF.FUT.SP500': 'USA', 'YF.FUT.NASDAQ': 'USA', 'YF.FUT.DOW': 'USA', 'YF.FUT.RUSSELL': 'USA',
};

const COUNTRY_NAMES: Record<string, string> = {
  'USA': 'United States', 'GBR': 'United Kingdom', 'DEU': 'Germany', 'FRA': 'France',
  'JPN': 'Japan', 'CHN': 'China', 'HKG': 'Hong Kong', 'IND': 'India', 'KOR': 'South Korea',
  'CAN': 'Canada', 'AUS': 'Australia', 'BRA': 'Brazil', 'MEX': 'Mexico', 'ARG': 'Argentina',
  'ESP': 'Spain', 'ITA': 'Italy', 'CHE': 'Switzerland', 'NLD': 'Netherlands',
  'NZL': 'New Zealand', 'SGP': 'Singapore', 'IDN': 'Indonesia', 'MYS': 'Malaysia',
  'ISR': 'Israel', 'SAU': 'Saudi Arabia', 'ZAF': 'South Africa',
};

const COUNTRY_ISO2: Record<string, string> = {
  'USA': 'us', 'GBR': 'gb', 'DEU': 'de', 'FRA': 'fr', 'JPN': 'jp', 'CHN': 'cn',
  'HKG': 'hk', 'IND': 'in', 'KOR': 'kr', 'CAN': 'ca', 'AUS': 'au', 'BRA': 'br',
  'MEX': 'mx', 'ARG': 'ar', 'ESP': 'es', 'ITA': 'it', 'CHE': 'ch', 'NLD': 'nl',
  'NZL': 'nz', 'SGP': 'sg', 'IDN': 'id', 'MYS': 'my', 'ISR': 'il', 'SAU': 'sa',
  'ZAF': 'za',
};

const REGIONS: Record<string, string[]> = {
  'Futures (Live 24h)': ['YF.FUT.SP500', 'YF.FUT.NASDAQ', 'YF.FUT.DOW', 'YF.FUT.RUSSELL'],
  'Americas': ['YF.IDX.USA', 'YF.IDX.CAN', 'YF.IDX.BRA', 'YF.IDX.MEX', 'YF.IDX.ARG'],
  'Europe': ['YF.IDX.GBR', 'YF.IDX.DEU', 'YF.IDX.FRA', 'YF.IDX.ESP', 'YF.IDX.ITA', 'YF.IDX.CHE', 'YF.IDX.NLD'],
  'Asia-Pacific': ['YF.IDX.JPN', 'YF.IDX.CHN', 'YF.IDX.HKG', 'YF.IDX.KOR', 'YF.IDX.IND', 'YF.IDX.AUS', 'YF.IDX.NZL', 'YF.IDX.SGP', 'YF.IDX.IDN', 'YF.IDX.MYS'],
  'Middle East & Africa': ['YF.IDX.ISR', 'YF.IDX.SAU', 'YF.IDX.ZAF'],
};

function ChangeCell({ value, pct }: { value: number; pct: number }) {
  const color = value >= 0 ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
  const sign = value >= 0 ? '+' : '';
  return (
    <>
      <td className={`px-3 py-2 text-right font-mono text-[14px] ${color}`}>
        {sign}{value.toFixed(2)}
      </td>
      <td className={`px-3 py-2 text-right font-mono text-[14px] ${color}`}>
        {sign}{pct.toFixed(2)}%
      </td>
    </>
  );
}

const RANGES = [
  { key: '1d', label: '1D' },
  { key: '5d', label: '5D' },
  { key: '1mo', label: '1M' },
  { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' },
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1Y' },
  { key: '2y', label: '2Y' },
  { key: '5y', label: '5Y' },
  { key: '10y', label: '10Y' },
  { key: 'max', label: 'All' },
] as const;

interface ChartPoint { date: string; value: number }

function IndexChart({ id, label }: { id: string; label: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/index-chart?id=${encodeURIComponent(id)}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchChart(range);
    const iv = setInterval(() => fetchChart(range, true), 60_000);
    return () => clearInterval(iv);
  }, [range, fetchChart]);

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAmt = first && last ? last - first : 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const isUp = changeAmt >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';

  const formatXTick = (date: string) => {
    if (range === '1d') {
      const m = date.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      return m ? m[1] : date.split(', ').pop() || date;
    }
    if (range === '5d') {
      const m = date.match(/([A-Z][a-z]{2})\s+\d+,?\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
      if (m) return `${m[1]} ${m[2]}`;
      return date.split(', ').pop() || date;
    }
    const d = new Date(date + 'T12:00:00');
    if (range === '1mo') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (range === '3mo' || range === '6mo' || range === 'ytd') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (range === '1y' || range === '2y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    if (range === '5y' || range === '10y') return d.toLocaleDateString('en', { year: 'numeric' });
    if (range === 'max') return d.getFullYear().toString();
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-[#d5dce6] bg-[#f4f6f9] px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#0d1b2a]">{label}</span>
          {points.length > 1 && (
            <span className={`text-[14px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}{changeAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 text-[14px] rounded-lg ${range === r.key ? 'bg-[#0d1b2a] text-white' : 'bg-white border border-[#d5dce6] text-[#64748b] hover:bg-[#f4f6f9]'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[14px]">Loading chart...</div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[14px]">No chart data</div>
      ) : (() => {
        const vals = points.map(p => p.value).filter(v => v > 0);
        const minVal = Math.min(...vals);
        const maxVal = Math.max(...vals);
        const useLog = (range === 'max' || range === '10y') && maxVal / minVal > 10;
        const chartData = useLog
          ? points.filter(p => p.value > 0).map(p => ({ ...p, logValue: Math.log10(p.value) }))
          : points;
        const logTicks = (() => {
          if (!useLog) return undefined;
          const ticks: number[] = [];
          const bases = [1, 2, 5];
          let mag = Math.pow(10, Math.floor(Math.log10(minVal)));
          while (mag <= maxVal * 2) {
            for (const b of bases) {
              const v = mag * b;
              if (v >= minVal * 0.5 && v <= maxVal * 2) ticks.push(Math.log10(v));
            }
            mag *= 10;
          }
          return ticks;
        })();
        const fmtPrice = (v: number) => v >= 10000 ? `${(v/1000).toFixed(0)}K` : v >= 100 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v.toFixed(2);
        return (
        <div className="h-[200px]">
          {useLog && <div className="text-[9px] text-[#94a3b8] text-right pr-2 -mb-1">log scale</div>}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`idxgrad-${id.replace(/\./g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date"
                tickFormatter={(date: string) => {
                  if (chartData.length > 0 && date === chartData[chartData.length - 1].date) return 'Today';
                  return formatXTick(date);
                }}
                tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }}
                ticks={(() => {
                  if (chartData.length <= 2) return undefined;
                  const n = Math.min(10, chartData.length);
                  const step = Math.floor((chartData.length - 1) / n);
                  const ticks: string[] = [];
                  for (let i = 0; i < chartData.length - 1; i += step) ticks.push(chartData[i].date);
                  ticks.push(chartData[chartData.length - 1].date);
                  return ticks;
                })()}
              />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => useLog ? fmtPrice(Math.pow(10, v)) : fmtPrice(v)}
                ticks={logTicks} width={65}
                label={{ value: 'pts', position: 'insideTopLeft', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as ChartPoint & { logValue?: number };
                const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                const dateLabel = isISO ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : p.date;
                return (
                  <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[14px]">
                    <div className="text-[#999] mb-0.5">{dateLabel}</div>
                    <div className="font-mono font-semibold text-[14px]">{p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey={useLog ? 'logValue' : 'value'} stroke={color} strokeWidth={1.5} fill={`url(#idxgrad-${id.replace(/\./g, '-')})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        );
      })()}
    </div>
  );
}

export default function MarketsPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = () => {
      fetch('/api/quotes')
        .then(r => r.json())
        .then((data: QuotesResponse) => {
          setQuotes(data.quotes || []);
          setUpdatedAt(data.updatedAt);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 5_000);
    return () => clearInterval(interval);
  }, []);

  const quoteMap = Object.fromEntries(quotes.map(q => [q.id, q]));

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading market data...</div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <ExportButton
                filename={`sotw-indices-${new Date().toISOString().slice(0, 10)}`}
                getData={() => ({
                  headers: ['Region', 'Country', 'Index', 'Price', 'Prev Close', 'Change', '% Change'],
                  rows: Object.entries(REGIONS).flatMap(([region, ids]) =>
                    ids.map(id => {
                      const q = quoteMap[id];
                      if (!q) return null;
                      const cid = ID_TO_COUNTRY[id] || '';
                      return [region, COUNTRY_NAMES[cid] || cid, q.label, q.price, q.previousClose, q.change, q.changePct];
                    }).filter(Boolean) as (string | number)[][],
                  ),
                })}
              />
            </div>
            {/* Stock Indices by region */}
            {Object.entries(REGIONS).map(([region, ids]) => {
              const regionQuotes = ids.map(id => quoteMap[id]).filter(Boolean);
              if (regionQuotes.length === 0) return null;
              return (
                <div key={region}>
                  <h2 className="text-[15px] font-bold text-[#0d1b2a] uppercase tracking-wider mb-3">{region}</h2>
                  <div className="bg-white border border-[#d5dce6] rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '13%' }} />
                      </colgroup>
                      <thead>
                        <tr className="text-[14px] text-[#64748b] uppercase tracking-wider bg-[#f4f6f9] border-b border-[#d5dce6]">
                          <th className="text-left px-3 py-2">Country</th>
                          <th className="text-left px-3 py-2">Index</th>
                          <th className="text-right px-3 py-2">Price</th>
                          <th className="text-right px-3 py-2">Prev Close</th>
                          <th className="text-right px-3 py-2">Change</th>
                          <th className="text-right px-3 py-2">% Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ids.map(id => {
                          const q = quoteMap[id];
                          if (!q) return null;
                          const cid = ID_TO_COUNTRY[id] || '';
                          const isExpanded = expanded === id;
                          return (
                            <React.Fragment key={id}>
                              <tr
                                className={`border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition text-[14px] cursor-pointer ${isExpanded ? 'bg-[#f5f7fa]' : ''}`}
                                onClick={() => setExpanded(isExpanded ? null : id)}
                              >
                                <td className="px-3 py-2">
                                  <span className="flex items-center gap-1.5">
                                    <span className={`text-[14px] text-[#64748b] transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                                    {COUNTRY_ISO2[cid] && <Flag iso2={COUNTRY_ISO2[cid]} size={16} />}
                                    <Link href={`/country/${cid}`} className="text-[#0066cc] hover:underline" onClick={e => e.stopPropagation()}>
                                      {COUNTRY_NAMES[cid] || cid}
                                    </Link>
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-[#64748b]">
                                  <Link href={`/country/${cid}/${encodeURIComponent(id)}`} className="hover:text-[#0066cc] transition" onClick={e => e.stopPropagation()}>
                                    {q.label}
                                  </Link>
                                </td>
                                <td className="px-3 py-2 text-right font-mono font-semibold">
                                  <AnimatedPrice value={q.price} />
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-[15px] text-[#94a3b8]">
                                  {q.previousClose.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </td>
                                <ChangeCell value={q.change} pct={q.changePct} />
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} className="p-0">
                                    <IndexChart id={id} label={q.label} />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
