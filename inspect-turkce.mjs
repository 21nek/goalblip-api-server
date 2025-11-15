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
const nodes = await page.evaluate(() => {
  const matches = Array.from(document.querySelectorAll('*')).filter((node) => node.textContent?.includes('Türkçe'));
  return matches.map((node) => ({
    tag: node.tagName,
    text: node.textContent?.trim(),
    classes: node.className,
    dataset: Object.fromEntries(Object.entries(node.dataset || {})),
    outer: node.outerHTML?.slice(0, 400),
  }));
});
console.log(JSON.stringify(nodes, null, 2));
await browser.close();
