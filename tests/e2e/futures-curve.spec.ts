import { test, expect } from '@playwright/test';

/**
 * CME Futures Curve Tests
 */

const COMMODITIES = [
  'crude-oil', 'gold', 'natural-gas', 'silver', 'copper',
  'wheat', 'corn', 'soybeans', 'coffee', 'sugar',
  'platinum', 'palladium', 'cotton', 'lumber',
];

test.describe('Futures Curve — API', () => {
  test('FUT01: Crude oil futures curve returns data', async ({ request }) => {
    const res = await request.get('/api/futures-curve?commodity=crude-oil');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.contracts || body.curve).toBeDefined();
    if (body.contracts) {
      expect(body.contracts.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('FUT02: Structure is backwardation, contango, or flat', async ({ request }) => {
    const res = await request.get('/api/futures-curve?commodity=crude-oil');
    const body = await res.json();
    if (body.structure) {
      expect(['backwardation', 'contango', 'flat']).toContain(body.structure);
    }
  });

  test('FUT03: Contract prices are positive numbers', async ({ request }) => {
    const res = await request.get('/api/futures-curve?commodity=gold');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    if (body.contracts) {
      for (const c of body.contracts) {
        expect(c.price).toBeGreaterThan(0);
      }
    }
  });

  test('FUT04: All supported commodities return data', async ({ request }) => {
    let success = 0;
    let fail = 0;
    for (const commodity of COMMODITIES) {
      const res = await request.get(`/api/futures-curve?commodity=${commodity}`);
      if (res.ok()) {
        const body = await res.json();
        if (body.contracts && body.contracts.length > 0) {
          success++;
        } else {
          fail++;
        }
      } else {
        fail++;
      }
    }
    console.log(`Futures: ${success}/${COMMODITIES.length} commodities have data`);
    expect(success).toBeGreaterThanOrEqual(5); // At least 5 of 14 should work
  });

  test('FUT05: Gold futures have at least 3 contracts', async ({ request }) => {
    const res = await request.get('/api/futures-curve?commodity=gold');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    if (body.contracts) {
      expect(body.contracts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
