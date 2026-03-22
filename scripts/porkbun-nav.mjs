import { chromium } from 'playwright';

(async () => {
  const userDataDir = 'C:/Users/Tom/AppData/Local/Temp/pw-porkbun2';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 200,
    viewport: { width: 1400, height: 900 },
  });
  const page = context.pages()[0] || await context.newPage();

  // Go to Porkbun login
  await page.goto('https://porkbun.com/account/login', { timeout: 60000 });
  console.log('>>> SIGN IN TO PORKBUN <<<');

  // Wait for login — poll until URL changes from /login
  for (let i = 0; i < 90; i++) {
    const url = page.url();
    if (url.includes('/account') && !url.includes('/login')) break;
    if (!url.includes('porkbun.com')) break; // redirected elsewhere after login
    await page.waitForTimeout(2000);
  }
  console.log('Detected login. URL: ' + page.url());
  await page.waitForTimeout(2000);

  // Try the main domain management page
  console.log('Navigating to domain management...');
  await page.goto('https://porkbun.com/account/domains', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Dump all links to find the right URL structure
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: (a.textContent || '').trim().slice(0, 100), href: a.href }))
      .filter(l => l.href.includes('domain') || l.href.includes('dns') || l.text.toLowerCase().includes('domain') || l.text.toLowerCase().includes('dns'));
  });
  console.log('Relevant links:');
  for (const l of links.slice(0, 30)) {
    console.log(`  "${l.text}" -> ${l.href}`);
  }

  // Also log the page title and current URL
  console.log('Page title:', await page.title());
  console.log('Current URL:', page.url());

  await page.screenshot({ path: 'scripts/porkbun-dns.png', fullPage: true });
  console.log('Screenshot saved');

  // Keep open
  await page.waitForTimeout(600000);
  await context.close();
})();
