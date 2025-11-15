import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600 });
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
const matches = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button'))
    .map((btn) => btn.textContent?.replace(/\s+/g, ' ').trim())
    .filter((text) => text?.toLowerCase().includes('language'));
});
console.log(matches);
await browser.close();
