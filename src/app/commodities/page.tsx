'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { formatValue } from '@/lib/data';
import SparklineChart from '@/components/charts/SparklineChart';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface CommodityData {
  id: string;
  label: string;
  value: number | null;
  year: string;
  history: { year: number; value: number | null }[];
}

interface ChartPoint {
  date: string;
  value: number;
}

interface FuturesContract {
  label: string;
  price: number;
  changeFromFront: number;
}

interface FuturesCurveData {
  commodity: string;
  label: string;
  contracts: FuturesContract[];
  structure: 'backwardation' | 'contango' | 'flat';
  structureDescription: string;
}

interface PredictionMarket {
  id: string;
  question: string;
  slug: string;
  probability: number;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  liquidity: number;
  endDate: string;
  category: string;
  url: string;
}

// Keywords to match Polymarket markets to commodity sections
const SECTION_KEYWORDS: Record<string, string[]> = {
  'Energy': ['oil', 'crude', 'natural gas', 'energy', 'opec', 'petroleum', 'gasoline', 'fuel'],
  'Precious Metals': ['gold', 'silver', 'platinum', 'palladium', 'precious metal'],
  'Industrial Metals': ['copper', 'aluminum', 'steel', 'iron', 'lithium', 'nickel', 'zinc'],
  'Agriculture': ['wheat', 'corn', 'soybean', 'coffee', 'cotton', 'sugar', 'cocoa', 'grain', 'food', 'crop', 'agriculture', 'farm'],
  'Crypto': ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'solana', 'hype'],
  'Trade & Tariffs': ['tariff', 'trade war', 'sanctions', 'import', 'export', 'customs'],
};

