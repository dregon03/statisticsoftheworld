import { ImageResponse } from 'next/og';
import { getCountry, getAllIndicatorsForCountry, formatValue } from '@/lib/data';

export const alt = 'Country Statistics';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const country = await getCountry(id);
  if (!country) return new Response('Not found', { status: 404 });

  const indicators = await getAllIndicatorsForCountry(id);
  const gdp = indicators['IMF.NGDPD'];
  const pop = indicators['SP.POP.TOTL'];
  const gdpPc = indicators['IMF.NGDPDPC'];
  const growth = indicators['IMF.NGDP_RPCH'];

  const stats = [
    gdp ? { label: 'GDP', value: formatValue(gdp.value, 'currency') } : null,
    pop ? { label: 'Population', value: formatValue(pop.value, 'number') } : null,
    gdpPc ? { label: 'GDP/Capita', value: formatValue(gdpPc.value, 'currency') } : null,
    growth ? { label: 'GDP Growth', value: formatValue(growth.value, 'percent', 1) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

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
          <span style={{ fontSize: '24px', color: '#94a3b8' }}>statisticsoftheworld.com</span>
        </div>
        <div style={{ fontSize: '56px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '16px' }}>
          {country.name}
        </div>
        <div style={{ fontSize: '28px', color: '#64748b', marginBottom: '40px' }}>
          Economy & Statistics · 400+ Indicators
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px 32px', minWidth: '200px' }}>
              <span style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>{stat.label}</span>
              <span style={{ fontSize: '36px', fontWeight: 700, color: '#60a5fa' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
