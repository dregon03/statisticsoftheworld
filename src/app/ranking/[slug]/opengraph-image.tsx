import { ImageResponse } from 'next/og';

const SLUG_MAP: Record<string, { title: string }> = {
  'gdp': { title: 'GDP by Country' },
  'gdp-growth': { title: 'GDP Growth by Country' },
  'gdp-per-capita': { title: 'GDP per Capita by Country' },
  'gdp-ppp': { title: 'GDP (PPP) by Country' },
  'gdp-per-capita-ppp': { title: 'GDP per Capita (PPP) by Country' },
  'inflation-rate': { title: 'Inflation Rate by Country' },
  'unemployment-rate': { title: 'Unemployment Rate by Country' },
  'government-debt': { title: 'Government Debt by Country' },
  'current-account': { title: 'Current Account by Country' },
  'population': { title: 'Population by Country' },
  'population-growth': { title: 'Population Growth by Country' },
  'life-expectancy': { title: 'Life Expectancy by Country' },
  'fertility-rate': { title: 'Fertility Rate by Country' },
  'co2-emissions': { title: 'CO₂ Emissions by Country' },
  'internet-users': { title: 'Internet Users by Country' },
  'health-spending': { title: 'Health Spending by Country' },
  'education-spending': { title: 'Education Spending by Country' },
  'military-spending': { title: 'Military Spending by Country' },
  'trade-openness': { title: 'Trade Openness by Country' },
  'fdi-inflows': { title: 'FDI Inflows by Country' },
  'gini-index': { title: 'Gini Index by Country' },
  'poverty-rate': { title: 'Poverty Rate by Country' },
  'infant-mortality': { title: 'Infant Mortality by Country' },
  'urban-population': { title: 'Urban Population by Country' },
  'renewable-energy': { title: 'Renewable Energy by Country' },
  'forest-area': { title: 'Forest Area by Country' },
  'corruption-control': { title: 'Control of Corruption by Country' },
  'rule-of-law': { title: 'Rule of Law by Country' },
  'tourism-arrivals': { title: 'Tourism Arrivals by Country' },
};

export const alt = 'Country Rankings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = SLUG_MAP[slug];
  if (!config) return new Response('Not found', { status: 404 });

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
        <div style={{ fontSize: '28px', color: '#64748b', marginBottom: '12px' }}>
          2026 Rankings
        </div>
        <div style={{ fontSize: '56px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '40px' }}>
          {config.title}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['218 Countries', 'Interactive Charts', 'Historical Data', 'Free API'].map((tag) => (
            <div key={tag} style={{ padding: '10px 24px', borderRadius: '20px', background: 'rgba(0,102,204,0.2)', border: '1px solid rgba(0,102,204,0.4)', color: '#60a5fa', fontSize: '20px' }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
