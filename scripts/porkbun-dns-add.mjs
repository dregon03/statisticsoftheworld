import { chromium } from 'playwright';

const DOMAIN = 'statisticsoftheworld.com';
const PROFILE = '/tmp/pw-pb-49iMwj';

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    slowMo: 400,
    viewport: { width: 1400, height: 900 },
  });
  const page = context.pages()[0] || await context.newPage();

  // Should still be logged in
  await page.goto('https://porkbun.com/account/domainsSpeedy', { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());

  // Find the DNS icon for our domain by inspecting onclick handlers
  const dnsInfo = await page.evaluate((domain) => {
    // Find all elements containing our domain name
    const allText = document.body.querySelectorAll('*');
    for (const el of allText) {
      if (el.children.length === 0 && el.textContent?.trim() === domain) {
        // Found the domain label. Now walk up to the row.
        let row = el;
        for (let i = 0; i < 10; i++) {
          row = row.parentElement;
          if (!row) break;
          // Look for onclick handlers that mention "dns" in this container
          const onclickEls = row.querySelectorAll('[onclick]');
          if (onclickEls.length >= 3) {
            const buttons = [];
            for (const btn of onclickEls) {
              const oc = btn.getAttribute('onclick') || '';
              buttons.push({
                onclick: oc.slice(0, 300),
                title: btn.getAttribute('title') || btn.getAttribute('data-original-title') || '',
                class: (btn.className || '').toString().slice(0, 100),
                text: btn.textContent?.trim().slice(0, 30),
              });
            }
            return { found: true, rowClass: row.className, buttons };
          }
        }
      }
    }
    return { found: false };
  }, DOMAIN);

  console.log(JSON.stringify(dnsInfo, null, 2));

  if (dnsInfo.found) {
    // Find the DNS button - look for onclick containing 'dns' or 'DNS'
    const dnsButton = dnsInfo.buttons.find(b =>
      b.onclick.toLowerCase().includes('dns') ||
      b.title.toLowerCase().includes('dns')
    );

    if (dnsButton) {
      console.log('Found DNS button:', dnsButton.onclick.slice(0, 100));

      // Click it
      const clicked = await page.evaluate((domain, targetOnclick) => {
        const allText = document.body.querySelectorAll('*');
        for (const el of allText) {
          if (el.children.length === 0 && el.textContent?.trim() === domain) {
            let row = el;
            for (let i = 0; i < 10; i++) {
              row = row.parentElement;
              if (!row) break;
              const btn = row.querySelector(`[onclick*="dns"], [onclick*="DNS"], [onclick*="Dns"]`);
              if (btn) {
                btn.click();
                return true;
              }
            }
          }
        }
        return false;
      }, DOMAIN);

      console.log('Clicked DNS button:', clicked);
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'scripts/porkbun-dns.png', fullPage: true });
      console.log('Screenshot after DNS click saved');
    } else {
      console.log('No DNS button found in onclick handlers. Buttons:',
        dnsInfo.buttons.map(b => b.title || b.onclick.slice(0, 50)));
    }
  }

  // Keep open
  console.log('Browser staying open.');
  await page.waitForTimeout(600000);
  await context.close();
})();
