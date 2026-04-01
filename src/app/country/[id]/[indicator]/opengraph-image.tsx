import { ImageResponse } from 'next/og';
import { getCountry, getHistoricalData, INDICATORS, formatValue } from '@/lib/data';

export const alt = 'Country Indicator Data';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string; indicator: string }> }) {
  const { id, indicator: rawIndicator } = await params;
  const indicatorId = decodeURIComponent(rawIndicator);
  const country = await getCountry(id);
  const ind = INDICATORS.find(i => i.id === indicatorId);
  if (!country || !ind) return new Response('Not found', { status: 404 });

  const history = await getHistoricalData(indicatorId, id);
  const dataPoints = history.filter(d => d.value !== null);
  const latest = dataPoints.at(-1);
  const valueStr = latest ? formatValue(latest.value, ind.format, ind.decimals) : 'N/A';

  // Get last 10 data points for mini chart
  const recent = dataPoints.slice(-10);
  const values = recent.map(d => d.value as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Build SVG sparkline path
  const chartW = 400;
  const chartH = 120;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * chartW;
    const y = chartH - ((v - min) / range) * chartH;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  const source = ind.source === 'imf' ? 'IMF' : 'World Bank';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d1b2a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px', color: '#94a3b8' }}>statisticsoftheworld.com</span>
        </div>
        <div style={{ fontSize: '32px', color: '#64748b', marginBottom: '8px' }}>
          {country.name}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '32px' }}>
          {ind.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '64px', fontWeight: 700, color: '#60a5fa' }}>{valueStr}</span>
            <span style={{ fontSize: '24px', color: '#64748b', marginTop: '8px' }}>
              {latest?.year || 'Latest'} · {dataPoints.length} years of data · {source}
            </span>
          </div>
          {values.length > 1 && (
            <svg width={chartW} height={chartH} style={{ opacity: 0.6 }}>
              <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="3" />
            </svg>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
