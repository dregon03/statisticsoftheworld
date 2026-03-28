'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

/* ── Types ─────────────────────────────────────────── */

interface FXQuote {
  pair: string;
  label: string;
  flag: string;
  decimals: number;
  price: number | null;
  previousClose: number | null;
}

interface ChartPoint {
  date: string;
  value: number;
}

interface PredictionMarket {
  id: string;
  question: string;
  probability: number;
  volume: number;
  endDate: string;
  url: string;
}

/* ── Constants ─────────────────────────────────────── */

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

function FlagIcon({ code, size = 20 }: { code: string; size?: number }) {
  if (!code) return null;
  // flagcdn.com supports: w20, w40, w80, w160, w320
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code.toUpperCase()}
      className="inline-block rounded-sm"
      loading="lazy"
    />
  );
}

// flag = ISO 3166-1 alpha-2 country code (used for flag image) or empty for crypto
const FX_SECTIONS: { title: string; pairs: { pair: string; label: string; flag: string; decimals: number }[] }[] = [
  {
    title: 'G10 Major Pairs',
    pairs: [
      { pair: 'EURUSD', label: 'EUR/USD', flag: 'eu', decimals: 4 },
      { pair: 'GBPUSD', label: 'GBP/USD', flag: 'gb', decimals: 4 },
      { pair: 'USDJPY', label: 'USD/JPY', flag: 'jp', decimals: 2 },
      { pair: 'USDCHF', label: 'USD/CHF', flag: 'ch', decimals: 4 },
      { pair: 'USDCAD', label: 'USD/CAD', flag: 'ca', decimals: 4 },
      { pair: 'AUDUSD', label: 'AUD/USD', flag: 'au', decimals: 4 },
      { pair: 'NZDUSD', label: 'NZD/USD', flag: 'nz', decimals: 4 },
      { pair: 'USDSEK', label: 'USD/SEK', flag: 'se', decimals: 4 },
      { pair: 'USDNOK', label: 'USD/NOK', flag: 'no', decimals: 4 },
    ],
  },
  {
    title: 'Europe',
    pairs: [
      { pair: 'USDDKK', label: 'USD/DKK', flag: 'dk', decimals: 4 },
      { pair: 'USDPLN', label: 'USD/PLN', flag: 'pl', decimals: 4 },
      { pair: 'USDCZK', label: 'USD/CZK', flag: 'cz', decimals: 4 },
      { pair: 'USDHUF', label: 'USD/HUF', flag: 'hu', decimals: 2 },
      { pair: 'USDRON', label: 'USD/RON', flag: 'ro', decimals: 4 },
      { pair: 'USDTRY', label: 'USD/TRY', flag: 'tr', decimals: 4 },
      { pair: 'USDRUB', label: 'USD/RUB', flag: 'ru', decimals: 2 },
      { pair: 'USDUAH', label: 'USD/UAH', flag: 'ua', decimals: 2 },
      { pair: 'USDISK', label: 'USD/ISK', flag: 'is', decimals: 2 },
    ],
  },
  {
    title: 'Asia-Pacific',
    pairs: [
      { pair: 'USDCNY', label: 'USD/CNY', flag: 'cn', decimals: 4 },
      { pair: 'USDHKD', label: 'USD/HKD', flag: 'hk', decimals: 4 },
      { pair: 'USDTWD', label: 'USD/TWD', flag: 'tw', decimals: 2 },
      { pair: 'USDKRW', label: 'USD/KRW', flag: 'kr', decimals: 2 },
      { pair: 'USDSGD', label: 'USD/SGD', flag: 'sg', decimals: 4 },
      { pair: 'USDINR', label: 'USD/INR', flag: 'in', decimals: 2 },
      { pair: 'USDPHP', label: 'USD/PHP', flag: 'ph', decimals: 2 },
      { pair: 'USDTHB', label: 'USD/THB', flag: 'th', decimals: 4 },
      { pair: 'USDIDR', label: 'USD/IDR', flag: 'id', decimals: 0 },
      { pair: 'USDMYR', label: 'USD/MYR', flag: 'my', decimals: 4 },
      { pair: 'USDVND', label: 'USD/VND', flag: 'vn', decimals: 0 },
      { pair: 'USDPKR', label: 'USD/PKR', flag: 'pk', decimals: 2 },
      { pair: 'USDBDT', label: 'USD/BDT', flag: 'bd', decimals: 2 },
      { pair: 'USDLKR', label: 'USD/LKR', flag: 'lk', decimals: 2 },
    ],
  },
  {
    title: 'Americas',
    pairs: [
      { pair: 'USDBRL', label: 'USD/BRL', flag: 'br', decimals: 4 },
      { pair: 'USDMXN', label: 'USD/MXN', flag: 'mx', decimals: 4 },
      { pair: 'USDARS', label: 'USD/ARS', flag: 'ar', decimals: 2 },
      { pair: 'USDCLP', label: 'USD/CLP', flag: 'cl', decimals: 2 },
      { pair: 'USDCOP', label: 'USD/COP', flag: 'co', decimals: 0 },
      { pair: 'USDPEN', label: 'USD/PEN', flag: 'pe', decimals: 4 },
      { pair: 'USDUYU', label: 'USD/UYU', flag: 'uy', decimals: 2 },
    ],
  },
  {
    title: 'Middle East & Africa',
    pairs: [
      { pair: 'USDAED', label: 'USD/AED', flag: 'ae', decimals: 4 },
      { pair: 'USDSAR', label: 'USD/SAR', flag: 'sa', decimals: 4 },
      { pair: 'USDILS', label: 'USD/ILS', flag: 'il', decimals: 4 },
      { pair: 'USDEGP', label: 'USD/EGP', flag: 'eg', decimals: 2 },
      { pair: 'USDZAR', label: 'USD/ZAR', flag: 'za', decimals: 4 },
      { pair: 'USDNGN', label: 'USD/NGN', flag: 'ng', decimals: 2 },
      { pair: 'USDKES', label: 'USD/KES', flag: 'ke', decimals: 2 },
      { pair: 'USDGHS', label: 'USD/GHS', flag: 'gh', decimals: 2 },
      { pair: 'USDMAD', label: 'USD/MAD', flag: 'ma', decimals: 4 },
      { pair: 'USDTND', label: 'USD/TND', flag: 'tn', decimals: 4 },
    ],
  },
];

