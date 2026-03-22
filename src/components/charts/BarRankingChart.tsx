'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatValue } from '@/lib/data';

interface RankingEntry {
  country: string;
  countryId: string;
  iso2: string;
  value: number;
}

interface BarRankingChartProps {
  data: RankingEntry[];
  format: string;
  decimals?: number;
  height?: number;
  maxItems?: number;
  label?: string;
}

const BAR_COLOR = '#3b82f6';
const BAR_COLORS = [
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff',
];

export default function BarRankingChart({
  data,
  format,
  decimals = 0,
  height,
  maxItems = 15,
  label,
}: BarRankingChartProps) {
  const items = data.slice(0, maxItems);
  if (items.length === 0) return null;

  const chartHeight = height || Math.max(200, items.length * 32 + 40);

  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={items} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 100 }}>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v: number) => formatValue(v, format, decimals)}
          />
          <YAxis
            type="category"
            dataKey="country"
            tick={{ fontSize: 12, fill: '#374151' }}
            tickLine={false}
            axisLine={false}
            width={95}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as RankingEntry;
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-sm font-semibold">{d.country}</div>
                  <div className="text-sm text-blue-600">{formatValue(d.value, format, decimals)}</div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {items.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
