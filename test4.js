import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  await page.goto('http://localhost:5173/', {waitUntil: 'networkidle0'});
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.textContent.includes('[ ENTER ]'));
    if (enterBtn) enterBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  process.exit(0);
})();
