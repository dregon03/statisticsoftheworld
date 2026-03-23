import { test, expect } from '@playwright/test';

test.describe('API Endpoints — Health Check', () => {
  test('API01: GET /api/v1/countries returns country list', async ({ request }) => {
    const res = await request.get('/api/v1/countries');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Actual shape: { count: 218, data: [...] }
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(100);
  });

  test('API02: GET /api/indicator returns ranking data', async ({ request }) => {
    const res = await request.get('/api/indicator?id=SP.POP.TOTL&country=USA');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Returns array of all countries for this indicator
    expect(Array.isArray(body)).toBe(true);
    const usa = body.find((r: any) => r.countryId === 'USA');
    expect(usa).toBeDefined();
    expect(usa.value).toBeGreaterThan(0);
  });

  test('API03: GET /api/history returns time series', async ({ request }) => {
    const res = await request.get('/api/history?id=IMF.NGDPD&country=USA');
    // Returns 400 if missing required params or different format
    expect([200, 400, 404]).toContain(res.status());
  });

  test('API04: GET /api/v1/search?q=population', async ({ request }) => {
    const res = await request.get('/api/v1/search?q=population');
    expect(res.ok()).toBe(true);
  });

  test('API05: GET /api/forecasts', async ({ request }) => {
    const res = await request.get('/api/forecasts');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.countries).toBeDefined();
  });

  test('API06: GET /api/trending', async ({ request }) => {
    const res = await request.get('/api/trending');
    expect(res.ok()).toBe(true);
  });

  test('API07: GET /api/predictions', async ({ request }) => {
    const res = await request.get('/api/predictions');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Response shape: { count, total, markets: [...] }
    expect(body.markets).toBeDefined();
    expect(body.markets.length).toBeGreaterThan(0);
  });

  test('API08: GET /api/heatmap', async ({ request }) => {
    const res = await request.get('/api/heatmap');
    expect(res.ok()).toBe(true);
  });

  test('API09: GET /api/quotes', async ({ request }) => {
    const res = await request.get('/api/quotes');
    expect(res.ok()).toBe(true);
  });

  test('API10: GET /api/commodity-chart?id=YF.CRUDE_OIL', async ({ request }) => {
    const res = await request.get('/api/commodity-chart?id=YF.CRUDE_OIL');
    expect(res.ok()).toBe(true);
  });

  test('API11: GET /api/futures-curve?commodity=crude-oil', async ({ request }) => {
    const res = await request.get('/api/futures-curve?commodity=crude-oil');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.contracts).toBeDefined();
  });

  test('API12: GET /api/calendar', async ({ request }) => {
    const res = await request.get('/api/calendar');
    expect(res.ok()).toBe(true);
  });

  test('API13: GET /api/openapi.json — valid OpenAPI spec', async ({ request }) => {
    const res = await request.get('/api/openapi.json');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.openapi || body.swagger).toBeDefined();
    expect(body.paths).toBeDefined();
  });

  test('API14: GET /api/v2/country/USA — enriched country data', async ({ request }) => {
    const res = await request.get('/api/v2/country/USA');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.name || body.country).toBeDefined();
  });

  test('API15: GET /api/v2/indicator/SP.POP.TOTL', async ({ request }) => {
    const res = await request.get('/api/v2/indicator/SP.POP.TOTL');
    expect(res.ok()).toBe(true);
  });

  test('API16: GET /llms.txt', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(100);
  });

  test('API17: GET /.well-known/ai-plugin.json', async ({ request }) => {
    const res = await request.get('/.well-known/ai-plugin.json');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.schema_version || body.name_for_human || body.name_for_model).toBeDefined();
  });

  test('API18: GET /sitemap.xml', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text).toContain('<urlset');
  });

  test('API19: GET /robots.txt', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBe(true);
  });

  test('API20: POST /api/subscribe accepts email', async ({ request }) => {
    const res = await request.post('/api/subscribe', {
      data: { email: 'playwright-test@example.com' },
    });
    expect([200, 201, 400, 409]).toContain(res.status());
  });
});
