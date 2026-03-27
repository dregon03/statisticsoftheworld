'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../../MarketsHeader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartPoint { date: string; value: number; }
interface HistoryPoint { year: number; value: number | null; }
interface FuturesContract { label: string; price: number; changeFromFront: number; }
interface FuturesCurveData {
  commodity: string; label: string; contracts: FuturesContract[];
  structure: 'backwardation' | 'contango' | 'flat'; structureDescription: string;
}
interface IndicatorMeta {
  description?: string; methodology?: string; unit?: string;
  sourceName?: string; sourceUrl?: string; coverageStart?: number; coverageEnd?: number;
}

const SLUG_MAP: Record<string, { id: string; label: string; category: string }> = {
  // Energy
  'crude-oil': { id: 'YF.CRUDE_OIL', label: 'WTI Crude Oil', category: 'Energy' },
  'brent': { id: 'YF.BRENT', label: 'Brent Crude Oil', category: 'Energy' },
  'natural-gas': { id: 'YF.NATGAS', label: 'Natural Gas', category: 'Energy' },
  'gasoline': { id: 'YF.GASOLINE', label: 'Gasoline (RBOB)', category: 'Energy' },
  'heating-oil': { id: 'YF.HEATING_OIL', label: 'Heating Oil', category: 'Energy' },
  // Precious Metals
  'gold': { id: 'YF.GOLD', label: 'Gold', category: 'Precious Metals' },
  'silver': { id: 'YF.SILVER', label: 'Silver', category: 'Precious Metals' },
  'platinum': { id: 'YF.PLATINUM', label: 'Platinum', category: 'Precious Metals' },
  'palladium': { id: 'YF.PALLADIUM', label: 'Palladium', category: 'Precious Metals' },
  // Industrial Metals
  'copper': { id: 'YF.COPPER', label: 'Copper', category: 'Industrial Metals' },
  'aluminum': { id: 'YF.ALUMINUM', label: 'Aluminum', category: 'Industrial Metals' },
  'steel': { id: 'YF.STEEL', label: 'Steel (HRC)', category: 'Industrial Metals' },
  'iron-ore': { id: 'YF.IRON_ORE', label: 'Iron Ore', category: 'Industrial Metals' },
  'nickel': { id: 'YF.NICKEL_ETC', label: 'Nickel (ETC)', category: 'Industrial Metals' },
  'zinc': { id: 'YF.ZINC_ETC', label: 'Zinc (ETC)', category: 'Industrial Metals' },
  // Grains
  'wheat': { id: 'YF.WHEAT', label: 'Wheat (Chicago)', category: 'Grains' },
  'wheat-kc': { id: 'YF.WHEAT_KC', label: 'Wheat (KC HRW)', category: 'Grains' },
  'corn': { id: 'YF.CORN', label: 'Corn', category: 'Grains' },
  'soybeans': { id: 'YF.SOYBEANS', label: 'Soybeans', category: 'Grains' },
  'soybean-meal': { id: 'YF.SOYBEAN_MEAL', label: 'Soybean Meal', category: 'Grains' },
  'soybean-oil': { id: 'YF.SOYBEAN_OIL', label: 'Soybean Oil', category: 'Grains' },
  'oats': { id: 'YF.OATS', label: 'Oats', category: 'Grains' },
  'rice': { id: 'YF.RICE', label: 'Rough Rice', category: 'Grains' },
  // Softs
  'coffee': { id: 'YF.COFFEE', label: 'Coffee', category: 'Softs' },
  'cocoa': { id: 'YF.COCOA', label: 'Cocoa', category: 'Softs' },
  'sugar': { id: 'YF.SUGAR', label: 'Sugar #11', category: 'Softs' },
  'cotton': { id: 'YF.COTTON', label: 'Cotton', category: 'Softs' },
  'orange-juice': { id: 'YF.OJ', label: 'Orange Juice', category: 'Softs' },
  'lumber': { id: 'YF.LUMBER', label: 'Lumber', category: 'Softs' },
  // Livestock
  'live-cattle': { id: 'YF.LIVE_CATTLE', label: 'Live Cattle', category: 'Livestock' },
  'lean-hogs': { id: 'YF.LEAN_HOGS', label: 'Lean Hogs', category: 'Livestock' },
  'feeder-cattle': { id: 'YF.FEEDER_CATTLE', label: 'Feeder Cattle', category: 'Livestock' },
  // Dairy
  'milk': { id: 'YF.MILK', label: 'Milk (Class III)', category: 'Dairy' },
  'butter': { id: 'YF.BUTTER', label: 'Butter', category: 'Dairy' },
  'cheese': { id: 'YF.CHEESE', label: 'Cheese', category: 'Dairy' },
  // China (SHFE/DCE/ZCE)
  'nickel-cn': { id: 'SINA.NICKEL', label: 'Nickel (SHFE)', category: 'China (SHFE)' },
  'zinc-cn': { id: 'SINA.ZINC', label: 'Zinc (SHFE)', category: 'China (SHFE)' },
  'tin-cn': { id: 'SINA.TIN', label: 'Tin (SHFE)', category: 'China (SHFE)' },
  'lead-cn': { id: 'SINA.LEAD', label: 'Lead (SHFE)', category: 'China (SHFE)' },
  'rebar-cn': { id: 'SINA.REBAR', label: 'Rebar Steel (SHFE)', category: 'China (SHFE)' },
  'stainless-cn': { id: 'SINA.STAINLESS', label: 'Stainless Steel (SHFE)', category: 'China (SHFE)' },
  'iron-ore-cn': { id: 'SINA.IRON_ORE_CN', label: 'Iron Ore (DCE)', category: 'China (DCE)' },
  'coking-coal': { id: 'SINA.COKING_COAL', label: 'Coking Coal (DCE)', category: 'China (DCE)' },
  'rubber': { id: 'SINA.RUBBER', label: 'Rubber (SHFE)', category: 'China (SHFE)' },
  'palm-oil': { id: 'SINA.PALM_OIL', label: 'Palm Oil (DCE)', category: 'China (DCE)' },
  'methanol': { id: 'SINA.METHANOL', label: 'Methanol (ZCE)', category: 'China (ZCE)' },
  'urea': { id: 'SINA.UREA', label: 'Urea (ZCE)', category: 'China (ZCE)' },
  'soda-ash': { id: 'SINA.SODA_ASH', label: 'Soda Ash (ZCE)', category: 'China (ZCE)' },
  'glass': { id: 'SINA.GLASS', label: 'Glass (ZCE)', category: 'China (ZCE)' },
};

