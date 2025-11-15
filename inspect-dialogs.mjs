import puppeteer from 'puppeteer';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600 });
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const idx = btns.findIndex((b) => b.textContent?.trim() === 'Settings');
  if (idx >= 0) {
    btns[idx].click();
  }
});
await delay(2000);
const modalInfo = await page.evaluate(() => {
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [data-state]'))
    .map((node) => ({ tag: node.tagName, role: node.getAttribute('role'), state: node.getAttribute('data-state'), text: node.textContent?.slice(0, 200) }));
  return { dialogs, bodyClass: document.body.className };
});
console.log(JSON.stringify(modalInfo, null, 2));
await browser.close();
