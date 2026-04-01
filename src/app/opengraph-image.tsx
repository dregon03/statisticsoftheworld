import { ImageResponse } from 'next/og';

export const alt = 'Statistics of the World — 440+ indicators for 218 countries';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white' }}>
            🌍
          </div>
          <span style={{ fontSize: '28px', color: '#94a3b8' }}>statisticsoftheworld.com</span>
        </div>
        <div style={{ fontSize: '64px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '24px' }}>
          Statistics of the World
        </div>
        <div style={{ fontSize: '32px', color: '#94a3b8', lineHeight: 1.4 }}>
          440+ economic indicators · 218 countries · Free API
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          {['GDP', 'Population', 'Markets', 'Trade', 'Health'].map((tag) => (
            <div key={tag} style={{ padding: '8px 20px', borderRadius: '20px', background: 'rgba(0,102,204,0.2)', border: '1px solid rgba(0,102,204,0.4)', color: '#60a5fa', fontSize: '20px' }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
