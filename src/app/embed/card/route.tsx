import { ImageResponse } from 'next/og';
import { getCountry, getAllIndicatorsForCountry, formatValue } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get('country') || 'USA';

  const country = await getCountry(countryId);
  if (!country) {
    return new Response('Country not found', { status: 404 });
  }

  const indicators = await getAllIndicatorsForCountry(countryId);
  const gdp = indicators['IMF.NGDPD'];
  const pop = indicators['SP.POP.TOTL'];
  const gdpPc = indicators['IMF.NGDPDPC'];
  const growth = indicators['IMF.NGDP_RPCH'];
  const inflation = indicators['IMF.PCPIPCH'];
  const unemp = indicators['IMF.LUR'];

  const stats = [
    gdp ? { label: 'GDP', value: formatValue(gdp.value, 'currency') } : null,
    pop ? { label: 'Population', value: formatValue(pop.value, 'number') } : null,
    gdpPc ? { label: 'GDP/Capita', value: formatValue(gdpPc.value, 'currency') } : null,
    growth ? { label: 'Growth', value: formatValue(growth.value, 'percent', 1) } : null,
    inflation ? { label: 'Inflation', value: formatValue(inflation.value, 'percent', 1) } : null,
    unemp ? { label: 'Unemployment', value: formatValue(unemp.value, 'percent', 1) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px',
          fontFamily: 'system-ui, sans-serif',
          border: '1px solid #d5dce6',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={`https://flagcdn.com/w80/${country.iso2.toLowerCase()}.png`}
              width="40"
              height="30"
              style={{ borderRadius: '4px' }}
            />
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#0d1b2a' }}>{country.name}</span>
          </div>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{gdp?.year || new Date().getFullYear()}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ flex: '1 1 140px', background: '#f8f9fb', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0d1b2a' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #edf0f5' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Source: IMF & World Bank</span>
          <span style={{ fontSize: '12px', color: '#0066cc' }}>statisticsoftheworld.com</span>
        </div>
      </div>
    ),
    { width: 600, height: 320 }
  );
}
