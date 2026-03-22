'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineChartProps {
  data: { year: number; value: number | null }[];
  color?: string;
  width?: number;
  height?: number;
}

export default function SparklineChart({
  data,
  color = '#3b82f6',
  width = 80,
  height = 24,
}: SparklineChartProps) {
  const filtered = data.filter(d => d.value !== null);
  if (filtered.length < 2) return <div style={{ width, height }} />;

  return (
    <div style={{ width, height }} className="inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filtered}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