const PREDICTION_KEYWORDS = [
  'dollar', 'usd', 'euro', 'eur', 'yen', 'yuan', 'currency', 'forex', 'fx',
  'tariff', 'trade war', 'sanctions', 'import', 'export', 'customs', 'dxy',
];

/* ── DXY Card ──────────────────────────────────────── */

interface Mover { flag: string; label: string; changePct: number }

function DXYCard({ movers }: { movers: Mover[] }) {
  const [price, setPrice] = useState<number | null>(null);
  const [prevClose, setPrevClose] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/fx-chart?pair=DXY&range=1d')
      .then(r => r.json())
      .then(d => {
        setPrice(d.regularMarketPrice);
        setPrevClose(d.previousClose);
      })
      .catch(() => {});
  }, []);

  const change = (price != null && prevClose != null) ? price - prevClose : null;
  const changePct = (change != null && prevClose) ? (change / prevClose) * 100 : null;
  const isUp = (change ?? 0) >= 0;

  // Top 3 strongest (USD gained = positive change for USD/XXX pairs)
  // and top 3 weakest against USD
  const sorted = [...movers].sort((a, b) => b.changePct - a.changePct);
  const strongest = sorted.slice(0, 3);
  const weakest = sorted.slice(-3).reverse();

  return (
    <div className="border border-[#d5dce6] rounded-xl p-5 mb-6 bg-gradient-to-r from-[#f8f9fa] to-white">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] text-[#64748b] uppercase tracking-wider mb-1">US Dollar Index (DXY)</div>
          <div className="flex items-baseline gap-3">
            <span className="text-[32px] font-bold font-mono text-[#0d1b2a]">
              {price != null ? price.toFixed(2) : '—'}
            </span>
            {change != null && (
              <span className={`text-[15px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct?.toFixed(2)}%)
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#64748b] mt-1">
            Measures USD against a basket of 6 major currencies (EUR, JPY, GBP, CAD, SEK, CHF)
          </div>
        </div>
        {movers.length > 0 && (
          <div className="flex gap-6">
            <div>
              <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1.5">USD Strongest vs</div>
              {strongest.map(m => (
                <div key={m.label} className="flex items-center gap-1.5 text-[12px] mb-0.5">
                  <FlagIcon code={m.flag} size={16} />
                  <span className="text-[#64748b] w-[32px]">{m.label}</span>
                  <span className="font-mono text-green-600">{m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(2)}%</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1.5">USD Weakest vs</div>
              {weakest.map(m => (
                <div key={m.label} className="flex items-center gap-1.5 text-[12px] mb-0.5">
                  <FlagIcon code={m.flag} size={16} />
                  <span className="text-[#64748b] w-[32px]">{m.label}</span>
                  <span className="font-mono text-red-600">{m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Currency Converter ────────────────────────────── */

function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF', 'SEK', 'NOK',
    'CNY', 'HKD', 'TWD', 'KRW', 'SGD', 'INR', 'PHP', 'THB', 'IDR', 'MYR',
    'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN',
    'AED', 'SAR', 'ILS', 'EGP', 'ZAR', 'NGN',
    'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'RUB',
  ];
  const FLAGS: Record<string, string> = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦', AUD: '🇦🇺', NZD: '🇳🇿', CHF: '🇨🇭',
    SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', PLN: '🇵🇱', CZK: '🇨🇿', HUF: '🇭🇺', RON: '🇷🇴', TRY: '🇹🇷',
    RUB: '🇷🇺', UAH: '🇺🇦', ISK: '🇮🇸',
    CNY: '🇨🇳', HKD: '🇭🇰', TWD: '🇹🇼', KRW: '🇰🇷', SGD: '🇸🇬', INR: '🇮🇳', PHP: '🇵🇭',
    THB: '🇹🇭', IDR: '🇮🇩', MYR: '🇲🇾', VND: '🇻🇳', PKR: '🇵🇰', BDT: '🇧🇩', LKR: '🇱🇰',
    BRL: '🇧🇷', MXN: '🇲🇽', ARS: '🇦🇷', CLP: '🇨🇱', COP: '🇨🇴', PEN: '🇵🇪', UYU: '🇺🇾',
    AED: '🇦🇪', SAR: '🇸🇦', ILS: '🇮🇱', EGP: '🇪🇬', ZAR: '🇿🇦', NGN: '🇳🇬', KES: '🇰🇪',
    GHS: '🇬🇭', MAD: '🇲🇦', TND: '🇹🇳',
  };

  // Currencies quoted as XXX/USD (not USD/XXX)
  const QUOTED_VS_USD = new Set(['EUR', 'GBP', 'AUD', 'NZD']);

  const getUsdRate = useCallback(async (ccy: string): Promise<number | null> => {
    // Returns how many units of ccy per 1 USD
    if (ccy === 'USD') return 1;
    if (QUOTED_VS_USD.has(ccy)) {
      // e.g. EURUSD = 1.15 means 1 EUR = 1.15 USD, so 1 USD = 1/1.15 EUR
      const res = await fetch(`/api/fx-chart?pair=${ccy}USD&range=1d`);
      const d = await res.json();
      return d.regularMarketPrice ? 1 / d.regularMarketPrice : null;
    } else {
      // e.g. USDJPY = 159 means 1 USD = 159 JPY
      const res = await fetch(`/api/fx-chart?pair=USD${ccy}&range=1d`);
      const d = await res.json();
      return d.regularMarketPrice ?? null;
    }
  }, []);

  useEffect(() => {
    if (from === to) { setRate(1); setLoading(false); return; }
    setLoading(true);
    Promise.all([getUsdRate(from), getUsdRate(to)])
      .then(([fromRate, toRate]) => {
        // fromRate = units of `from` per 1 USD, toRate = units of `to` per 1 USD
        // We want: 1 `from` = ? `to`  →  (toRate / fromRate)
        if (fromRate && toRate) setRate(toRate / fromRate);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [from, to, getUsdRate]);

  const swap = () => { setFrom(to); setTo(from); };
  const numAmount = parseFloat(amount) || 0;
  const converted = rate ? numAmount * rate : null;

  return (
    <div className="border border-[#d5dce6] rounded-xl p-5 mb-6">
      <div className="text-[13px] font-semibold text-[#0d1b2a] mb-3">Currency Converter</div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-[100px] px-3 py-2 border border-[#ddd] rounded-lg text-[14px] font-mono text-right focus:outline-none focus:border-[#0066cc]"
          />
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 border border-[#ddd] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#0066cc]"
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
          </select>
        </div>

        <button onClick={swap} className="text-[18px] text-[#64748b] hover:text-[#0066cc] transition px-1" title="Swap">
          ⇄
        </button>

        <div className="flex items-center gap-2">
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 border border-[#ddd] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#0066cc]"
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
          </select>
        </div>

        <div className="text-[15px] font-mono font-semibold text-[#0d1b2a] ml-2">
          {loading ? '...' : converted != null ? (
            <>= {converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}</>
          ) : '—'}
        </div>
      </div>
      {rate && !loading && (
        <div className="text-[11px] text-[#64748b] mt-2">
          1 {from} = {rate.toFixed(4)} {to} · Mid-market rate · Source: Yahoo Finance
        </div>
      )}
    </div>
  );
}

/* ── FX Chart (expandable) ─────────────────────────── */

function FXChart({ pair, label }: { pair: string; label: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/fx-chart?pair=${pair}&range=${r}`);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [pair]);

  useEffect(() => {
    fetchChart(range);
    const iv = setInterval(() => fetchChart(range, true), 300_000);
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
              {isUp ? '+' : ''}{changeAmt.toFixed(4)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
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
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-[12px]">Loading chart...</div>
      ) : points.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center text-[#64748b] text-[12px]">No chart data</div>
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
        const fmtRate = (v: number) => v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v >= 10 ? v.toFixed(2) : v.toFixed(4);
        return (
        <div className="h-[200px]">
          {useLog && <div className="text-[9px] text-[#94a3b8] text-right pr-2 -mb-1">log scale</div>}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`fxgrad-${pair}`} x1="0" y1="0" x2="0" y2="1">
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
                  for (let i = 0; i < chartData.length - 1; i += step) ticks.push(chartData[i].date);
                  ticks.push(chartData[chartData.length - 1].date);
                  return ticks;
                })()}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#999' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => useLog ? fmtRate(Math.pow(10, v)) : fmtRate(v)}
                ticks={logTicks}
                width={65}
                label={{ value: 'Rate', position: 'insideTopLeft', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint & { logValue?: number };
                  const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                  const dateLabel = isISO
                    ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
                    : p.date;
                  return (
                    <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                      <div className="text-[#64748b] mb-0.5">{dateLabel}</div>
                      <div className="font-mono font-semibold text-[14px]">{p.value.toFixed(4)}</div>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey={useLog ? 'logValue' : 'value'} stroke={color} strokeWidth={1.5} fill={`url(#fxgrad-${pair})`} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        );
      })()}
    </div>
  );
}

