import puppeteer from 'puppeteer';

const CARD_SELECTOR = 'body > div > div > aside > div.flex-1.overflow-y-auto.scrollbar-thin.scrollbar-thumb-gray-700.scrollbar-track-transparent > div > div > button';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600 });
await page.emulateTimezone('UTC');
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector(CARD_SELECTOR, { timeout: 60000 });
const info = await page.evaluate((selector) => {
  const card = document.querySelector(selector);
  if (!card) return null;
  const text = card.querySelector('span.text-[11px] + div span')?.textContent?.trim();
  const content = card.textContent;
  return { kickoffText: text, contentSnippet: content.slice(0, 80) };
}, CARD_SELECTOR);
console.log(info);
await browser.close();
