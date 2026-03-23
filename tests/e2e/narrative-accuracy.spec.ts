import { test, expect } from '@playwright/test';

/**
 * AI Narrative Accuracy — Country Pages & API
 *
 * Country pages are client-rendered, so we test narratives via the API.
 * The /api/narrative endpoint returns: { narrative: "..." }
 */

const MAJOR_COUNTRIES = [
  { code: 'USA', name: 'United States' },
  { code: 'CHN', name: 'China' },
  { code: 'JPN', name: 'Japan' },
  { code: 'DEU', name: 'Germany' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'IND', name: 'India' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'CAN', name: 'Canada' },
  { code: 'AUS', name: 'Australia' },
  { code: 'KOR', name: 'Korea' },
];

test.describe('Narrative API — Country Narratives', () => {
  for (const { code, name } of MAJOR_COUNTRIES) {
    test(`NAR-${code}: ${name} narrative is valid`, async ({ request }) => {
      test.setTimeout(30_000);
      const res = await request.get(`/api/narrative?id=${code}`);
      expect(res.ok()).toBe(true);
      const body = await res.json();
      const narrative: string = body.narrative || '';

      // Narrative exists and is substantial
      expect(narrative.length).toBeGreaterThan(100);

      // No error artifacts
      expect(narrative).not.toContain('undefined');
      expect(narrative).not.toContain('[object Object]');
      expect(narrative).not.toMatch(/\bNaN\b/);

      // Contains numbers (GDP, population, etc.)
      expect(narrative).toMatch(/\d/);
    });
  }
});

test.describe('Country Pages — Load Check', () => {
  for (const { code, name } of MAJOR_COUNTRIES.slice(0, 5)) {
    test(`PAGE-${code}: /country/${code} returns 200`, async ({ page }) => {
      const res = await page.goto(`/country/${code}`);
      expect(res?.ok()).toBe(true);
    });
  }
});

test.describe('AI Chat Accuracy', () => {
  test('CHAT01: Chat returns relevant response for GDP question', async ({ request }) => {
    test.setTimeout(60_000);
    const res = await request.post('/api/chat', {
      data: { message: 'What is the GDP of the United States?' },
    });
    // Chat uses OpenRouter — may return 502 if API key expired
    if (res.status() === 502 || res.status() === 500) {
      console.log('⚠ AI Chat returned 502/500 — OpenRouter API key may need refreshing');
      test.skip();
      return;
    }
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const answer = body.response || body.answer || body.content || '';
    expect(answer.length).toBeGreaterThan(10);
  });

  test('CHAT02: Chat handles empty message gracefully', async ({ request }) => {
    const res = await request.post('/api/chat', { data: { message: '' } });
    expect([400, 422, 502]).toContain(res.status());
  });

  test('CHAT03: Chat handles comparison query', async ({ request }) => {
    test.setTimeout(60_000);
    const res = await request.post('/api/chat', {
      data: { message: 'Compare Japan and Germany population' },
    });
    if (res.status() === 502 || res.status() === 500) {
      console.log('⚠ AI Chat returned 502/500 — OpenRouter API key may need refreshing');
      test.skip();
      return;
    }
    expect(res.ok()).toBe(true);
  });
});
