import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/countries',
    description: 'List all 217 countries with metadata.',
    example: '{"count":217,"data":[{"id":"USA","name":"United States","region":"North America",...}]}',
  },
  {
    method: 'GET',
    path: '/api/v1/countries/:id',
    description: 'Get a single country with all latest indicator values.',
    example: '{"country":{"id":"CAN","name":"Canada",...},"indicators":[{"id":"IMF.NGDPD","value":2420000000000,...}]}',
  },
  {
    method: 'GET',
    path: '/api/v1/indicators',
    description: 'List all indicators with categories and metadata.',
    example: '{"count":335,"categories":[...],"data":[{"id":"SP.POP.TOTL","label":"Population",...}]}',
  },
  {
    method: 'GET',
    path: '/api/v1/indicators/:id',
    description: 'Get a single indicator ranked across all countries.',
    example: '{"indicator":{...},"count":192,"data":[{"rank":1,"countryId":"USA","value":31820000000000},...]}',
  },
  {
    method: 'GET',
    path: '/api/v1/history/:indicator/:country',
    description: 'Get 20+ years of historical data for an indicator-country pair.',
    example: '{"indicator":{...},"country":"CAN","data":[{"year":2000,"value":744631000000},{"year":2001,...}]}',
  },
  {
    method: 'GET',
    path: '/api/v1/rankings/:indicator',
    description: 'Get ranked list of countries for an indicator. Supports ?limit=N parameter.',
    example: '{"indicator":{...},"count":192,"data":[{"rank":1,"countryId":"CHN","country":"China","value":1425893000},...]}',
  },
];

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <Nav />

      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-bold mb-2">API Documentation</h1>
        <p className="text-[14px] text-[#666] mb-2">
          Free REST API for global statistics. JSON responses. No authentication required for basic access.
        </p>
        <div className="text-[13px] text-[#999] mb-8">
          Base URL: <code className="bg-[#f8f9fa] px-2 py-0.5 rounded text-[#333]">https://statisticsoftheworld.com</code>
        </div>

        {/* Rate limits */}
        <div className="border border-[#e8e8e8] rounded-lg p-5 mb-8 bg-[#f8f9fa]">
          <h2 className="text-[15px] font-semibold mb-2">Rate Limits</h2>
          <table className="text-[13px]">
            <tbody>
              <tr>
                <td className="pr-8 py-1 text-[#666]">Free (no key)</td>
                <td className="py-1">100 requests/day</td>
              </tr>
              <tr>
                <td className="pr-8 py-1 text-[#666]">Authenticated</td>
                <td className="py-1">10,000 requests/day — add <code className="bg-white px-1 rounded">X-API-Key</code> header</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[12px] text-[#999] mt-2">Rate limit headers included in every response: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset</p>
        </div>

        {/* Endpoints */}
        <h2 className="text-[18px] font-semibold mb-4">Endpoints</h2>
        <div className="space-y-6">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="border border-[#e8e8e8] rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f8f9fa] border-b border-[#e8e8e8]">
                <span className="text-[11px] font-bold bg-[#0066cc] text-white px-2 py-0.5 rounded">{ep.method}</span>
                <code className="text-[13px] font-mono text-[#333]">{ep.path}</code>
              </div>
              <div className="px-4 py-3">
                <p className="text-[13px] text-[#666] mb-3">{ep.description}</p>
                <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Example curl</div>
                <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[12px] p-3 rounded overflow-x-auto">
                  <code>curl https://statisticsoftheworld.com{ep.path.replace(':id', 'USA').replace(':indicator', 'SP.POP.TOTL').replace(':country', 'CAN')}</code>
                </pre>
                <div className="text-[11px] text-[#999] uppercase tracking-wider mt-3 mb-1">Response</div>
                <pre className="bg-[#f8f9fa] text-[12px] p-3 rounded overflow-x-auto text-[#333]">
                  <code>{ep.example}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Data sources */}
        <div className="mt-10 pt-6 border-t border-[#e8e8e8]">
          <h2 className="text-[15px] font-semibold mb-3">Data Sources</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px] text-[#666]">
            <div>IMF World Economic Outlook</div>
            <div>World Bank WDI</div>
            <div>FRED (Federal Reserve)</div>
            <div>Yahoo Finance</div>
            <div>European Central Bank</div>
            <div>Alpha Vantage</div>
            <div>ExchangeRate-API</div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
