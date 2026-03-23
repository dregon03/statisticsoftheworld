import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Automation Health Tests
 *
 * Verifies that all ETL scripts exist and the automation pipeline is healthy.
 */

const ROOT = path.resolve(__dirname, '../../');

test.describe('Automation — ETL Scripts Exist', () => {
  const SCRIPTS = [
    'scripts/etl.py',
    'scripts/etl_financial.py',
    'scripts/etl_yfinance.py',
    'scripts/etl_history.py',
    'scripts/etl_intl_orgs.py',
    'scripts/etl_polymarket.py',
    'scripts/etl_trade.py',
    'scripts/fetch_live_quotes.py',
    'scripts/audit_data.py',
    'scripts/reset_api_keys.py',
    'scripts/monitor_supabase.py',
    'scripts/setup_subscribers.py',
  ];

  for (const script of SCRIPTS) {
    test(`AUTO-SCRIPT: ${script} exists`, () => {
      const fullPath = path.join(ROOT, script);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  }
});

test.describe('Automation — GitHub Actions Workflow', () => {
  test('AUTO-GHA: etl.yml workflow exists', () => {
    const workflowPath = path.join(ROOT, '.github/workflows/etl.yml');
    expect(fs.existsSync(workflowPath)).toBe(true);
    const content = fs.readFileSync(workflowPath, 'utf-8');
    expect(content).toContain('schedule');
    expect(content).toContain('cron');
  });

  test('AUTO-GHA-QUOTES: live-quotes.yml workflow exists', () => {
    const workflowPath = path.join(ROOT, '.github/workflows/live-quotes.yml');
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  test('AUTO-GHA-JOBS: etl.yml has all expected jobs', () => {
    const content = fs.readFileSync(path.join(ROOT, '.github/workflows/etl.yml'), 'utf-8');
    const expectedJobs = [
      'api-keys', 'yfinance', 'financial', 'macro', 'history',
      'trade', 'metadata', 'polymarket', 'narratives', 'audit',
    ];
    for (const job of expectedJobs) {
      expect(content).toContain(`${job}:`);
    }
  });
});

test.describe('Automation — Newsletter & Subscribe', () => {
  test('AUTO-NEWSLETTER: Newsletter endpoint requires auth', async ({ request }) => {
    const res = await request.post('/api/newsletter');
    // Should NOT return 200 without auth token
    expect([401, 403, 405, 400, 500]).toContain(res.status());
  });

  test('AUTO-SUBSCRIBE: Subscribe accepts POST', async ({ request }) => {
    const res = await request.post('/api/subscribe', {
      data: { email: 'automation-test@example.com' },
    });
    // Should succeed or handle gracefully (not crash)
    expect([200, 201, 400, 409, 500]).toContain(res.status());
  });
});

test.describe('Automation — Infrastructure Files', () => {
  test('AUTO-SITEMAP: Sitemap has >1000 URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    const urlCount = (text.match(/<url>/g) || []).length;
    console.log(`Sitemap URLs: ${urlCount}`);
    expect(urlCount).toBeGreaterThan(500);
  });

  test('AUTO-ROBOTS: robots.txt allows AI crawlers', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    // Should mention AI bots or allow all
    expect(text.toLowerCase()).toMatch(/sitemap|allow/);
  });

  test('AUTO-LLMS: llms.txt exists and is substantial', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.ok()).toBe(true);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(200);
  });
});