const RANGES = [
  { key: '1mo', label: '1M' },
  { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' },
  { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
] as const;

const COMMODITY_SECTIONS: { title: string; items: { id: string; label: string }[] }[] = [
  {
    title: 'Energy',
    items: [
      { id: 'YF.CRUDE_OIL', label: 'WTI Crude Oil' },
      { id: 'YF.BRENT', label: 'Brent Crude Oil' },
      { id: 'YF.NATGAS', label: 'Natural Gas' },
    ],
  },
  {
    title: 'Precious Metals',
    items: [
      { id: 'YF.GOLD', label: 'Gold' },
      { id: 'YF.SILVER', label: 'Silver' },
      { id: 'YF.PLATINUM', label: 'Platinum' },
      { id: 'YF.PALLADIUM', label: 'Palladium' },
    ],
  },
  {
    title: 'Industrial Metals',
    items: [
      { id: 'YF.COPPER', label: 'Copper' },
      { id: 'AV.ALUMINUM', label: 'Aluminum' },
    ],
  },
  {
    title: 'Agriculture',
    items: [
      { id: 'YF.WHEAT', label: 'Wheat' },
      { id: 'YF.CORN', label: 'Corn' },
      { id: 'YF.SOYBEANS', label: 'Soybeans' },
      { id: 'YF.COFFEE', label: 'Coffee' },
      { id: 'YF.COTTON', label: 'Cotton' },
      { id: 'YF.SUGAR', label: 'Sugar' },
      { id: 'YF.COCOA', label: 'Cocoa' },
    ],
  },
];

function PredictionCard({ market }: { market: PredictionMarket }) {
  const pct = Math.round(market.probability * 100);
  const vol = market.volume >= 1e6 ? `$${(market.volume / 1e6).toFixed(1)}M` : market.volume >= 1e3 ? `$${(market.volume / 1e3).toFixed(0)}K` : `$${market.volume.toFixed(0)}`;
  const end = market.endDate ? new Date(market.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';

  return (
    <a
      href={market.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2.5 border border-[#e8e8e8] rounded-lg hover:border-[#ccc] hover:shadow-sm transition group"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[#333] font-medium leading-tight truncate group-hover:text-[#0066cc] transition">
          {market.question}
        </div>
        <div className="text-[10px] text-[#999] mt-0.5">
          Vol: {vol}{end ? ` · Resolves ${end}` : ''}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: pct >= 50 ? '#16a34a' : '#dc2626' }}
          />
        </div>
        <span className="text-[13px] font-bold tabular-nums" style={{ color: pct >= 50 ? '#16a34a' : '#dc2626', minWidth: 36, textAlign: 'right' }}>
          {pct}%
        </span>
      </div>
    </a>
  );
}

function SectionPredictions({ sectionTitle, markets }: { sectionTitle: string; markets: PredictionMarket[] }) {
  const keywords = SECTION_KEYWORDS[sectionTitle] || [];
  const matched = markets.filter(m => {
    const q = m.question.toLowerCase();
    return keywords.some(kw => q.includes(kw));
  });

  if (matched.length === 0) return null;

  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c3aed]">&#x1F52E; Market Predictions</span>
        <span className="text-[10px] text-[#ccc]">Polymarket</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {matched.slice(0, 4).map(m => <PredictionCard key={m.id} market={m} />)}
      </div>
    </div>
  );
}

function FuturesCurve({ id }: { id: string }) {
  const [data, setData] = useState<FuturesCurveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/futures-curve?id=${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="px-4 py-3 text-[11px] text-[#999]">Loading futures curve...</div>;
  if (!data || data.contracts.length < 2) return null;

  const structureColor = data.structure === 'backwardation' ? '#dc2626' : data.structure === 'contango' ? '#16a34a' : '#666';
  const structureLabel = data.structure === 'backwardation' ? 'Backwardation' : data.structure === 'contango' ? 'Contango' : 'Flat';

  return (
    <div className="border-t border-[#e8e8e8] bg-white px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#333]">Futures Curve</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: structureColor, backgroundColor: `${structureColor}12` }}>
            {structureLabel}
          </span>
        </div>
        <span className="text-[10px] text-[#ccc]">CME settlements via Yahoo Finance</span>
      </div>
      <p className="text-[11px] text-[#999] mb-3">{data.structureDescription}</p>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
        {data.contracts.map((c, i) => {
          const isFirst = i === 0;
          const changeColor = c.changeFromFront >= 0 ? '#16a34a' : '#dc2626';
          return (
            <div key={c.label} className={`border rounded-lg p-2 text-center ${isFirst ? 'border-[#0066cc] bg-[#f8fbff]' : 'border-[#e8e8e8]'}`}>
              <div className="text-[10px] text-[#999] mb-0.5">{c.label}</div>
              <div className="text-[13px] font-mono font-semibold text-[#333]">
                ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {!isFirst && (
                <div className="text-[9px] font-mono" style={{ color: changeColor }}>
                  {c.changeFromFront >= 0 ? '+' : ''}{c.changeFromFront.toFixed(1)}%
                </div>
              )}
              {isFirst && <div className="text-[9px] text-[#0066cc] font-semibold">SPOT</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommodityChart({ id, label }: { id: string; label: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/commodity-chart?id=${encodeURIComponent(id)}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      setPoints([]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchChart(range);
  }, [range, fetchChart]);

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAmt = first && last ? last - first : 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const isUp = changeAmt >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';

  // Format tick labels based on range
  const formatXTick = (date: string) => {
    const d = new Date(date);
    if (range === '5y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    if (range === '1y' || range === '6mo') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-t border-[#e8e8e8] bg-[#fafbfc] px-4 py-4">
      {/* Range selector */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#333]">{label}</span>
          {points.length > 1 && (
            <span className={`text-[12px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}{changeAmt.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2 py-0.5 text-[11px] rounded ${
                range === r.key
                  ? 'bg-[#0066cc] text-white'
                  : 'bg-white border border-[#ddd] text-[#666] hover:bg-[#f0f0f0]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[12px]">
          Loading chart...
        </div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#999] text-[12px]">
          No chart data available
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXTick}
                tick={{ fontSize: 10, fill: '#999' }}
                tickLine={false}
                axisLine={{ stroke: '#e8e8e8' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#999' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => v.toLocaleString()}
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint;
                  const d = new Date(p.date);
                  return (
                    <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                      <div className="text-[#999] mb-0.5">
                        {d.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="font-mono font-semibold text-[14px]">
                        ${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${id})`}
                dot={false}
                activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function CommoditiesPage() {
  const [data, setData] = useState<Record<string, CommodityData>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionMarket[]>([]);

  useEffect(() => {
    const allIds = COMMODITY_SECTIONS.flatMap(s => s.items.map(i => i.id));

    Promise.all(
      allIds.map(async id => {
        const [latest, history] = await Promise.all([
          fetch(`/api/indicator?id=${encodeURIComponent(id)}`).then(r => r.json()).catch(() => []),
          fetch(`/api/history?indicator=${encodeURIComponent(id)}&country=WLD`).then(r => r.json()).catch(() => []),
        ]);
        const entry = latest?.[0];
        const item = COMMODITY_SECTIONS.flatMap(s => s.items).find(i => i.id === id);
        return {
          id,
          label: item?.label || id,
          value: entry?.value || null,
          year: entry?.year || '',
          history: Array.isArray(history) ? history : [],
        };
      })
    ).then(results => {
      const d: Record<string, CommodityData> = {};
      for (const r of results) d[r.id] = r;
      setData(d);
      setLoading(false);
    });

    // Fetch prediction markets
    fetch('/api/predictions?limit=200')
      .then(r => r.json())
      .then(d => setPredictions(d.markets || []))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-[24px] font-bold mb-1">Commodities</h1>
        <p className="text-[13px] text-[#999] mb-6">
          Energy, metals, and agricultural commodity prices. Click any row to view interactive daily chart.
        </p>

        {loading ? (
          <div className="text-center py-20 text-[#999]">Loading commodity prices...</div>
        ) : (
          <div className="space-y-8">
            {COMMODITY_SECTIONS.map(section => (
              <div key={section.title}>
                <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider mb-3">{section.title}</h2>
                <div className="border border-[#e8e8e8] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[11px] text-[#999] uppercase tracking-wider bg-[#f8f9fa] border-b border-[#e8e8e8]">
                        <th className="text-left px-3 py-2">Commodity</th>
                        <th className="text-right px-3 py-2">Price</th>
                        <th className="text-right px-3 py-2 w-[100px] hidden md:table-cell">Trend</th>
                        <th className="text-right px-3 py-2">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map(item => {
                        const d = data[item.id];
                        const isExpanded = expanded === item.id;
                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fa] transition text-[13px] cursor-pointer ${
                                isExpanded ? 'bg-[#f5f7fa]' : ''
                              }`}
                              onClick={() => setExpanded(isExpanded ? null : item.id)}
                            >
                              <td className="px-3 py-2">
                                <span className="flex items-center gap-1.5">
                                  <span className={`text-[10px] text-[#999] transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                  <Link
                                    href={`/country/WLD/${encodeURIComponent(item.id)}`}
                                    className="text-[#0066cc] hover:underline font-medium"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {item.label}
                                  </Link>
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {d?.value ? formatValue(d.value, 'currency', 2) : '—'}
                              </td>
                              <td className="px-3 py-2 text-right hidden md:table-cell">
                                {d?.history && d.history.length > 2 && (
                                  <div className="flex justify-end">
                                    <SparklineChart data={d.history} width={80} height={24} />
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right text-[#999]">{d?.year || '—'}</td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} className="p-0">
                                  <CommodityChart id={item.id} label={item.label} />
                                  <FuturesCurve id={item.id} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <SectionPredictions sectionTitle={section.title} markets={predictions} />
              </div>
            ))}

            {/* Crypto & Trade prediction markets */}
            {predictions.length > 0 && (
              <>
                {(() => {
                  const cryptoKeywords = SECTION_KEYWORDS['Crypto'] || [];
                  const tradeKeywords = SECTION_KEYWORDS['Trade & Tariffs'] || [];
                  const allKw = [...cryptoKeywords, ...tradeKeywords];
                  const matched = predictions.filter(m => {
                    const q = m.question.toLowerCase();
                    return allKw.some(kw => q.includes(kw));
                  });
                  if (matched.length === 0) return null;
                  return (
                    <div>
                      <h2 className="text-[14px] font-semibold text-[#666] uppercase tracking-wider mb-3">
                        &#x1F52E; Crypto & Trade Predictions
                      </h2>
                      <p className="text-[12px] text-[#999] mb-3">
                        Live prediction market odds from <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">Polymarket</a>. Real-money forecasts on crypto prices, tariffs, and trade.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {matched.slice(0, 8).map(m => <PredictionCard key={m.id} market={m} />)}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
