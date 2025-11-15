import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('aside button', { timeout: 60000 });
const info = await page.evaluate(() => {
  const button = document.querySelector('aside button');
  if (!button) return null;
  const attrs = Object.fromEntries(Object.entries(button.dataset || {}));
  const timeAttr = button.querySelector('time');
  const scriptData = document.querySelector('script[type="application/ld+json"]');
  const local = {};
  Object.keys(localStorage).forEach((key) => {
    local[key] = localStorage.getItem(key);
  });
  return {
    dataset: attrs,
    timeHtml: timeAttr?.outerHTML || null,
    localStorage: local,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
