import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/hobbies', {waitUntil: 'networkidle0'});
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  await browser.close();
  process.exit(0);
})();
