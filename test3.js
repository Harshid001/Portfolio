import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  await page.goto('http://localhost:5173/', {waitUntil: 'networkidle0'});
  
  // Wait for ENTER button and click it
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes('[ ENTER ]'));
  });
  const btns = await page.('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('[ ENTER ]')) {
      await btn.click();
      break;
    }
  }

  // Wait 2 seconds for app to render
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  process.exit(0);
})();
