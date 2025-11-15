import puppeteer from 'puppeteer';

const CARD_SELECTOR = 'body > div > div > aside > div.flex-1.overflow-y-auto.scrollbar-thin.scrollbar-thumb-gray-700.scrollbar-track-transparent > div > div > button';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector(CARD_SELECTOR, { timeout: 60000 });
const info = await page.evaluate((cardSelector) => {
  const card = document.querySelector(cardSelector);
  if (!card) return null;
  const attrs = Object.fromEntries(Object.entries(card.dataset || {}));
  const league = card.querySelector('h4')?.textContent?.trim() || null;
  const matchHtml = card.outerHTML;
  const kickoff = card.querySelector('time')?.getAttribute('datetime') || null;
  const kickoffText = card.querySelector('time')?.textContent?.trim() || null;
  const content = card.innerText;
  const tz = document.cookie;
  const local = {};
  Object.keys(localStorage).forEach((key) => {
    local[key] = localStorage.getItem(key);
  });
  return { attrs, kickoff, kickoffText, content, matchHtml: matchHtml.slice(0, 500), timezoneCookie: tz, localStorage: local };
}, CARD_SELECTOR);
console.log(JSON.stringify(info, null, 2));
await browser.close();
