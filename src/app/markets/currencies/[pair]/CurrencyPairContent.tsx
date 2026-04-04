'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MarketsHeader from '../../MarketsHeader';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

interface ChartPoint { date: string; value: number }

const PAIR_MAP: Record<string, { label: string; base: string; quote: string; flag: string; decimals: number }> = {
  // G10
  'eurusd': { label: 'EUR/USD', base: 'EUR', quote: 'USD', flag: 'eu', decimals: 4 },
  'gbpusd': { label: 'GBP/USD', base: 'GBP', quote: 'USD', flag: 'gb', decimals: 4 },
  'usdjpy': { label: 'USD/JPY', base: 'USD', quote: 'JPY', flag: 'jp', decimals: 2 },
  'usdchf': { label: 'USD/CHF', base: 'USD', quote: 'CHF', flag: 'ch', decimals: 4 },
  'usdcad': { label: 'USD/CAD', base: 'USD', quote: 'CAD', flag: 'ca', decimals: 4 },
  'audusd': { label: 'AUD/USD', base: 'AUD', quote: 'USD', flag: 'au', decimals: 4 },
  'nzdusd': { label: 'NZD/USD', base: 'NZD', quote: 'USD', flag: 'nz', decimals: 4 },
  'usdsek': { label: 'USD/SEK', base: 'USD', quote: 'SEK', flag: 'se', decimals: 4 },
  'usdnok': { label: 'USD/NOK', base: 'USD', quote: 'NOK', flag: 'no', decimals: 4 },
  // Europe
  'usddkk': { label: 'USD/DKK', base: 'USD', quote: 'DKK', flag: 'dk', decimals: 4 },
  'usdpln': { label: 'USD/PLN', base: 'USD', quote: 'PLN', flag: 'pl', decimals: 4 },
  'usdczk': { label: 'USD/CZK', base: 'USD', quote: 'CZK', flag: 'cz', decimals: 4 },
  'usdhuf': { label: 'USD/HUF', base: 'USD', quote: 'HUF', flag: 'hu', decimals: 2 },
  'usdron': { label: 'USD/RON', base: 'USD', quote: 'RON', flag: 'ro', decimals: 4 },
  'usdtry': { label: 'USD/TRY', base: 'USD', quote: 'TRY', flag: 'tr', decimals: 4 },
  'usdrub': { label: 'USD/RUB', base: 'USD', quote: 'RUB', flag: 'ru', decimals: 2 },
  'usduah': { label: 'USD/UAH', base: 'USD', quote: 'UAH', flag: 'ua', decimals: 2 },
  'usdisk': { label: 'USD/ISK', base: 'USD', quote: 'ISK', flag: 'is', decimals: 2 },
  // Asia-Pacific
  'usdcny': { label: 'USD/CNY', base: 'USD', quote: 'CNY', flag: 'cn', decimals: 4 },
  'usdhkd': { label: 'USD/HKD', base: 'USD', quote: 'HKD', flag: 'hk', decimals: 4 },
  'usdtwd': { label: 'USD/TWD', base: 'USD', quote: 'TWD', flag: 'tw', decimals: 2 },
  'usdkrw': { label: 'USD/KRW', base: 'USD', quote: 'KRW', flag: 'kr', decimals: 2 },
  'usdsgd': { label: 'USD/SGD', base: 'USD', quote: 'SGD', flag: 'sg', decimals: 4 },
  'usdinr': { label: 'USD/INR', base: 'USD', quote: 'INR', flag: 'in', decimals: 2 },
  'usdphp': { label: 'USD/PHP', base: 'USD', quote: 'PHP', flag: 'ph', decimals: 2 },
  'usdthb': { label: 'USD/THB', base: 'USD', quote: 'THB', flag: 'th', decimals: 4 },
  'usdidr': { label: 'USD/IDR', base: 'USD', quote: 'IDR', flag: 'id', decimals: 0 },
  'usdmyr': { label: 'USD/MYR', base: 'USD', quote: 'MYR', flag: 'my', decimals: 4 },
  'usdvnd': { label: 'USD/VND', base: 'USD', quote: 'VND', flag: 'vn', decimals: 0 },
  'usdpkr': { label: 'USD/PKR', base: 'USD', quote: 'PKR', flag: 'pk', decimals: 2 },
  'usdbdt': { label: 'USD/BDT', base: 'USD', quote: 'BDT', flag: 'bd', decimals: 2 },
  'usdlkr': { label: 'USD/LKR', base: 'USD', quote: 'LKR', flag: 'lk', decimals: 2 },
  // Americas
  'usdbrl': { label: 'USD/BRL', base: 'USD', quote: 'BRL', flag: 'br', decimals: 4 },
  'usdmxn': { label: 'USD/MXN', base: 'USD', quote: 'MXN', flag: 'mx', decimals: 4 },
  'usdars': { label: 'USD/ARS', base: 'USD', quote: 'ARS', flag: 'ar', decimals: 2 },
  'usdclp': { label: 'USD/CLP', base: 'USD', quote: 'CLP', flag: 'cl', decimals: 2 },
  'usdcop': { label: 'USD/COP', base: 'USD', quote: 'COP', flag: 'co', decimals: 0 },
  'usdpen': { label: 'USD/PEN', base: 'USD', quote: 'PEN', flag: 'pe', decimals: 4 },
  'usduyu': { label: 'USD/UYU', base: 'USD', quote: 'UYU', flag: 'uy', decimals: 2 },
  // Middle East & Africa
  'usdaed': { label: 'USD/AED', base: 'USD', quote: 'AED', flag: 'ae', decimals: 4 },
  'usdsar': { label: 'USD/SAR', base: 'USD', quote: 'SAR', flag: 'sa', decimals: 4 },
  'usdils': { label: 'USD/ILS', base: 'USD', quote: 'ILS', flag: 'il', decimals: 4 },
  'usdegp': { label: 'USD/EGP', base: 'USD', quote: 'EGP', flag: 'eg', decimals: 2 },
  'usdzar': { label: 'USD/ZAR', base: 'USD', quote: 'ZAR', flag: 'za', decimals: 4 },
  'usdngn': { label: 'USD/NGN', base: 'USD', quote: 'NGN', flag: 'ng', decimals: 2 },
  'usdkes': { label: 'USD/KES', base: 'USD', quote: 'KES', flag: 'ke', decimals: 2 },
  'usdghs': { label: 'USD/GHS', base: 'USD', quote: 'GHS', flag: 'gh', decimals: 2 },
  'usdmad': { label: 'USD/MAD', base: 'USD', quote: 'MAD', flag: 'ma', decimals: 4 },
  'usdtnd': { label: 'USD/TND', base: 'USD', quote: 'TND', flag: 'tn', decimals: 4 },
};

