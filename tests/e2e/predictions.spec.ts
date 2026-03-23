import { test, expect } from '@playwright/test';

/**
 * Polymarket Prediction Market Tests
 * API returns: { count, total, markets: [...], categories: [...] }
 */

test.describe('Predictions — API', () => {
  test('PRED01: /api/predictions returns prediction data', async ({ request }) => {
    const res = await request.get('/api/predictions');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.markets).toBeDefined();
    expect(Array.isArray(body.markets)).toBe(true);
    expect(body.markets.length).toBeGreaterThan(0);
  });

  test('PRED02: Probabilities are valid (0-1 range)', async ({ request }) => {
    const res = await request.get('/api/predictions');
    const body = await res.json();
    for (const m of body.markets.slice(0, 50)) {
      const prob = m.probability;
      if (prob != null) {
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(1);
      }
    }
  });

  test('PRED03: At least 30 predictions available', async ({ request }) => {
    const res = await request.get('/api/predictions');
    const body = await res.json();
    console.log(`Predictions available: ${body.markets.length}`);
    expect(body.markets.length).toBeGreaterThanOrEqual(30);
  });

  test('PRED04: Each prediction has a question', async ({ request }) => {
    const res = await request.get('/api/predictions');
    const body = await res.json();
    for (const m of body.markets.slice(0, 20)) {
      expect(m.question || m.title).toBeTruthy();
    }
  });
});

test.describe('Predictions — Page', () => {
  test('PRED05: /predictions page returns 200', async ({ page }) => {
    const res = await page.goto('/predictions');
    expect(res?.ok()).toBe(true);
  });

  test('PRED06: Predictions API has categories', async ({ request }) => {
    const res = await request.get('/api/predictions');
    const body = await res.json();
    expect(body.categories).toBeDefined();
    expect(body.categories.length).toBeGreaterThan(0);
  });
});
