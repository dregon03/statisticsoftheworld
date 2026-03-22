'use client';

import { ResponsiveContainer, ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis } from 'recharts';
import { formatValue } from '@/lib/data';

interface ScatterPoint {
  country: string;
  countryId: string;
  x: number;
  y: number;
  size?: number;
  region: string;
}

interface ScatterChartProps {
  data: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xFormat: string;
  yFormat: string;
  xDecimals?: number;
  yDecimals?: number;
  height?: number;
  sizeLabel?: string;
  logX?: boolean;
  logY?: boolean;
}

const REGION_COLORS: Record<string, string> = {
  'East Asia & Pacific': '#3b82f6',
  'Europe & Central Asia': '#10b981',
  'Latin America & Caribbean': '#f59e0b',
  'Middle East & North Africa': '#ef4444',
  'North America': '#8b5cf6',
  'South Asia': '#ec4899',
  'Sub-Saharan Africa': '#f97316',
};

export default function ScatterPlotChart({
  data,
  xLabel,
  yLabel,
  xFormat,
  yFormat,
  xDecimals = 0,
  yDecimals = 0,
  height = 450,
  logX = false,
  logY = false,
}: ScatterChartProps) {
  if (data.length === 0) return null;

  // Group by region for coloring
  const regions = [...new Set(data.map(d => d.region))].sort();

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatter margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="x"
            type="number"
            name={xLabel}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v: number) => formatValue(v, xFormat, xDecimals)}
            scale={logX ? 'log' : 'auto'}
            domain={logX ? ['auto', 'auto'] : undefined}
            label={{ value: xLabel, position: 'bottom', offset: 10, style: { fontSize: 12, fill: '#999' } }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={yLabel}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(v: number) => formatValue(v, yFormat, yDecimals)}
            scale={logY ? 'log' : 'auto'}
            domain={logY ? ['auto', 'auto'] : undefined}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 12, fill: '#999' } }}
          />
          <ZAxis dataKey="size" range={[40, 400]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as ScatterPoint;
              return (
                <div className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-[12px] font-semibold text-[#333]">{d.country}</div>
                  <div className="text-[11px] text-[#999] mb-1">{d.region}</div>
                  <div className="text-[12px]">
                    <span className="text-[#666]">{xLabel}: </span>
                    <span className="font-mono">{formatValue(d.x, xFormat, xDecimals)}</span>
                  </div>
                  <div className="text-[12px]">
                    <span className="text-[#666]">{yLabel}: </span>
                    <span className="font-mono">{formatValue(d.y, yFormat, yDecimals)}</span>
                  </div>
                </div>
              );
            }}
          />
          {regions.map(region => {
            const regionData = data.filter(d => d.region === region);
            return (
              <Scatter
                key={region}
                name={region}
                data={regionData}
                fill={REGION_COLORS[region] || '#6b7280'}
                fillOpacity={0.7}
              />
            );
          })}
        </RechartsScatter>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2 text-[11px]">
        {regions.map(r => (
          <div key={r} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGION_COLORS[r] || '#6b7280' }} />
            <span className="text-[#666]">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