const RANGES = [
  { key: '1d', label: '1D' }, { key: '5d', label: '5D' },
  { key: '1mo', label: '1M' }, { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' }, { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
  { key: 'max', label: 'All' },
] as const;

function fmt(v: number | null, currency = '$') {
  if (v == null) return '—';
  return currency + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  if (loading) return <div className="py-3 text-[11px] text-[#64748b]">Loading futures curve...</div>;
  if (!data || data.contracts.length < 2) return null;
  const sc = data.structure === 'backwardation' ? '#dc2626' : data.structure === 'contango' ? '#16a34a' : '#666';
  const sl = data.structure === 'backwardation' ? 'Backwardation' : data.structure === 'contango' ? 'Contango' : 'Flat';
  return (
    <div className="border border-[#d5dce6] rounded-lg p-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#0d1b2a]">Futures Curve</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: sc, backgroundColor: `${sc}12` }}>{sl}</span>
        </div>
        <span className="text-[10px] text-[#94a3b8]">CME settlements via Yahoo Finance</span>
      </div>
      <p className="text-[11px] text-[#64748b] mb-3">{data.structureDescription}</p>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
        {data.contracts.map((c, i) => {
          const isFirst = i === 0;
          const cc = c.changeFromFront >= 0 ? '#16a34a' : '#dc2626';
          return (
            <div key={c.label} className={`border rounded-lg p-2 text-center ${isFirst ? 'border-[#0066cc] bg-[#f8fbff]' : 'border-[#d5dce6]'}`}>
              <div className="text-[10px] text-[#64748b] mb-0.5">{c.label}</div>
              <div className="text-[13px] font-mono font-semibold text-[#0d1b2a]">${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              {!isFirst && <div className="text-[9px] font-mono" style={{ color: cc }}>{c.changeFromFront >= 0 ? '+' : ''}{c.changeFromFront.toFixed(1)}%</div>}
              {isFirst && <div className="text-[9px] text-[#0066cc] font-semibold">SPOT</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CommodityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const commodity = SLUG_MAP[slug];

  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [meta, setMeta] = useState<IndicatorMeta | null>(null);

  const isCN = commodity?.id.startsWith('SINA.') ?? false;
  const curr = isCN ? '¥' : '$';

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!commodity) return;
    if (!silent) setLoading(true);
    try {
      const endpoint = commodity.id.startsWith('SINA.') ? '/api/china-chart' : '/api/commodity-chart';
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(commodity.id)}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch { if (!silent) setPoints([]); }
    if (!silent) setLoading(false);
  }, [commodity]);

  useEffect(() => {
    fetchChart(range);
    const iv = setInterval(() => fetchChart(range, true), 30_000);
    return () => clearInterval(iv);
  }, [range, fetchChart]);

  // Fetch historical annual data + meta
  useEffect(() => {
    if (!commodity) return;
    fetch(`/api/history?indicator=${encodeURIComponent(commodity.id)}&country=WLD`)
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setHistory(d); }).catch(() => {});
    fetch(`/api/indicator-meta?id=${encodeURIComponent(commodity.id)}`)
      .then(r => r.json()).then(d => { if (d && !d.error) setMeta(d); }).catch(() => {});
  }, [commodity]);

  if (!commodity) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
        <Nav />
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <MarketsHeader />
          <div className="text-center py-20 text-[#64748b]">Commodity not found</div>
        </div>
        <Footer />
      </main>
    );
  }

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAmt = first && last ? last - first : 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const isUp = changeAmt >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';

  // Compute stats from history
  const validHistory = history.filter(d => d.value != null) as { year: number; value: number }[];
  const latestH = validHistory[validHistory.length - 1];
  const prevH = validHistory.length >= 2 ? validHistory[validHistory.length - 2] : null;
  const yoyChange = latestH && prevH && prevH.value !== 0 ? ((latestH.value - prevH.value) / Math.abs(prevH.value)) * 100 : null;
  const maxH = validHistory.reduce((a, b) => b.value > a.value ? b : a, validHistory[0] || { year: 0, value: 0 });
  const minH = validHistory.reduce((a, b) => b.value < a.value ? b : a, validHistory[0] || { year: 0, value: Infinity });
  const cagr = validHistory.length >= 2
    ? (Math.pow(validHistory[validHistory.length - 1].value / validHistory[0].value, 1 / (validHistory.length - 1)) - 1) * 100
    : null;

  const formatXTick = (date: string) => {
    if (range === '1d' || range === '5d') return date.replace(/,.*,/, ',').split(', ').pop() || date;
    const d = new Date(date + 'T12:00:00');
    if (range === '5y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader />

        {/* Breadcrumb */}
        <div className="text-[12px] text-[#64748b] mb-4">
          <Link href="/markets/commodities" className="hover:text-[#0d1b2a] transition">Commodities</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#0d1b2a]">{commodity.label}</span>
        </div>

        {/* Title + Price */}
        <div className="mb-6">
          <h2 className="text-[22px] font-bold">{commodity.label}</h2>
          <div className="text-[12px] text-[#64748b] mt-0.5">Category: {commodity.category}</div>
          {last != null && (
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-[28px] font-bold font-mono">{fmt(last, curr)}</span>
              {points.length > 1 && (
                <span className={`text-[14px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {isUp ? '+' : ''}{changeAmt.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Summary stats cards */}
        {validHistory.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">
                {latestH?.year === new Date().getFullYear() ? 'Latest Close' : 'Year-End Close'}
              </div>
              <div className="text-xl font-bold text-blue-600">{fmt(latestH?.value, curr)}</div>
              <div className="text-xs text-gray-400">{latestH?.year}</div>
            </div>
            {yoyChange != null && (
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">YoY Change</div>
                <div className={`text-xl font-bold ${yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">{prevH?.year} → {latestH?.year}</div>
              </div>
            )}
            {maxH && (
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Maximum</div>
                <div className="text-lg font-bold text-gray-900">{fmt(maxH.value, curr)}</div>
                <div className="text-xs text-gray-400">{maxH.year}</div>
              </div>
            )}
            {minH && minH.value !== Infinity && (
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Minimum</div>
                <div className="text-lg font-bold text-gray-900">{fmt(minH.value, curr)}</div>
                <div className="text-xs text-gray-400">{minH.year}</div>
              </div>
            )}
            {cagr != null && (
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">CAGR</div>
                <div className={`text-xl font-bold ${cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cagr >= 0 ? '+' : ''}{cagr.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">{validHistory.length} years</div>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        {validHistory.length > 0 && (
          <div className="flex flex-wrap gap-0 border border-gray-100 rounded-xl overflow-hidden mb-6">
            {[
              { label: 'Last', val: fmt(latestH?.value, curr) },
              { label: 'Previous', val: fmt(prevH?.value ?? null, curr) },
              { label: 'Highest', val: fmt(maxH?.value, curr) },
              { label: 'Lowest', val: minH?.value !== Infinity ? fmt(minH?.value, curr) : '—' },
              { label: 'Unit', val: meta?.unit || 'USD' },
              { label: 'Source', val: meta?.sourceName || 'Yahoo Finance' },
            ].map((s, i) => (
              <div key={s.label} className={`flex-1 min-w-[120px] px-4 py-3 ${i > 0 ? 'border-l border-gray-100' : ''}`}>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</div>
                <div className="text-[13px] font-semibold text-gray-900 mt-0.5">{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-semibold">Daily Price Chart</span>
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button key={r.key} onClick={() => setRange(r.key)}
                className={`px-3 py-1 text-[12px] rounded ${range === r.key ? 'bg-[#0d1b2a] text-white' : 'bg-white border border-[#ddd] text-[#64748b] hover:bg-[#f0f0f0]'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-[#64748b] text-[13px] border border-[#d5dce6] rounded-lg">Loading chart...</div>
        ) : points.length < 2 ? (
          <div className="h-[350px] flex items-center justify-center text-[#64748b] text-[13px] border border-[#d5dce6] rounded-lg">No chart data available</div>
        ) : (
          <div className="h-[350px] border border-[#d5dce6] rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
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
                  tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }}
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
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v.toLocaleString()} width={65} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint;
                  const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                  const dateLabel = isISO
                    ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
                    : p.date;
                  return (
                    <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                      <div className="text-[#64748b] mb-0.5">{dateLabel}</div>
                      <div className="font-mono font-semibold text-[15px]">{fmt(p.value, curr)}</div>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill="url(#detailGrad)" dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="text-[11px] text-[#64748b] mt-2">
          {points.length > 0 && `${points.length} data points`} · Source: {isCN ? 'Sina Finance' : 'Yahoo Finance (15-min delayed)'} · Auto-refreshes every 30s
        </div>

        {/* Futures Curve (YF commodities only) */}
        {!isCN && <FuturesCurve id={commodity.id} />}

        {/* Historical Data Table */}
        {validHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Historical Data</h2>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-5 py-2.5">Year</th>
                    <th className="px-5 py-2.5 text-right">Value</th>
                    <th className="px-5 py-2.5 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[...validHistory].reverse().map((d, i, arr) => {
                    const prev = arr[i + 1];
                    const change = prev && d.value != null && prev.value != null && prev.value !== 0
                      ? ((d.value - prev.value) / Math.abs(prev.value)) * 100 : null;
                    return (
                      <tr key={d.year} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-5 py-2.5 text-sm font-medium">{d.year}</td>
                        <td className="px-5 py-2.5 text-right font-mono text-sm">{fmt(d.value, curr)}</td>
                        <td className="px-5 py-2.5 text-right text-sm">
                          {change != null && (
                            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* About This Indicator */}
        {meta && (meta.description || meta.unit) && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">About This Indicator</h2>
            <div className="border border-gray-100 rounded-xl p-6 space-y-4">
              {meta.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Definition</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
                </div>
              )}
              {meta.unit && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Unit</h3>
                  <p className="text-sm text-gray-600">{meta.unit}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-6 text-xs text-gray-400 pt-2 border-t border-gray-100">
                {meta.sourceName && <span>Source: {meta.sourceName}</span>}
                {meta.coverageStart && meta.coverageEnd && <span>Coverage: {meta.coverageStart}–{meta.coverageEnd}</span>}
                {meta.sourceUrl && (
                  <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition">View original source →</a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