/* ── Prediction Card ───────────────────────────────── */

function PredictionCard({ market }: { market: PredictionMarket }) {
  const pct = Math.round(market.probability * 100);
  const vol = market.volume >= 1e6 ? `$${(market.volume / 1e6).toFixed(1)}M` : market.volume >= 1e3 ? `$${(market.volume / 1e3).toFixed(0)}K` : `$${market.volume.toFixed(0)}`;
  const end = market.endDate ? new Date(market.endDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';

  return (
    <a href={market.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2.5 border border-[#d5dce6] rounded-lg hover:border-[#ccc] hover:shadow-sm transition group">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[#0d1b2a] font-medium leading-tight truncate group-hover:text-[#0066cc] transition">{market.question}</div>
        <div className="text-[10px] text-[#64748b] mt-0.5">Vol: {vol}{end ? ` · Resolves ${end}` : ''}</div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 50 ? '#16a34a' : '#dc2626' }} />
        </div>
        <span className="text-[13px] font-bold tabular-nums" style={{ color: pct >= 50 ? '#16a34a' : '#dc2626', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
      </div>
    </a>
  );
}

/* ── Change Cell Helper ────────────────────────────── */

function ChangeSpan({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value == null) return <span className="text-[#94a3b8]">—</span>;
  const color = value >= 0 ? 'text-green-600' : 'text-red-600';
  return <span className={`font-mono ${color}`}>{value >= 0 ? '+' : ''}{value.toFixed(2)}%{suffix}</span>;
}

/* ── Main Page ─────────────────────────────────────── */

export default function CurrenciesPage() {
  const [data, setData] = useState<Record<string, FXQuote & { weeklyChg?: number; monthlyChg?: number; ytdChg?: number }>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionMarket[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Phase 1: fetch 1d prices for all pairs (fast — shows rates immediately)
  const fetchPrices = useCallback(async () => {
    const allPairs = FX_SECTIONS.flatMap(s => s.pairs);
    const results = await Promise.all(
      allPairs.map(async p => {
        try {
          const res = await fetch(`/api/fx-chart?pair=${p.pair}&range=1d`);
          const json = await res.json();
          return {
            ...p,
            price: json.regularMarketPrice ?? null,
            previousClose: json.previousClose ?? null,
            marketTime: json.regularMarketTime ?? null,
          };
        } catch {
          return { ...p, price: null, previousClose: null, marketTime: null };
        }
      })
    );
    const d: Record<string, any> = {};
    let latestTime: string | null = null;
    for (const r of results) {
      d[r.pair] = r;
      if (r.marketTime && (!latestTime || r.marketTime > latestTime)) latestTime = r.marketTime;
    }
    setData(d);
    setUpdatedAt(latestTime || new Date().toISOString());
    setLoading(false);
  }, []);

  // Phase 2: backfill weekly/monthly/YTD changes from 1y data (slower, runs after page loads)
  const fetchMultiTimeframe = useCallback(async () => {
    const allPairs = FX_SECTIONS.flatMap(s => s.pairs);
    for (const p of allPairs) {
      try {
        const res = await fetch(`/api/fx-chart?pair=${p.pair}&range=1y`);
        const json = await res.json();
        const pts: ChartPoint[] = json.points || [];
        const now = json.regularMarketPrice;

        if (now && pts.length > 5) {
          const today = new Date();
          const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
          const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);
          const yearStart = `${today.getFullYear()}-01-02`;

          const findClosest = (target: string) => {
            let closest = pts[0];
            for (const pt of pts) { if (pt.date <= target) closest = pt; }
            return closest;
          };

          const weekPt = findClosest(weekAgo.toISOString().slice(0, 10));
          const monthPt = findClosest(monthAgo.toISOString().slice(0, 10));
          const ytdPt = findClosest(yearStart);

          setData(prev => ({
            ...prev,
            [p.pair]: {
              ...prev[p.pair],
              weeklyChg: weekPt?.value ? ((now - weekPt.value) / weekPt.value) * 100 : undefined,
              monthlyChg: monthPt?.value ? ((now - monthPt.value) / monthPt.value) * 100 : undefined,
              ytdChg: ytdPt?.value ? ((now - ytdPt.value) / ytdPt.value) * 100 : undefined,
            },
          }));
        }
      } catch { /* skip */ }
    }
  }, []);

  useEffect(() => {
    fetchPrices().then(() => fetchMultiTimeframe());
    const iv = setInterval(fetchPrices, 30_000); // 30s — matches backend fetch interval
    return () => clearInterval(iv);
  }, [fetchPrices, fetchMultiTimeframe]);

  useEffect(() => {
    fetch('/api/predictions?limit=200')
      .then(r => r.json())
      .then(d => setPredictions(d.markets || []))
      .catch(() => {});
  }, []);

  // Compute movers: daily change from USD perspective
  // For USD/XXX pairs, positive change = USD stronger. For XXX/USD (EUR,GBP,AUD), flip sign.
  const QUOTED_VS_USD_SET = new Set(['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD']);
  const movers: Mover[] = FX_SECTIONS.flatMap(s => s.pairs).map(p => {
    const d = data[p.pair];
    if (!d?.price || !d?.previousClose) return null;
    const rawPct = ((d.price - d.previousClose) / d.previousClose) * 100;
    // For XXX/USD pairs, a rise means USD weakened, so flip
    const usdPct = QUOTED_VS_USD_SET.has(p.pair) ? -rawPct : rawPct;
    const ccy = p.pair.replace('USD', '');
    return { flag: p.flag, label: ccy, changePct: usdPct };
  }).filter((m): m is Mover => m != null);

  const fxPredictions = predictions.filter(m => {
    const q = m.question.toLowerCase();
    return PREDICTION_KEYWORDS.some(kw => q.includes(kw));
  });

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <MarketsHeader updatedAt={updatedAt} />

        {/* DXY Headline */}
        <DXYCard movers={movers} />

        {/* Currency Converter */}
        <CurrencyConverter />

        {loading ? (
          <div className="text-center py-20 text-[#64748b]">Loading currency data...</div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <ExportButton
                filename={`sotw-currencies-${new Date().toISOString().slice(0, 10)}`}
                getData={() => ({
                  headers: ['Pair', 'Rate', 'Day %', 'Week %', 'Month %', 'YTD %'],
                  rows: FX_SECTIONS.flatMap(s => s.pairs.map(p => {
                    const d = data[p.pair];
                    const chg = d?.price && d?.previousClose ? ((d.price - d.previousClose) / d.previousClose * 100) : null;
                    return [p.pair, d?.price ?? null, chg ? +chg.toFixed(4) : null, d?.weeklyChg ?? null, d?.monthlyChg ?? null, d?.ytdChg ?? null];
                  })),
                })}
              />
            </div>
            {FX_SECTIONS.map(section => (
              <div key={section.title}>
                <h2 className="text-[14px] font-semibold text-[#64748b] uppercase tracking-wider mb-3">{section.title}</h2>
                <div className="border border-[#d5dce6] rounded-lg overflow-hidden">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead>
                      <tr className="text-[11px] text-[#64748b] uppercase tracking-wider bg-[#f4f6f9] border-b border-[#d5dce6]">
                        <th className="text-left px-3 py-2">Pair</th>
                        <th className="text-right px-3 py-2">Rate</th>
                        <th className="text-right px-3 py-2">Day</th>
                        <th className="text-right px-3 py-2 hidden md:table-cell">Week</th>
                        <th className="text-right px-3 py-2 hidden md:table-cell">Month</th>
                        <th className="text-right px-3 py-2 hidden lg:table-cell">YTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.pairs.map(p => {
                        const d = data[p.pair];
                        const isExpanded = expanded === p.pair;
                        const change = (d?.price != null && d?.previousClose != null) ? d.price - d.previousClose : null;
                        const changePct = (change != null && d?.previousClose) ? (change / d.previousClose) * 100 : null;

                        return (
                          <React.Fragment key={p.pair}>
                            <tr
                              className={`border-b border-[#edf0f5] hover:bg-[#f4f6f9] transition text-[13px] cursor-pointer ${isExpanded ? 'bg-[#f5f7fa]' : ''}`}
                              onClick={() => setExpanded(isExpanded ? null : p.pair)}
                            >
                              <td className="px-3 py-2">
                                <span className="flex items-center gap-2">
                                  <span className={`text-[10px] text-[#64748b] transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                                  <FlagIcon code={p.flag} size={20} />
                                  <span className="font-medium">{p.label}</span>
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-semibold">
                                {d?.price != null ? <AnimatedPrice value={d.price} format={v => v.toFixed(p.decimals)} /> : '—'}
                              </td>
                              <td className="px-3 py-2 text-right text-[12px]">
                                <ChangeSpan value={changePct ?? null} />
                              </td>
                              <td className="px-3 py-2 text-right text-[12px] hidden md:table-cell">
                                <ChangeSpan value={d?.weeklyChg ?? null} />
                              </td>
                              <td className="px-3 py-2 text-right text-[12px] hidden md:table-cell">
                                <ChangeSpan value={d?.monthlyChg ?? null} />
                              </td>
                              <td className="px-3 py-2 text-right text-[12px] hidden lg:table-cell">
                                <ChangeSpan value={d?.ytdChg ?? null} />
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="p-0">
                                  <FXChart pair={p.pair} label={p.label} />
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
            ))}

            {/* Prediction Markets */}
            {fxPredictions.length > 0 && (
              <div>
                <h2 className="text-[14px] font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                  &#x1F52E; Currency & Trade Predictions
                </h2>
                <p className="text-[12px] text-[#64748b] mb-3">
                  Live prediction market odds from <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">Polymarket</a>. Real-money forecasts on currencies, tariffs, and trade policy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fxPredictions.slice(0, 8).map(m => <PredictionCard key={m.id} market={m} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
