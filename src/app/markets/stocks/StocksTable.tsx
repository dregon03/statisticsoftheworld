'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../MarketsHeader';
import StocksHeader from './StocksHeader';
import { COMPANY_NAMES } from './tickers';
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

type SortKey = 'label' | 'price' | 'change' | 'changePct';

const RANGES = [
  { key: '1d', label: '1D' },
  { key: '5d', label: '5D' },
  { key: '1mo', label: '1M' },
  { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
] as const;

interface ChartPoint { date: string; value: number }

function StockChart({ ticker, name }: { ticker: string; name: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/index-chart?ticker=${encodeURIComponent(ticker)}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [ticker]);

  useEffect(() => {
    fetchChart(range);
  }, [range, fetchChart]);

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAmt = first && last ? last - first : 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const isUp = changeAmt >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';

  const formatXTick = (date: string) => {
    if (range === '1d' || range === '5d') return date.replace(/,.*,/, ',').split(', ').pop() || date;
    const d = new Date(date + 'T12:00:00');
    if (range === '5y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-[#e8e8e8] bg-[#fafbfc] px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#333]">{name}</span>
          {points.length > 1 && (
            <span className={`text-[12px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}${Math.abs(changeAmt).toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`px-2 py-0.5 text-[11px] rounded ${range === r.key ? 'bg-[#0066cc] text-white' : 'bg-white border border-[#ddd] text-[#666] hover:bg-[#f0f0f0]'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[12px]">Loading chart...</div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[12px]">No chart data</div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`stockgrad-${ticker.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date"
                tickFormatter={(date: string) => {
                  if (points.length > 0 && date === points[points.length - 1].date) return 'Today';
                  return formatXTick(date);
                }}
                tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }}
                ticks={(() => {
                  if (points.length <= 2) return undefined;
                  const n = Math.min(10, points.length);
                  const step = Math.floor((points.length - 1) / n);
                  const ticks: string[] = [];
                  for (let i = 0; i < points.length - 1; i += step) ticks.push(points[i].date);
                  ticks.push(points[points.length - 1].date);
                  return ticks;
                })()}
              />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(0)}`} width={55} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as ChartPoint;
                const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                const dateLabel = isISO ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : p.date;
                return (
                  <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                    <div className="text-[#999] mb-0.5">{dateLabel}</div>
                    <div className="font-mono font-semibold text-[14px]">${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#stockgrad-${ticker.replace(/[^a-zA-Z0-9]/g, '')})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function StocksTable({ tickers, title }: { tickers: string[]; title: string }) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('changePct');
  const [sortAsc, setSortAsc] = useState(false);

  const tickerSet = useMemo(() => new Set(tickers), [tickers]);

  useEffect(() => {
    const fetchQuotes = () => {
      fetch('/api/quotes')
        .then(r => r.json())
        .then((data: { quotes: Quote[]; updatedAt: string }) => {
          setQuotes(data.quotes || []);
          setUpdatedAt(data.updatedAt);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 10_000);
    return () => clearInterval(interval);
  }, []);

  const stockQuotes = useMemo(() => {
    let list = quotes.filter(q => {
      if (!q.id.startsWith('YF.STOCK.')) return false;
      const ticker = q.id.replace('YF.STOCK.', '');
      return tickerSet.has(ticker);
    });

    if (search) {
      const s = search.toUpperCase();
      list = list.filter(q => {
        const name = COMPANY_NAMES[q.label] || '';
        return q.label.toUpperCase().includes(s) || name.toUpperCase().includes(s);
      });
    }

    list.sort((a, b) => {
      if (sortKey === 'label') {
        return sortAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
      }
      const aVal = (a as any)[sortKey] as number;
      const bVal = (b as any)[sortKey] as number;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [quotes, search, sortKey, sortAsc, tickerSet]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'label'); }
  };

  const sortIcon = (key: SortKey) => sortKey !== key ? '' : sortAsc ? ' \u2191' : ' \u2193';

  const gainers = [...stockQuotes].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  const losers = [...stockQuotes].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />
        <StocksHeader />

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading {title} data...</div>
        ) : stockQuotes.length === 0 ? (
          <div className="text-center py-20 text-[#999]">No {title} data yet. ETL job may still be running its first fetch.</div>
        ) : (
          <>
            {/* Gainers / Losers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-[#e8e8e8] rounded-lg p-4">
                <h3 className="text-[13px] font-semibold text-[#2ecc40] mb-3">Top Gainers</h3>
                {gainers.map(q => (
                  <div key={q.id} className="flex justify-between text-[13px] py-1">
                    <span className="font-medium">{q.label}</span>
                    <span className="font-mono text-[#2ecc40]">+{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div className="border border-[#e8e8e8] rounded-lg p-4">
                <h3 className="text-[13px] font-semibold text-[#e74c3c] mb-3">Top Losers</h3>
                {losers.map(q => (
                  <div key={q.id} className="flex justify-between text-[13px] py-1">
                    <span className="font-medium">{q.label}</span>
                    <span className="font-mono text-[#e74c3c]">{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text"
                placeholder="Search ticker..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#0066cc] transition w-48"
              />
              <span className="text-[12px] text-[#999] self-center ml-auto">{stockQuotes.length} stocks</span>
            </div>

            {/* Table */}
            <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                    <th className="text-left px-3 py-2">
                      <button onClick={() => handleSort('label')} className="hover:text-[#333]">Ticker{sortIcon('label')}</button>
                    </th>
                    <th className="text-left px-3 py-2 hidden md:table-cell">Name</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('price')} className="hover:text-[#333]">Price{sortIcon('price')}</button>
                    </th>
                    <th className="text-right px-3 py-2 hidden sm:table-cell">Prev Close</th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('change')} className="hover:text-[#333]">Change{sortIcon('change')}</button>
                    </th>
                    <th className="text-right px-3 py-2">
                      <button onClick={() => handleSort('changePct')} className="hover:text-[#333]">% Change{sortIcon('changePct')}</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockQuotes.map((q, i) => {
                    const color = q.change >= 0 ? 'text-[#2ecc40]' : 'text-[#e74c3c]';
                    const sign = q.change >= 0 ? '+' : '';
                    const isExpanded2 = expanded === q.label;
                    return (
                      <React.Fragment key={q.id}>
                        <tr
                          className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px] cursor-pointer ${isExpanded2 ? 'bg-[#f5f7fa]' : i % 2 ? 'bg-[#fafbfc]' : ''}`}
                          onClick={() => setExpanded(isExpanded2 ? null : q.label)}
                        >
                          <td className="px-3 py-2 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span className={`text-[10px] text-[#999] transition-transform inline-block ${isExpanded2 ? 'rotate-90' : ''}`}>&#9654;</span>
                              {q.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[12px] text-[#666] hidden md:table-cell">{COMPANY_NAMES[q.label] || ''}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">
                            ${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[12px] text-[#999] hidden sm:table-cell">
                            ${q.previousClose.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-3 py-2 text-right font-mono text-[12px] ${color}`}>{sign}{q.change.toFixed(2)}</td>
                          <td className={`px-3 py-2 text-right font-mono text-[12px] font-semibold ${color}`}>{sign}{q.changePct.toFixed(2)}%</td>
                        </tr>
                        {isExpanded2 && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <StockChart ticker={q.label} name={COMPANY_NAMES[q.label] || q.label} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
