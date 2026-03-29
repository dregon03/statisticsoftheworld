'use client';

import { useState, useEffect, useCallback } from 'react';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import ChartWrapper from '@/components/charts/ChartWrapper';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartPoint {
  date: string;
  value: number;
}

const COMMODITY_IDS = new Set([
  'YF.GOLD', 'YF.SILVER', 'YF.CRUDE_OIL', 'YF.BRENT', 'YF.NATGAS',
  'YF.COPPER', 'YF.PLATINUM', 'YF.PALLADIUM', 'YF.WHEAT', 'YF.CORN',
  'YF.SOYBEANS', 'YF.COFFEE', 'YF.COTTON', 'YF.SUGAR', 'YF.COCOA',
  'AV.ALUMINUM', 'YF.STEEL', 'YF.IRON_ORE', 'YF.NICKEL_ETC', 'YF.ZINC_ETC',
  'YF.WHEAT_KC', 'YF.SOYBEAN_MEAL', 'YF.SOYBEAN_OIL', 'YF.OATS', 'YF.RICE',
  'YF.OJ', 'YF.LUMBER', 'YF.LIVE_CATTLE', 'YF.LEAN_HOGS', 'YF.FEEDER_CATTLE',
  'YF.MILK', 'YF.BUTTER', 'YF.CHEESE', 'YF.GASOLINE', 'YF.HEATING_OIL',
]);

const INDEX_IDS = new Set([
  'YF.IDX.USA', 'YF.IDX.CAN', 'YF.IDX.BRA', 'YF.IDX.MEX', 'YF.IDX.ARG',
  'YF.IDX.GBR', 'YF.IDX.DEU', 'YF.IDX.FRA', 'YF.IDX.NLD', 'YF.IDX.ESP',
  'YF.IDX.ITA', 'YF.IDX.CHE', 'YF.IDX.JPN', 'YF.IDX.HKG', 'YF.IDX.CHN',
  'YF.IDX.KOR', 'YF.IDX.IND', 'YF.IDX.AUS', 'YF.IDX.NZL', 'YF.IDX.SGP',
  'YF.IDX.IDN', 'YF.IDX.MYS', 'YF.IDX.ISR', 'YF.IDX.SAU', 'YF.IDX.ZAF',
  'YF.FUT.SP500', 'YF.FUT.NASDAQ', 'YF.FUT.DOW', 'YF.FUT.RUSSELL',
]);

const FX_PAIR_MAP: Record<string, string> = {
  'YF.FX.EUR': 'EURUSD', 'YF.FX.GBP': 'GBPUSD', 'YF.FX.JPY': 'USDJPY',
  'YF.FX.CAD': 'USDCAD', 'YF.FX.AUD': 'AUDUSD', 'YF.FX.CHF': 'USDCHF',
  'YF.FX.NZD': 'NZDUSD', 'YF.FX.SEK': 'USDSEK', 'YF.FX.NOK': 'USDNOK',
  'YF.FX.DKK': 'USDDKK', 'YF.FX.CNY': 'USDCNY', 'YF.FX.HKD': 'USDHKD',
  'YF.FX.TWD': 'USDTWD', 'YF.FX.KRW': 'USDKRW', 'YF.FX.SGD': 'USDSGD',
  'YF.FX.INR': 'USDINR', 'YF.FX.PHP': 'USDPHP', 'YF.FX.THB': 'USDTHB',
  'YF.FX.IDR': 'USDIDR', 'YF.FX.MYR': 'USDMYR', 'YF.FX.BRL': 'USDBRL',
  'YF.FX.MXN': 'USDMXN', 'YF.FX.ARS': 'USDARS', 'YF.FX.CLP': 'USDCLP',
  'YF.FX.COP': 'USDCOP', 'YF.FX.PEN': 'USDPEN', 'YF.FX.ZAR': 'USDZAR',
  'YF.FX.SAR': 'USDSAR', 'YF.FX.AED': 'USDAED', 'YF.FX.ILS': 'USDILS',
  'YF.FX.EGP': 'USDEGP', 'YF.FX.NGN': 'USDNGN', 'YF.FX.TRY': 'USDTRY',
  'YF.FX.PLN': 'USDPLN', 'YF.FX.CZK': 'USDCZK', 'YF.FX.HUF': 'USDHUF',
  'YF.FX.RUB': 'USDRUB',
};

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

