/**
 * End-to-end UI test of the paid-API flow.
 *
 * Walks the user journey on https://statisticsoftheworld.com:
 *   1. /pricing loads, nav shows API dropdown
 *   2. Click "Get Free API Key" → submit email → API key displayed
 *   3. Click Subscribe on Pro tier → Stripe Checkout loads in test mode
 *   4. Fill the test card 4242 4242 4242 4242 → submit
 *   5. Confirm redirect to /pricing/success and that webhook upgraded the key
 *
 * Runs against the currently deployed build (the new middleware isn't deployed
 * yet — that's a separate task).
 */
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const TS = Date.now();
const EMAIL = `playwright-e2e-${TS}@sotw-test.local`;
const BASE = 'https://statisticsoftheworld.com';

const log = (...a) => console.log('[e2e]', ...a);

const lookupKey = async () => {
  const r = await fetch(`${BASE}/api/keys?email=${encodeURIComponent(EMAIL)}`);
  const j = await r.json();
  return j.keys?.[0] || null;
};

const sshQuery = (sql) => {
  // stdin pipe avoids all nested quote escaping
  const out = execSync(
    'ssh -i C:/Users/Tom/.ssh/hetzner -o StrictHostKeyChecking=no ubuntu@144.217.14.51 "sudo docker exec -i supabase-db psql -U postgres -d postgres -t -A"',
    { encoding: 'utf8', input: sql },
  );
  return out.trim();
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') log('page-console-error:', msg.text());
  });

  try {
    log('1/7 navigate /pricing');
    await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("API Pricing")', { timeout: 10000 });
    // Give React a beat to attach click handlers after hydration
    await page.waitForTimeout(1000);

    log('  checking nav has API dropdown (deployed?)…');
    const navApi = await page.locator('nav >> text=API').count();
    log(`  nav shows "API" label: ${navApi > 0 ? 'yes (new middleware/nav likely deployed)' : 'no (still on old build)'}`);

    log('2/7 click "Get Free API Key"');
    await page.locator('button', { hasText: /^Get Free API Key$/ }).first().click();
    await page.waitForSelector('h3:has-text("Get Your Free API Key")', { timeout: 10000 });

    log('3/7 submit signup form');
    await page.getByPlaceholder('your@email.com').first().fill(EMAIL);
    await page.getByPlaceholder('Name or project (optional)').fill('playwright-e2e');
    await page.getByRole('button', { name: 'Generate API Key' }).click();
    await page.waitForSelector('text=Your API Key', { timeout: 10000 });
    const freeKey = await page.locator('.font-mono.text-\\[15px\\]').first().textContent();
    log(`  free key issued: ${freeKey?.slice(0, 12)}…`);

    log('  row state via /api/keys lookup:');
    const before = await lookupKey();
    log(`  > ${JSON.stringify(before)}`);

    // Close the signup modal by clicking the backdrop (the wrapper div has onClick=close)
    await page.locator('div.fixed.inset-0.bg-black\\/30').click({ position: { x: 5, y: 5 } });
    await page.waitForSelector('h3:has-text("Get Your Free API Key")', { state: 'detached', timeout: 5000 });

    log('4/7 click Subscribe on Pro tier');
    // Email persists in page state from the signup flow, so Pro's Subscribe click
    // skips the email-capture modal and goes straight to Stripe Checkout.
    const subscribeButtons = page.getByRole('button', { name: 'Subscribe' });
    await subscribeButtons.first().click(); // first Subscribe = Pro

    log('  waiting for Stripe Checkout redirect…');
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20000 });
    log(`  landed on: ${page.url().slice(0, 60)}…`);

    log('5/7 fill Stripe test card');
    // Stripe Checkout form fields
    await page.waitForSelector('input[name="cardNumber"], input#cardNumber', { timeout: 15000 });
    await page.locator('input[name="cardNumber"], input#cardNumber').fill('4242424242424242');
    await page.locator('input[name="cardExpiry"], input#cardExpiry').fill('12 / 34');
    await page.locator('input[name="cardCvc"], input#cardCvc').fill('123');
    // Cardholder name (required in most countries)
    const nameField = page.locator('input[name="billingName"], input#billingName');
    if (await nameField.count()) await nameField.fill('Playwright E2E');
    // Country (already defaults to US if account locale is US, but set anyway)
    const countrySel = page.locator('select[name="billingCountry"], select#billingCountry');
    if (await countrySel.count()) await countrySel.selectOption('US').catch(() => {});
    // ZIP / postal — Stripe's field name has shifted over versions. Try several, then
    // fall back to the visible ZIP placeholder.
    const postal = page.locator(
      'input[name="billingPostalCode"], input#billingPostalCode, ' +
      'input[name="postalCode"], input[placeholder="ZIP"], input[placeholder="Postal code"]',
    ).first();
    await postal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await postal.count()) await postal.fill('10001');

    log('  submit payment');
    await page.getByTestId('hosted-payment-submit-button').click().catch(async () => {
      await page.locator('button[type="submit"]:has-text("Subscribe"), button:has-text("Pay ")').first().click();
    });

    log('6/7 wait for redirect to /pricing/success');
    await page.waitForURL(/pricing\/success/, { timeout: 45000 });
    log(`  success URL: ${page.url()}`);

    log('7/7 give webhook a beat, then poll key state');
    let after = null;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(2000);
      after = await lookupKey();
      if (after?.tier === 'pro') break;
    }
    log(`  > ${JSON.stringify(after)}`);

    const ok = after?.tier === 'pro' && after?.rate_limit === 50000;
    log(ok ? 'UPGRADE CONFIRMED - tier=pro, 50000/day' : 'UPGRADE FAILED');

  } catch (err) {
    log('ERROR:', err.message);
    await page.screenshot({ path: 'scripts/e2e-failure.png', fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    log('cleanup: delete test row from Supabase');
    try {
      sshQuery(`DELETE FROM sotw_api_keys WHERE email='${EMAIL}';`);
      log('  row deleted');
    } catch (e) {
      log('cleanup skipped:', e.message);
    }
    await browser.close();
  }
})();