const RANGES = [
  { key: '1d', label: '1D' }, { key: '5d', label: '5D' },
  { key: '1mo', label: '1M' }, { key: '3mo', label: '3M' },
  { key: '6mo', label: '6M' }, { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1Y' }, { key: '2y', label: '2Y' },
  { key: '5y', label: '5Y' }, { key: '10y', label: '10Y' },
  { key: 'max', label: 'All' },
] as const;

export default function CurrencyPairContent({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = use(params);
  const info = PAIR_MAP[slug.toLowerCase()];
  const apiPair = slug.toUpperCase();

  const [range, setRange] = useState('1y');
  const [annualHistory, setAnnualHistory] = useState<{ year: number; value: number; change: number | null }[]>([]);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/fx-chart?pair=${apiPair}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch { if (!silent) setPoints([]); }
    if (!silent) setLoading(false);
  }, [apiPair]);

  useEffect(() => {
    fetchChart(range);
    const iv = setInterval(() => fetchChart(range, true), 30_000);
    return () => clearInterval(iv);
  }, [range, fetchChart]);

  // Fetch full history for annual table
  useEffect(() => {
    fetch(`/api/fx-chart?pair=${apiPair}&range=max`)
      .then(r => r.json())
      .then(data => {
        const pts: ChartPoint[] = data.points || [];
        if (pts.length < 2) return;
        const byYear = new Map<number, number>();
        for (const pt of pts) {
          const year = parseInt(pt.date.substring(0, 4));
          if (year > 0 && pt.value > 0) byYear.set(year, pt.value);
        }
        const sorted = Array.from(byYear.entries()).sort((a, b) => b[0] - a[0]);
        setAnnualHistory(sorted.map(([year, value], i) => {
          const prev = sorted[i + 1];
          const change = prev ? ((value - prev[1]) / prev[1]) * 100 : null;
          return { year, value, change };
        }));
      })
      .catch(() => {});
  }, [apiPair]);

  if (!info) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
        <Nav /><div className="max-w-[1200px] mx-auto px-4 py-8"><MarketsHeader />
        <div className="text-center py-20 text-[#64748b]">Currency pair not found</div></div><Footer />
      </main>
    );
  }

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const changeAmt = first && last ? last - first : 0;
  const changePct = first ? ((last - first) / first) * 100 : 0;
  const isUp = changeAmt >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';
  const dec = info.decimals;

  const vals = points.map(p => p.value).filter(v => v > 0);
  const minVal = vals.length ? Math.min(...vals) : 0;
  const maxVal = vals.length ? Math.max(...vals) : 0;
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
      for (const b of bases) { const v = mag * b; if (v >= minVal * 0.5 && v <= maxVal * 2) ticks.push(Math.log10(v)); }
      mag *= 10;
    }
    return ticks;
  })();

  const formatXTick = (date: string) => {
    if (range === '1d') { const m = date.match(/(\d{1,2}:\d{2}\s*[AP]M)/i); return m ? m[1] : date.split(', ').pop() || date; }
    if (range === '5d') { const m = date.match(/([A-Z][a-z]{2})\s+\d+,?\s*(\d{1,2}:\d{2}\s*[AP]M)/i); return m ? `${m[1]} ${m[2]}` : date.split(', ').pop() || date; }
    const d = new Date(date + 'T12:00:00');
    if (range === '1mo') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (range === '3mo' || range === '6mo' || range === 'ytd') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    if (range === '1y' || range === '2y') return d.toLocaleDateString('en', { year: '2-digit', month: 'short' });
    if (range === '5y' || range === '10y') return d.toLocaleDateString('en', { year: 'numeric' });
    if (range === 'max') return d.getFullYear().toString();
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const fmtRate = (v: number) => v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v >= 10 ? v.toFixed(2) : v.toFixed(dec);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader />

        <div className="text-[14px] text-[#64748b] mb-4">
          <Link href="/markets/currencies" className="hover:text-[#0d1b2a] transition">Currencies</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#0d1b2a]">{info.label}</span>
        </div>

        <div className="mb-6">
          <h2 className="text-[22px] font-bold flex items-center gap-2">
            <img src={`https://flagcdn.com/24x18/${info.flag}.png`} alt="" className="inline" />
            {info.label}
          </h2>
          <div className="text-[14px] text-[#64748b] mt-0.5">{info.base} to {info.quote} exchange rate</div>
          {last != null && (
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-[28px] font-bold font-mono">{fmtRate(last)}</span>
              {points.length > 1 && (
                <span className={`text-[14px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {isUp ? '+' : ''}{changeAmt.toFixed(dec)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {vals.length > 0 && (
          <div className="flex flex-wrap gap-0 border border-gray-100 rounded-xl overflow-hidden mb-6">
            {[
              { label: 'Current', val: last ? fmtRate(last) : '—' },
              { label: 'High', val: fmtRate(maxVal) },
              { label: 'Low', val: fmtRate(minVal) },
              { label: 'Range', val: `${fmtRate(minVal)} – ${fmtRate(maxVal)}` },
            ].map((s, i) => (
              <div key={s.label} className={`flex-1 min-w-[120px] px-4 py-3 ${i > 0 ? 'border-l border-gray-100' : ''}`}>
                <div className="text-[14px] text-gray-400 uppercase tracking-wider">{s.label}</div>
                <div className="text-[15px] font-semibold text-gray-900 mt-0.5">{s.val}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-semibold">Exchange Rate Chart</span>
          <div className="flex gap-1 flex-wrap">
            {RANGES.map(r => (
              <button key={r.key} onClick={() => setRange(r.key)}
                className={`px-3 py-1 text-[14px] rounded ${range === r.key ? 'bg-[#0d1b2a] text-white' : 'bg-white border border-[#ddd] text-[#64748b] hover:bg-[#f0f0f0]'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-[#64748b] text-[15px] border border-[#d5dce6] rounded-lg">Loading chart...</div>
        ) : points.length < 2 ? (
          <div className="h-[350px] flex items-center justify-center text-[#64748b] text-[15px] border border-[#d5dce6] rounded-lg">No chart data available</div>
        ) : (
          <div className="h-[350px] border border-[#d5dce6] rounded-lg p-4">
            {useLog && <div className="text-[9px] text-[#94a3b8] text-right -mb-1">log scale</div>}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fxDetailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date"
                  tickFormatter={(d: string) => chartData.length > 0 && d === chartData[chartData.length - 1].date ? 'Today' : formatXTick(d)}
                  tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e8e8' }}
                  ticks={(() => {
                    if (chartData.length <= 2) return undefined;
                    const n = Math.min(10, chartData.length);
                    const step = Math.floor((chartData.length - 1) / n);
                    const t: string[] = [];
                    for (let i = 0; i < chartData.length - 1; i += step) t.push(chartData[i].date);
                    t.push(chartData[chartData.length - 1].date);
                    return t;
                  })()}
                />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => useLog ? fmtRate(Math.pow(10, v)) : fmtRate(v)}
                  ticks={logTicks} width={65}
                  label={{ value: 'Rate', position: 'insideTopLeft', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }}
                />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint;
                  const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                  const dateLabel = isISO ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : p.date;
                  return (
                    <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[14px]">
                      <div className="text-[#64748b] mb-0.5">{dateLabel}</div>
                      <div className="font-mono font-semibold text-[15px]">{fmtRate(p.value)}</div>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey={useLog ? 'logValue' : 'value'} stroke={color} strokeWidth={1.5} fill="url(#fxDetailGrad)" dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="text-[15px] text-[#64748b] mt-2">
          {points.length > 0 && `${points.length} data points`} · Source: {range === 'max' ? 'FRED / Yahoo Finance' : 'Yahoo Finance (15-min delayed)'}
        </div>

        {/* Historical Annual Rates */}
        {annualHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[16px] font-semibold mb-3">Historical Annual Rates</h3>
            <div className="border border-[#d5dce6] rounded-lg overflow-hidden">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="bg-[#f4f6f9] text-[#64748b] text-[15px] uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 font-medium">Year</th>
                    <th className="text-right px-4 py-2.5 font-medium">Rate</th>
                    <th className="text-right px-4 py-2.5 font-medium">YoY Change</th>
                  </tr>
                </thead>
                <tbody>
                  {annualHistory.map((row, i) => (
                    <tr key={row.year} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'}>
                      <td className="px-4 py-2 font-medium">{row.year}</td>
                      <td className="px-4 py-2 text-right font-mono">{row.value.toFixed(info?.decimals ?? 4)}</td>
                      <td className="px-4 py-2 text-right font-mono">
                        {row.change != null ? (
                          <span className={row.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {row.change >= 0 ? '+' : ''}{row.change.toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[15px] text-[#64748b] mt-2">
              {annualHistory.length} years · Last rate per year · Source: FRED / Yahoo Finance
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
