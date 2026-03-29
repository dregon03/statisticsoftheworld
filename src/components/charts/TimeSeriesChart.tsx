'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { formatValue } from '@/lib/data';

interface DataPoint {
  year: number;
  value: number | null;
}

interface ChartDataPoint {
  year: number;
  actual: number | null;
  forecast: number | null;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  format: string;
  decimals?: number;
  label?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  forecastStartYear?: number; // data points >= this year shown as dashed
}

export default function TimeSeriesChart({
  data,
  format,
  decimals = 0,
  label,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  forecastStartYear,
}: TimeSeriesChartProps) {
  const filtered = data.filter(d => d.value !== null);
  if (filtered.length < 2) return null;

  const values = filtered.map(d => d.value as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 1;

  // Split into actual vs forecast if forecastStartYear is set
  const hasForecast = forecastStartYear && filtered.some(d => d.year >= forecastStartYear);
  const chartData: ChartDataPoint[] = filtered.map(d => {
    if (!hasForecast) return { year: d.year, actual: d.value, forecast: null };
    const isForecast = d.year >= forecastStartYear;
    // The last actual year also appears in forecast to connect the lines
    const isJoinPoint = d.year === forecastStartYear - 1 || d.year === forecastStartYear;
    return {
      year: d.year,
      actual: !isForecast || (d.year === forecastStartYear && filtered.some(p => p.year === forecastStartYear - 1)) ? null : null,
      forecast: isForecast ? d.value : null,
    };
  });

  // Simpler approach: actual line for years < forecastStartYear (plus the bridge point),
  // forecast line for years >= forecastStartYear (plus the bridge point)
  const chartData2: ChartDataPoint[] = filtered.map(d => {
    if (!hasForecast) return { year: d.year, actual: d.value, forecast: null };
    const isForecast = d.year >= forecastStartYear;
    return {
      year: d.year,
      actual: !isForecast || d.year === forecastStartYear ? d.value : null,
      forecast: isForecast || d.year === forecastStartYear - 1 ? d.value : null,
    };
  });

  const finalData = hasForecast ? chartData2 : chartData;

  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={finalData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
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
            domain={[min - padding, max + padding]}
            tickFormatter={(v: number) => formatValue(v, format, decimals)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as ChartDataPoint;
              const val = d.actual ?? d.forecast;
              const isForecast = hasForecast && d.year >= forecastStartYear!;
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs text-gray-400">
                    {d.year}
                    {isForecast && <span className="ml-1 text-amber-500">(Forecast)</span>}
                  </div>
                  <div className="text-sm font-semibold">{formatValue(val, format, decimals)}</div>
                </div>
              );
            }}
          />
          {hasForecast && (
            <ReferenceLine
              x={forecastStartYear}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              label={{ value: 'Forecast', position: 'top', style: { fontSize: 10, fill: '#999' } }}
            />
          )}
          <Line
            type="monotone"
            dataKey="actual"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            connectNulls={false}
          />
          {hasForecast && (
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, fill: color, strokeDasharray: '' }}
              connectNulls={false}
            />
          )}
          {!hasForecast && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="none"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {hasForecast && (
        <div className="flex items-center justify-center gap-4 mt-1 text-[15px] text-[#999]">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ backgroundColor: color }} />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: color }} />
            <span>IMF Forecast</span>
          </div>
        </div>
      )}
    </div>
  );
}
