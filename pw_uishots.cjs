const { chromium } = require('C:/Users/AMITIME/AppData/Local/hermes/hermes-agent/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/AMITIME/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:3002/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.evaluate(() => fetch('/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Shots', email: 'shots@test.dev', password: 'testpass123' })
  }).then(r => r.json()));

  const shots = [
    ['dash', '/'],
    ['apps-table', '/applications'],
    ['companies', '/companies'],
    ['calendar', '/calendar'],
    ['analytics', '/analytics'],
  ];
  for (const [name, route] of shots) {
    await page.goto('http://127.0.0.1:3002' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `G:/Github Projects/job-hunt-dashboard/shots/${name}.png` });
    console.log('shot:', name);
  }

  // Kanban mode close-up
  await page.goto('http://127.0.0.1:3002/applications', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /kanban/i.test(b.textContent || ''));
    if (btn) btn.click();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'G:/Github Projects/job-hunt-dashboard/shots/kanban.png' });
  console.log('shot: kanban');

  await browser.close();
  console.log('done');
})();
