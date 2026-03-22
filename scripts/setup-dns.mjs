import { chromium } from 'playwright';

const DOMAIN = 'statisticsoftheworld.com';
const SCREENSHOT = 'scripts/porkbun-dns.png';

(async () => {
  // Use persistent context so login session is preserved
  const userDataDir = 'C:/Users/Tom/AppData/Local/Temp/pw-porkbun';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 200,
    viewport: { width: 1400, height: 900 },
  });
  const page = context.pages()[0] || await context.newPage();

  // Go to Porkbun
  console.log('Opening Porkbun...');
  await page.goto('https://porkbun.com/account/login');

  // Check if already logged in (redirects to account page) or need to sign in
  console.log('>>> SIGN IN TO PORKBUN IF NEEDED <<<');

  // Wait until we're on an account page (logged in)
  while (true) {
    const url = page.url();
    if (url.includes('/account/') && !url.includes('/login')) break;
    await page.waitForTimeout(2000);
  }
  console.log('Logged in!');
  await page.waitForTimeout(1000);

  // Go to domain management list
  console.log('Going to domains page...');
  await page.goto('https://porkbun.com/account/domainsSpe');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: SCREENSHOT, fullPage: true });
  console.log('Screenshot 1: domains list');

  // Look for the domain and click DNS
  const domainLink = page.locator(`text=${DOMAIN}`).first();
  if (await domainLink.count() > 0) {
    console.log(`Found ${DOMAIN} on page`);

    // Look for a DNS link/button near the domain
    // Try clicking on the domain row to expand it, or find a DNS link
    const dnsLink = page.locator(`a[href*="dns"][href*="${DOMAIN}"], a:has-text("DNS")`).first();
    if (await dnsLink.count() > 0) {
      await dnsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      // Try clicking the domain text to see details
      await domainLink.click();
      await page.waitForTimeout(2000);
    }
  } else {
    console.log(`Domain ${DOMAIN} not found on page. Current URL: ${page.url()}`);
  }

  await page.screenshot({ path: SCREENSHOT, fullPage: true });
  console.log('Screenshot 2: after clicking domain/DNS');
  console.log(`Current URL: ${page.url()}`);

  // Keep browser open
  console.log('Browser staying open...');
  await page.waitForTimeout(600000);
  await context.close();
})();
