import { test, expect } from '@playwright/test';

/**
 * Security Tests
 */

test.describe('Security — Auth Protection', () => {
  test('SEC01: Newsletter endpoint requires token', async ({ request }) => {
    const res = await request.post('/api/newsletter');
    expect(res.status()).not.toBe(200);
  });

  test('SEC02: API key creation requires auth', async ({ request }) => {
    const res = await request.post('/api/keys', {
      data: { name: 'test-key' },
    });
    // Should not freely create API keys
    expect([401, 403, 405, 400]).toContain(res.status());
  });
});

test.describe('Security — XSS Prevention', () => {
  test('SEC03: Search with script tag does not execute', async ({ page }) => {
    await page.goto('/countries');
    const pageText = await page.locator('body').innerHTML();
    // Ensure no unescaped script tags in the rendered HTML
    const scriptInjection = '<script>alert(1)</script>';
    // Navigate with XSS in URL if search exists
    await page.goto(`/?q=${encodeURIComponent(scriptInjection)}`);
    const bodyHtml = await page.locator('body').innerHTML();
    // Should NOT contain unescaped script tag
    expect(bodyHtml).not.toContain('<script>alert(1)</script>');
  });
});

test.describe('Security — No Sensitive Data Leaked', () => {
  test('SEC04: Page source does not contain API keys', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    // Check for common key patterns
    expect(html).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(html).not.toMatch(/sk-or-v1-[a-f0-9]{64}/); // OpenRouter keys
    expect(html).not.toMatch(/NEWSLETTER_SECRET/);
  });

  test('SEC05: /api/v2/country/USA does not leak env vars', async ({ request }) => {
    const res = await request.get('/api/v2/country/USA');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text).not.toContain('SUPABASE_DB_PASSWORD');
    expect(text).not.toContain('sk-or-v1-');
  });
});

test.describe('Security — Error Handling', () => {
  test('SEC06: Invalid API routes return proper errors', async ({ request }) => {
    const res = await request.get('/api/nonexistent-endpoint');
    expect([404, 405]).toContain(res.status());
  });
});
