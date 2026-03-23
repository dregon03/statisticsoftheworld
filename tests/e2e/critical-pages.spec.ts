import { test, expect } from '@playwright/test';

/**
 * Critical Pages — verify all page types return 200.
 * Most pages are client-rendered ('use client'), so we check HTTP status
 * rather than text content to avoid hydration timing issues.
 */
test.describe('Critical Pages — All Page Types Load', () => {
  const PAGES: [string, string][] = [
    ['/', 'P01: Homepage'],
    ['/countries', 'P02: Countries'],
    ['/country/USA', 'P03: Country detail (USA)'],
    ['/indicators', 'P05: Indicators'],
    ['/rankings', 'P06: Rankings'],
    ['/ranking/gdp', 'P07: Ranking detail'],
    ['/compare', 'P08: Compare'],
    ['/map', 'P09: Map'],
    ['/heatmap', 'P10: Heatmap'],
    ['/forecasts', 'P11: Forecasts'],
    ['/commodities', 'P12: Commodities'],
    ['/predictions', 'P13: Predictions'],
    ['/markets', 'P14: Markets'],
    ['/calendar', 'P15: Calendar'],
    ['/trade', 'P16: Trade'],
    ['/scatter', 'P17: Scatter'],
    ['/dashboard', 'P18: Dashboard'],
    ['/credit-ratings', 'P19: Credit Ratings'],
    ['/vision', 'P20: Vision'],
    ['/ai', 'P21: AI Docs'],
    ['/api-docs', 'P22: API Docs'],
    ['/pricing', 'P23: Pricing'],
    ['/trending', 'P24: Trending'],
    ['/regions', 'P25: Regions'],
  ];

  for (const [path, label] of PAGES) {
    test(`${label} — ${path} returns 200`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBe(true);
    });
  }

  test('P04: /country/INVALID — returns 404', async ({ page }) => {
    const res = await page.goto('/country/INVALIDXYZ');
    expect(res?.status()).toBe(404);
  });

  test('P02b: /countries page has country links', async ({ page }) => {
    await page.goto('/countries');
    await expect(page.locator('a[href*="/country/"]').first()).toBeVisible();
  });
});
