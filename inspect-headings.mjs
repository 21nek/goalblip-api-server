import puppeteer from 'puppeteer';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600 });
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
await page.evaluate(() => {
  const xpath = document.evaluate("//button[normalize-space()='Settings']", document, null, XPathResult.ANY_TYPE, null);
  const button = xpath.iterateNext();
  if (button) {
    button.click();
  } else {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Settings');
    btn?.click();
  }
});
await delay(1500);
const headings = await page.evaluate(() => Array.from(document.querySelectorAll('h2, h3, h4')).map((node) => node.textContent?.trim()));
console.log(headings);
await browser.close();
