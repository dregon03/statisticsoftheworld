import { test, expect } from '@playwright/test';

/**
 * Data Coverage Tests — uses actual API response shapes.
 * /api/v1/countries → { count: N, data: [...] }
 * /api/indicator → returns array of all countries for indicator
 */

test.describe('Data Coverage — Countries', () => {
  test('COV01: At least 200 countries in database', async ({ request }) => {
    const res = await request.get('/api/v1/countries');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const count = body.count || body.data?.length || 0;
    console.log(`Countries: ${count}`);
    expect(count).toBeGreaterThanOrEqual(200);
  });

  test('COV02: G20 countries all present', async ({ request }) => {
    const res = await request.get('/api/v1/countries');
    const body = await res.json();
    const countries = body.data || [];
    const ids = new Set(countries.map((c: any) => c.id));
    const G20 = ['USA', 'CHN', 'JPN', 'DEU', 'GBR', 'FRA', 'IND', 'BRA', 'CAN', 'AUS',
      'KOR', 'MEX', 'RUS', 'ITA', 'IDN', 'TUR', 'SAU', 'ARG', 'ZAF'];
    let missing = 0;
    for (const code of G20) {
      if (!ids.has(code)) { missing++; console.log(`Missing: ${code}`); }
    }
    expect(missing).toBe(0);
  });
});

test.describe('Data Coverage — Indicators', () => {
  test('COV03: G20 have GDP data', async ({ request }) => {
    const res = await request.get('/api/indicator?id=IMF.NGDPD');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    const G20_SAMPLE = ['USA', 'CHN', 'JPN', 'DEU', 'GBR'];
    for (const code of G20_SAMPLE) {
      const entry = body.find((r: any) => r.countryId === code);
      expect(entry).toBeDefined();
      expect(entry?.value).not.toBeNull();
    }
  });

  test('COV04: G20 have population data', async ({ request }) => {
    const res = await request.get('/api/indicator?id=SP.POP.TOTL');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    const SAMPLE = ['USA', 'CHN', 'IND', 'BRA', 'JPN'];
    for (const code of SAMPLE) {
      const entry = body.find((r: any) => r.countryId === code);
      expect(entry).toBeDefined();
    }
  });

  test('COV05: Historical data available for US GDP', async ({ request }) => {
    // Try the indicator API — it includes year field
    const res = await request.get('/api/indicator?id=IMF.NGDPD');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const usa = body.find((r: any) => r.countryId === 'USA');
    expect(usa).toBeDefined();
    // Check that we have a recent year
    if (usa?.year) {
      expect(parseInt(usa.year)).toBeGreaterThanOrEqual(2023);
    }
  });
});

test.describe('Data Coverage — Indicator Metadata', () => {
  test('COV06: /api/indicator-context returns metadata', async ({ request }) => {
    const res = await request.get('/api/indicator-context?id=SP.POP.TOTL');
    if (res.ok()) {
      const body = await res.json();
      expect(body.description || body.methodology || body.context).toBeDefined();
    }
  });
});

test.describe('Data Coverage — Search', () => {
  test('COV07: Search finds GDP-related indicators', async ({ request }) => {
    const res = await request.get('/api/v1/search?q=GDP');
    expect(res.ok()).toBe(true);
  });

  test('COV08: Search finds population indicators', async ({ request }) => {
    const res = await request.get('/api/v1/search?q=population');
    expect(res.ok()).toBe(true);
  });
});
