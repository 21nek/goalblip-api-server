import puppeteer from 'puppeteer';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Settings');
  btn?.click();
});
await delay(1500);
const html = await page.evaluate(() => {
  const heading = Array.from(document.querySelectorAll('h2, h3, h4')).find((node) => node.textContent?.trim() === 'LANGUAGE SELECTION');
  const container = heading?.closest('section') || heading?.parentElement;
  return container?.innerHTML || null;
});
console.log(html);
await browser.close();