function DailyPriceChart({ indicatorId }: { indicatorId: string }) {
  const [range, setRange] = useState('1y');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const isIndex = INDEX_IDS.has(indicatorId);
  const fxPair = FX_PAIR_MAP[indicatorId];

  const fetchChart = useCallback(async (r: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const endpoint = fxPair
        ? `/api/fx-chart?pair=${fxPair}&range=${r}`
        : isIndex
        ? `/api/index-chart?id=${encodeURIComponent(indicatorId)}&range=${r}`
        : `/api/commodity-chart?id=${encodeURIComponent(indicatorId)}&range=${r}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      if (!silent) setPoints([]);
    }
    if (!silent) setLoading(false);
  }, [indicatorId, isIndex, fxPair]);

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
    <div className="border border-gray-100 rounded-xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-[#333]">{isIndex ? 'Index' : fxPair ? 'Exchange Rate' : 'Daily Price'} Chart</span>
          {points.length > 1 && (
            <span className={`text-[13px] font-mono ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {isUp ? '+' : ''}{changeAmt.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 text-[11px] rounded ${
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

      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-[#999] text-[13px]">
          Loading prices...
        </div>
      ) : points.length < 2 ? (
        <div className="h-[300px] flex items-center justify-center text-[#999] text-[13px]">
          No price data available
        </div>
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
        <div className="h-[300px]">
          {useLog && <div className="text-[9px] text-[#94a3b8] text-right pr-2 -mb-1">log scale</div>}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
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
                tick={{ fontSize: 11, fill: '#999' }}
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
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#999' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => useLog ? fmtPrice(Math.pow(10, v)) : fmtPrice(v)}
                ticks={logTicks}
                width={65}
                label={{ value: isIndex ? 'pts' : 'USD', position: 'insideTopLeft', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint & { logValue?: number };
                  const isISO = p.date.match(/^\d{4}-\d{2}-\d{2}$/);
                  const dateLabel = isISO
                    ? new Date(p.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
                    : p.date;
                  return (
                    <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                      <div className="text-[#999] mb-0.5">{dateLabel}</div>
                      <div className="font-mono font-semibold text-[15px]">
                        {(isIndex || fxPair) ? '' : '$'}{p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: fxPair ? 4 : 2 })}
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
                fill="url(#dailyGrad)"
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        );
      })()}

      <div className="text-[11px] text-[#999] mt-2">
        {points.length > 0 && `${points.length} data points`} · Source: {range === 'max' ? 'Stooq / FRED / Yahoo Finance' : 'Yahoo Finance (15-min delayed)'}
      </div>
    </div>
  );
}

// Monthly data chart — fetches from /api/monthly
function MonthlyChart({ indicatorId, countryId }: { indicatorId: string; countryId: string }) {
  const [points, setPoints] = useState<{ period: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [freq, setFreq] = useState('M');

  useEffect(() => {
    const possibleIds = [indicatorId, `${indicatorId}.${countryId}`];

    async function tryFetch() {
      for (const id of possibleIds) {
        try {
          const resp = await fetch(`/api/monthly?id=${encodeURIComponent(id)}&country=${countryId}`);
          const data = await resp.json();
          if (data.points && data.points.length > 0) {
            setPoints(data.points);
            setFreq(data.frequency || 'M');
            break;
          }
        } catch { /* try next */ }
      }
      setLoading(false);
    }
    tryFetch();
  }, [indicatorId, countryId]);

  if (loading || points.length < 3) return null;

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const change = prev ? last.value - prev.value : 0;
  const isUp = change >= 0;
  const color = isUp ? '#16a34a' : '#dc2626';

  return (
    <div className="border border-gray-100 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold">
            {freq === 'Q' ? 'Quarterly' : 'Monthly'} Data
          </span>
          <span className="text-[12px] text-[#999]">{points.length} observations</span>
        </div>
        <span className="text-[12px] font-mono text-[#666]">
          Latest: {last.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({last.period})
        </span>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.12} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10, fill: '#999' }}
              tickLine={false}
              axisLine={{ stroke: '#e8e8e8' }}
              interval="preserveStartEnd"
              minTickGap={60}
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
                const p = payload[0].payload as { period: string; value: number };
                return (
                  <div className="bg-white border border-[#ddd] shadow-lg rounded px-3 py-2 text-[12px]">
                    <div className="text-[#999] mb-0.5">{p.period}</div>
                    <div className="font-mono font-semibold text-[14px]">
                      {p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              fill="url(#monthlyGrad)"
              dot={false}
              activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[11px] text-[#999] mt-1">Source: FRED (Federal Reserve Economic Data)</div>
    </div>
  );
}

// Map SOTW indicator IDs to FRED monthly series IDs
const MONTHLY_MAP: Record<string, string> = {
  'IMF.PCPIPCH': 'FRED.CPI', 'FP.CPI.TOTL.ZG': 'FRED.CPI',
  'IMF.LUR': 'FRED.UNRATE', 'SL.UEM.TOTL.ZS': 'FRED.UNRATE',
  'FRED.CPIAUCSL': 'FRED.CPI', 'FRED.UNRATE': 'FRED.UNRATE',
  'FRED.PAYEMS': 'FRED.PAYEMS', 'FRED.FEDFUNDS': 'FRED.FEDFUNDS',
  'FRED.GDP': 'FRED.GDP', 'FRED.M2': 'FRED.M2',
  'FRED.INDPRO': 'FRED.INDPRO', 'FRED.HOUST': 'FRED.HOUST',
  'FRED.UMCSENT': 'FRED.UMCSENT', 'FRED.RETAIL': 'FRED.RETAIL',
};

interface IndicatorDetailChartsProps {
  history: { year: number; value: number }[];
  format: string;
  decimals?: number;
  sourceName: string;
  forecastStartYear?: number;
  indicatorId?: string;
  countryId?: string;
}

export default function IndicatorDetailCharts({ history, format, decimals, sourceName, forecastStartYear, indicatorId, countryId }: IndicatorDetailChartsProps) {
  if (history.length < 2) return null;

  const isCommodity = indicatorId ? COMMODITY_IDS.has(indicatorId) : false;
  const isIndex = indicatorId ? INDEX_IDS.has(indicatorId) : false;
  const isCurrency = indicatorId ? !!FX_PAIR_MAP[indicatorId] : false;
  const monthlyId = indicatorId ? MONTHLY_MAP[indicatorId] : undefined;

  if ((isCommodity || isIndex || isCurrency) && indicatorId) {
    return <DailyPriceChart indicatorId={indicatorId} />;
  }

  return (
    <>
      {monthlyId && countryId && (
        <MonthlyChart indicatorId={monthlyId} countryId={countryId} />
      )}
      <ChartWrapper source={sourceName}>
        <TimeSeriesChart
          data={history}
          format={format}
          decimals={decimals}
          height={350}
          forecastStartYear={forecastStartYear}
        />
      </ChartWrapper>
    </>
  );
}
