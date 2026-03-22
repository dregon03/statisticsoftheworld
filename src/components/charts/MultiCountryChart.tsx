'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { formatValue } from '@/lib/data';

interface HistoryPoint {
  year: number;
  value: number | null;
}

interface MultiCountryChartProps {
  data: Record<string, HistoryPoint[]>; // countryId -> data points
  countryNames: Record<string, string>; // countryId -> display name
  format: string;
  decimals?: number;
  height?: number;
  label?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function MultiCountryChart({
  data,
  countryNames,
  format,
  decimals = 0,
  height = 350,
  label,
}: MultiCountryChartProps) {
  const countryIds = Object.keys(data);
  if (countryIds.length === 0) return null;

  // Merge all data into year-keyed rows
  const yearSet = new Set<number>();
  for (const points of Object.values(data)) {
    for (const p of points) yearSet.add(p.year);
  }
  const years = Array.from(yearSet).sort();

  const merged = years.map(year => {
    const row: Record<string, number | null | number> = { year };
    for (const cid of countryIds) {
      const point = data[cid]?.find(p => p.year === year);
      row[cid] = point?.value ?? null;
    }
    return row;
  });

  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={merged} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={65}
            tickFormatter={(v: number) => formatValue(v, format, decimals)}
          />
          <Tooltip
            content={({ active, payload, label: tooltipLabel }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs text-gray-400 mb-1">{tooltipLabel}</div>
                  {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-gray-600">{countryNames[p.dataKey as string] || String(p.dataKey)}</span>
                      <span className="font-semibold ml-auto">{formatValue(p.value as number, format, decimals)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            formatter={(value: string) => countryNames[value] || value}
            wrapperStyle={{ fontSize: 12 }}
          />
          {countryIds.map((cid, i) => (
            <Line
              key={cid}
              type="monotone"
              dataKey={cid}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
