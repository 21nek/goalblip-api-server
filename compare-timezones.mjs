import puppeteer from 'puppeteer';

const CARD_SELECTOR = 'body > div > div > aside > div.flex-1.overflow-y-auto.scrollbar-thin.scrollbar-thumb-gray-700.scrollbar-track-transparent > div > div > button';

async function scrape(timezone) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1600 });
  if (timezone) {
    await page.emulateTimezone(timezone);
  }
  await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector(CARD_SELECTOR, { timeout: 60000 });
  const content = await page.evaluate((selector) => {
    const card = document.querySelector(selector);
    if (!card) return null;
    const spans = Array.from(card.querySelectorAll('span')).map((el) => el.textContent?.trim());
    return { spans, text: card.innerText };
  }, CARD_SELECTOR);
  await browser.close();
  return content;
}

const baseline = await scrape();
const london = await scrape('Europe/London');
const mexico = await scrape('America/Mexico_City');
console.log('Default', baseline?.spans?.slice(0, 4));
console.log('London', london?.spans?.slice(0, 4));
console.log('Mexico City', mexico?.spans?.slice(0, 4));
