const { chromium } = require('C:/Users/AMITIME/AppData/Local/hermes/hermes-agent/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/AMITIME/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const login = await page.evaluate(() => fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'polish@test.dev', password: 'testpass123' })
  }).then(r => r.json()));
  console.log('login polish:', JSON.stringify(login));
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(() => document.body.innerText.includes('Recent Applications'), null, { timeout: 15000 });
    console.log('dashboard loaded OK');
  } catch { console.log('dashboard TIMEOUT'); }
  console.log('URL:', page.url());
  console.log('TEXT:', await page.evaluate(() => document.body.innerText.slice(0, 200).replace(/\n+/g, ' | ')));
  await browser.close();
})();
