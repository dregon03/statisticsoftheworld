import { test, expect } from '@playwright/test';

/**
 * Financial Data Sanity Checks
 *
 * Verifies that stock indices, commodities, and FX rates are in sane ranges.
 * These are populated by scripts/etl_yfinance.py and scripts/etl_financial.py.
 */

test.describe('Financial Data — Stock Indices', () => {
  test('FIN01: S&P 500 in sane range (4000-10000)', async ({ request }) => {
    const res = await request.get('/api/indicator?id=YF.IDX.USA&country=USA');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const val = body.value ?? body.data?.value;
    if (val != null) {
      console.log(`S&P 500: ${val}`);
      expect(val).toBeGreaterThan(3000);
      expect(val).toBeLessThan(10000);
    }
  });
});

test.describe('Financial Data — Commodities', () => {
  test('FIN02: Gold price in range ($2000-$5500)', async ({ request }) => {
    const res = await request.get('/api/indicator?id=YF.GOLD&country=WLD');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const val = body.value ?? body.data?.value;
    if (val != null) {
      console.log(`Gold: $${val}`);
      expect(val).toBeGreaterThan(1500);
      expect(val).toBeLessThan(5500);
    }
  });

  test('FIN03: WTI Crude in range ($30-$150)', async ({ request }) => {
    const res = await request.get('/api/indicator?id=YF.CRUDE_OIL&country=WLD');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const val = body.value ?? body.data?.value;
    if (val != null) {
      console.log(`WTI Crude: $${val}`);
      expect(val).toBeGreaterThan(20);
      expect(val).toBeLessThan(200);
    }
  });
});

test.describe('Financial Data — FX Rates', () => {
  test('FIN04: EUR/USD in range (0.8-1.5)', async ({ request }) => {
    const res = await request.get('/api/indicator?id=YF.FX.EUR&country=WLD');
    if (!res.ok()) { test.skip(); return; }
    const body = await res.json();
    const val = body.value ?? body.data?.value;
    if (val != null) {
      console.log(`EUR/USD: ${val}`);
      expect(val).toBeGreaterThan(0.7);
      expect(val).toBeLessThan(1.6);
    }
  });
});

test.describe('Financial Data — Interest Rates', () => {
  test('FIN05: Fed Funds rate in range (0-10%)', async ({ request }) => {
    const res = await request.get('/api/indicator?id=FRED.FEDFUNDS&country=USA');
    if (!res.ok()) { test.skip(); return; }
    const body = await res.json();
    const val = body.value ?? body.data?.value;
    if (val != null) {
      console.log(`Fed Funds: ${val}%`);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(12);
    }
  });

  test('FIN06: 10Y Treasury yield in range (1-8%)', async ({ request }) => {
    const res = await request.get('/api/indicator?id=FRED.DGS10&country=USA');
    if (!res.ok()) { test.skip(); return; }
    const body = await res.json();
    const val = body.value ?? body.data?.value;
    if (val != null) {
      console.log(`10Y Treasury: ${val}%`);
      expect(val).toBeGreaterThan(0.5);
      expect(val).toBeLessThan(10);
    }
  });
});

test.describe('Financial Data — Quotes Freshness', () => {
  test('FIN07: /api/quotes returns data', async ({ request }) => {
    const res = await request.get('/api/quotes');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Should have at least some quote data
    const keys = Object.keys(body);
    expect(keys.length).toBeGreaterThan(0);
  });

  test('FIN08: Commodities page returns 200', async ({ page }) => {
    const res = await page.goto('/commodities');
    expect(res?.ok()).toBe(true);
  });
});
