'use client';

export default function Sparkline({
  data,
  width = 60,
  height = 16,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 1;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#16a34a' : '#dc2626';

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
