import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
const buttons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button')).slice(0, 30).map((btn) => ({
    text: btn.textContent?.trim(),
    aria: btn.getAttribute('aria-label'),
    classes: btn.className,
  }));
});
console.log(buttons);
await browser.close();
