import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', {waitUntil: 'networkidle0'});
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enterBtn = btns.find(b => b.textContent.includes('[ ENTER ]'));
    if (enterBtn) enterBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  
  await browser.close();
  process.exit(0);
})();
