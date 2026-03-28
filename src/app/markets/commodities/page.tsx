'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../MarketsHeader';
import ExportButton from '@/components/ExportButton';
import AnimatedPrice from '@/components/AnimatedPrice';
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
  price: number | null;
  previousClose: number | null;
  history: { year: number; value: number | null }[];
  intradayPoints: number[];
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

const SECTION_KEYWORDS: Record<string, string[]> = {
  'Energy': ['oil', 'crude', 'natural gas', 'energy', 'opec', 'petroleum', 'gasoline', 'fuel'],
  'Precious Metals': ['gold', 'silver', 'platinum', 'palladium', 'precious metal'],
  'Industrial Metals': ['copper', 'aluminum', 'steel', 'iron', 'lithium', 'nickel', 'zinc'],
  'Agriculture': ['wheat', 'corn', 'soybean', 'coffee', 'cotton', 'sugar', 'cocoa', 'grain', 'food', 'crop', 'agriculture', 'farm'],
};

function IntradaySparkline({ points, change }: { points: number[]; change: number | null }) {
  const w = 80, h = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pathPoints = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  }).join(' ');
  const color = change != null ? (change >= 0 ? '#16a34a' : '#dc2626') : '#3b82f6';
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={pathPoints} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
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

const COMMODITY_SECTIONS: { title: string; items: { id: string; label: string; slug: string }[] }[] = [
  {
    title: 'Energy',
    items: [
      { id: 'YF.CRUDE_OIL', label: 'WTI Crude Oil', slug: 'crude-oil' },
      { id: 'YF.BRENT', label: 'Brent Crude Oil', slug: 'brent' },
      { id: 'YF.NATGAS', label: 'Natural Gas', slug: 'natural-gas' },
      { id: 'YF.GASOLINE', label: 'Gasoline (RBOB)', slug: 'gasoline' },
      { id: 'YF.HEATING_OIL', label: 'Heating Oil', slug: 'heating-oil' },
    ],
  },
  {
    title: 'Precious Metals',
    items: [
      { id: 'YF.GOLD', label: 'Gold', slug: 'gold' },
      { id: 'YF.SILVER', label: 'Silver', slug: 'silver' },
      { id: 'YF.PLATINUM', label: 'Platinum', slug: 'platinum' },
      { id: 'YF.PALLADIUM', label: 'Palladium', slug: 'palladium' },
    ],
  },
  {
    title: 'Industrial Metals',
    items: [
      { id: 'YF.COPPER', label: 'Copper', slug: 'copper' },
      { id: 'YF.ALUMINUM', label: 'Aluminum', slug: 'aluminum' },
      { id: 'YF.STEEL', label: 'Steel (HRC)', slug: 'steel' },
      { id: 'YF.IRON_ORE', label: 'Iron Ore', slug: 'iron-ore' },
      { id: 'YF.NICKEL_ETC', label: 'Nickel (ETC)', slug: 'nickel' },
      { id: 'YF.ZINC_ETC', label: 'Zinc (ETC)', slug: 'zinc' },
    ],
  },
  {
    title: 'Grains',
    items: [
      { id: 'YF.WHEAT', label: 'Wheat (Chicago)', slug: 'wheat' },
      { id: 'YF.WHEAT_KC', label: 'Wheat (KC HRW)', slug: 'wheat-kc' },
      { id: 'YF.CORN', label: 'Corn', slug: 'corn' },
      { id: 'YF.SOYBEANS', label: 'Soybeans', slug: 'soybeans' },
      { id: 'YF.SOYBEAN_MEAL', label: 'Soybean Meal', slug: 'soybean-meal' },
      { id: 'YF.SOYBEAN_OIL', label: 'Soybean Oil', slug: 'soybean-oil' },
      { id: 'YF.OATS', label: 'Oats', slug: 'oats' },
      { id: 'YF.RICE', label: 'Rough Rice', slug: 'rice' },
    ],
  },
  {
    title: 'Softs',
    items: [
      { id: 'YF.COFFEE', label: 'Coffee', slug: 'coffee' },
      { id: 'YF.COCOA', label: 'Cocoa', slug: 'cocoa' },
      { id: 'YF.SUGAR', label: 'Sugar #11', slug: 'sugar' },
      { id: 'YF.COTTON', label: 'Cotton', slug: 'cotton' },
      { id: 'YF.OJ', label: 'Orange Juice', slug: 'orange-juice' },
      { id: 'YF.LUMBER', label: 'Lumber', slug: 'lumber' },
    ],
  },
  {
    title: 'Livestock',
    items: [
      { id: 'YF.LIVE_CATTLE', label: 'Live Cattle', slug: 'live-cattle' },
      { id: 'YF.LEAN_HOGS', label: 'Lean Hogs', slug: 'lean-hogs' },
      { id: 'YF.FEEDER_CATTLE', label: 'Feeder Cattle', slug: 'feeder-cattle' },
    ],
  },
  {
    title: 'Dairy',
    items: [
      { id: 'YF.MILK', label: 'Milk (Class III)', slug: 'milk' },
      { id: 'YF.BUTTER', label: 'Butter', slug: 'butter' },
      { id: 'YF.CHEESE', label: 'Cheese', slug: 'cheese' },
    ],
  },
  {
    title: 'China (SHFE/DCE/ZCE)',
    items: [
      { id: 'SINA.NICKEL', label: 'Nickel (SHFE)', slug: 'nickel-cn' },
      { id: 'SINA.ZINC', label: 'Zinc (SHFE)', slug: 'zinc-cn' },
      { id: 'SINA.TIN', label: 'Tin (SHFE)', slug: 'tin-cn' },
      { id: 'SINA.LEAD', label: 'Lead (SHFE)', slug: 'lead-cn' },
      { id: 'SINA.REBAR', label: 'Rebar Steel (SHFE)', slug: 'rebar-cn' },
      { id: 'SINA.STAINLESS', label: 'Stainless Steel (SHFE)', slug: 'stainless-cn' },
      { id: 'SINA.IRON_ORE_CN', label: 'Iron Ore (DCE)', slug: 'iron-ore-cn' },
      { id: 'SINA.COKING_COAL', label: 'Coking Coal (DCE)', slug: 'coking-coal' },
      { id: 'SINA.RUBBER', label: 'Rubber (SHFE)', slug: 'rubber' },
      { id: 'SINA.PALM_OIL', label: 'Palm Oil (DCE)', slug: 'palm-oil' },
      { id: 'SINA.METHANOL', label: 'Methanol (ZCE)', slug: 'methanol' },
      { id: 'SINA.UREA', label: 'Urea (ZCE)', slug: 'urea' },
      { id: 'SINA.SODA_ASH', label: 'Soda Ash (ZCE)', slug: 'soda-ash' },
      { id: 'SINA.GLASS', label: 'Glass (ZCE)', slug: 'glass' },
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
      className="flex items-center justify-between gap-3 px-3 py-2.5 border border-[#d5dce6] rounded-lg hover:border-[#ccc] hover:shadow-sm transition group"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[#0d1b2a] font-medium leading-tight truncate group-hover:text-[#0066cc] transition">
          {market.question}
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">
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
        <span className="text-[10px] text-[#94a3b8]">Polymarket</span>
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

  if (loading) return <div className="px-4 py-3 text-[11px] text-[#64748b]">Loading futures curve...</div>;
  if (!data || data.contracts.length < 2) return null;

  const structureColor = data.structure === 'backwardation' ? '#dc2626' : data.structure === 'contango' ? '#16a34a' : '#666';
  const structureLabel = data.structure === 'backwardation' ? 'Backwardation' : data.structure === 'contango' ? 'Contango' : 'Flat';

  return (
    <div className="border-t border-[#d5dce6] bg-white px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#0d1b2a]">Futures Curve</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: structureColor, backgroundColor: `${structureColor}12` }}>
            {structureLabel}
          </span>
        </div>
        <span className="text-[10px] text-[#94a3b8]">CME settlements via Yahoo Finance</span>
      </div>
      <p className="text-[11px] text-[#64748b] mb-3">{data.structureDescription}</p>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
        {data.contracts.map((c, i) => {
          const isFirst = i === 0;
          const changeColor = c.changeFromFront >= 0 ? '#16a34a' : '#dc2626';
          return (
            <div key={c.label} className={`border rounded-lg p-2 text-center ${isFirst ? 'border-[#0066cc] bg-[#f8fbff]' : 'border-[#d5dce6]'}`}>
              <div className="text-[10px] text-[#64748b] mb-0.5">{c.label}</div>
              <div className="text-[13px] font-mono font-semibold text-[#0d1b2a]">
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

function CommodityChart({ id, label, currency = '$' }: { id: string; label: string; currency?: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const endpoint = id.startsWith('SINA.') ? '/api/china-chart' : '/api/commodity-chart';
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchChart(range);
    const iv = setInterval(() => fetchChart(range, true), 30_000);
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
    <div className="border-t border-[#d5dce6] bg-[#fafbfd] px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#0d1b2a]">{label}</span>
          {points.length > 1 && (
            <span className={`text-[12px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}{changeAmt.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2 py-0.5 text-[11px] rounded ${
                range === r.key
                  ? 'bg-[#0d1b2a] text-white'
                  : 'bg-white border border-[#ddd] text-[#64748b] hover:bg-[#f0f0f0]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-[12px]">
          Loading chart...
        </div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-[12px]">
          No chart data available
        </div>
      ) : (() => {
        // Use log scale when data spans >10x range (e.g., gold $19 → $4500)
        const vals = points.map(p => p.value).filter(v => v > 0);
        const minVal = Math.min(...vals);
        const maxVal = Math.max(...vals);
        const useLog = (range === 'max' || range === '10y') && maxVal / minVal > 10;

        const chartData = useLog
          ? points.filter(p => p.value > 0).map(p => ({ ...p, logValue: Math.log10(p.value) }))
          : points;

        // Generate log-scale ticks (1, 2, 5, 10, 20, 50, 100, ...)
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

        const fmtPrice = (v: number) => v >= 10000 ? `${(v/1000).toFixed(0)}K` : v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v >= 1 ? v.toFixed(2) : v.toFixed(4);

        return (
        <div className="h-[200px]">
          {useLog && <div className="text-[9px] text-[#94a3b8] text-right pr-2 -mb-1">log scale</div>}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(date: string) => {
                  if (chartData.length > 0 && date === chartData[chartData.length - 1].date) return 'Today';
                  return formatXTick(date);
                }}
                tick={{ fontSize: 10, fill: '#999' }}
                tickLine={false}
                axisLine={{ stroke: '#e8e8e8' }}
                ticks={(() => {
                  if (chartData.length <= 2) return undefined;
                  const n = Math.min(10, chartData.length);
                  const step = Math.floor((chartData.length - 1) / n);
                  const ticks: string[] = [];
                  for (let i = 0; i < chartData.length - 1; i += step) {
                    ticks.push(chartData[i].date);
                  }
                  ticks.push(chartData[chartData.length - 1].date);
                  return ticks;
                })()}
              />
              <YAxis
                domain={useLog ? ['auto', 'auto'] : ['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#999' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => useLog ? fmtPrice(Math.pow(10, v)) : fmtPrice(v)}
                ticks={logTicks}
                width={65}
                label={{ value: currency === '$' ? 'USD' : currency, position: 'insideTopLeft', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint & { logValue?: number };
                  const actualValue = p.value;
                  const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                  const dateLabel = isISO
                    ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
                    : p.date;
                  return (
                    <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                      <div className="text-[#64748b] mb-0.5">{dateLabel}</div>
                      <div className="font-mono font-semibold text-[14px]">
                        {currency}{actualValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={useLog ? 'logValue' : 'value'}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${id})`}
                dot={false}
                activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        );
      })()}
    </div>
  );
}

export default function CommoditiesPage() {
  const [data, setData] = useState<Record<string, CommodityData>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionMarket[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Fetch live prices — Yahoo chart API for YF.* IDs, Sina Finance for SINA.* IDs
  const fetchPrices = useCallback(async () => {
    const allItems = COMMODITY_SECTIONS.flatMap(s => s.items);
    const yfItems = allItems.filter(i => !i.id.startsWith('SINA.'));
    const sinaItems = allItems.filter(i => i.id.startsWith('SINA.'));

    // Fetch YF and SINA data in parallel
    const [yfResults, sinaResults] = await Promise.all([
      // YF commodities: fetch 1D chart for each (price + sparkline)
      Promise.all(yfItems.map(async item => {
        try {
          const res = await fetch(`/api/commodity-chart?id=${encodeURIComponent(item.id)}&range=1d`);
          const json = await res.json();
          const price = json.regularMarketPrice ?? null;
          const previousClose = json.previousClose ?? null;
          const marketTime = json.regularMarketTime ?? null;
          const rawPoints = (json.points || []).map((p: { value: number }) => p.value);
          const intradayPoints = previousClose != null ? [previousClose, ...rawPoints] : rawPoints;
          return { id: item.id, label: item.label, price, previousClose, history: [] as any[], intradayPoints, marketTime };
        } catch {
          return { id: item.id, label: item.label, price: null, previousClose: null, history: [], intradayPoints: [] as number[], marketTime: null };
        }
      })),
      // SINA commodities: one quotes call + one chart call per item (all in parallel)
      (async () => {
        let sinaQuotes: Record<string, { price: number; previousClose: number }> = {};
        try {
          const qRes = await fetch('/api/china-quotes');
          const qData = await qRes.json();
          if (qData.quotes) sinaQuotes = qData.quotes;
        } catch {}

        return Promise.all(sinaItems.map(async item => {
          const sq = sinaQuotes[item.id];
          let intradayPoints: number[] = [];
          try {
            const chartRes = await fetch(`/api/china-chart?id=${encodeURIComponent(item.id)}&range=1d`);
            const chartJson = await chartRes.json();
            const rawPoints = (chartJson.points || []).map((p: { value: number }) => p.value);
            const prevClose = sq?.previousClose ?? chartJson.previousClose;
            intradayPoints = prevClose != null ? [prevClose, ...rawPoints] : rawPoints;
          } catch {}
          return { id: item.id, label: item.label, price: sq?.price ?? null, previousClose: sq?.previousClose ?? null, history: [] as any[], intradayPoints, marketTime: null };
        }));
      })(),
    ]);

    const results = [...yfResults, ...sinaResults];
    const d: Record<string, CommodityData> = {};
    let latestTime: string | null = null;
    for (const r of results) {
      d[r.id] = r;
      if (r.marketTime && (!latestTime || r.marketTime > latestTime)) latestTime = r.marketTime;
    }
    setData(d);
    setUpdatedAt(latestTime || new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 30_000);
    return () => clearInterval(iv);
  }, [fetchPrices]);

  useEffect(() => {
    fetch('/api/predictions?limit=200')
      .then(r => r.json())
      .then(d => setPredictions(d.markets || []))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading commodity prices...</div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <ExportButton
                filename={`sotw-commodities-${new Date().toISOString().slice(0, 10)}`}
                getData={() => ({
                  headers: ['Section', 'Commodity', 'Price', 'Change', '% Change'],
                  rows: COMMODITY_SECTIONS.flatMap(s => s.items.map(item => {
                    const d = data[item.id];
                    const chg = d?.price != null && d?.previousClose != null ? d.price - d.previousClose : null;
                    const chgPct = chg != null && d?.previousClose ? (chg / d.previousClose * 100) : null;
                    return [s.title, item.label, d?.price ?? null, chg ? +chg.toFixed(2) : null, chgPct ? +chgPct.toFixed(2) : null];
                  })),
                })}
              />
            </div>
            {COMMODITY_SECTIONS.map(section => (
              <div key={section.title}>
                <h2 className="text-[14px] font-semibold text-[#64748b] uppercase tracking-wider mb-3">{section.title}</h2>
                <div className="border border-[#d5dce6] rounded-lg overflow-hidden">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '21%' }} />
                    </colgroup>
                    <thead>
                      <tr className="text-[11px] text-[#64748b] uppercase tracking-wider bg-[#f4f6f9] border-b border-[#d5dce6]">
                        <th className="text-left px-3 py-2">Commodity</th>
                        <th className="text-right px-3 py-2">Price</th>
                        <th className="text-right px-3 py-2 hidden md:table-cell">Change</th>
                        <th className="text-right px-3 py-2 hidden md:table-cell">1D Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map(item => {
                        const d = data[item.id];
                        const isExpanded = expanded === item.id;
                        const change = (d?.price != null && d?.previousClose != null) ? d.price - d.previousClose : null;
                        const changePct = (change != null && d?.previousClose) ? (change / d.previousClose) * 100 : null;
                        const changeColor = change != null ? (change >= 0 ? 'text-green-600' : 'text-red-600') : '';
                        const isCN = item.id.startsWith('SINA.');
                        const curr = isCN ? '¥' : '$';
                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              className={`border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition text-[13px] cursor-pointer ${
                                isExpanded ? 'bg-[#f5f7fa]' : ''
                              }`}
                              onClick={() => setExpanded(isExpanded ? null : item.id)}
                            >
                              <td className="px-3 py-2">
                                <span className="flex items-center gap-1.5">
                                  <span className={`text-[10px] text-[#64748b] transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                                  <Link
                                    href={`/markets/commodities/${item.slug}`}
                                    className="text-[#0066cc] hover:underline font-medium"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {item.label}
                                  </Link>
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {d?.price != null ? <AnimatedPrice value={d.price} format={v => `${curr}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} /> : '—'}
                              </td>
                              <td className={`px-3 py-2 text-right font-mono hidden md:table-cell ${changeColor}`}>
                                {change != null ? (
                                  <>
                                    {change >= 0 ? '+' : ''}{change.toFixed(2)}
                                    {changePct != null && (
                                      <span className="text-[11px] ml-1">({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)</span>
                                    )}
                                  </>
                                ) : '—'}
                              </td>
                              <td className="px-3 py-2 text-right hidden md:table-cell">
                                {d?.intradayPoints && d.intradayPoints.length > 2 && (
                                  <div className="flex justify-end">
                                    <IntradaySparkline points={d.intradayPoints} change={change} />
                                  </div>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} className="p-0">
                                  <CommodityChart id={item.id} label={item.label} currency={curr} />
                                  {!isCN && <FuturesCurve id={item.id} />}
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

          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
