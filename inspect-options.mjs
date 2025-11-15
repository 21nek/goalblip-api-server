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
const data = await page.evaluate(() => {
  const findSectionByTitle = (title) => {
    const heading = Array.from(document.querySelectorAll('h2, h3, h4')).find((node) => node.textContent?.trim() === title);
    if (!heading) return null;
    const container = heading.closest('section') || heading.parentElement;
    if (!container) return null;
    const options = Array.from(container.querySelectorAll('button')).map((btn) => ({
      text: btn.textContent?.trim(),
      data: Object.fromEntries(Object.entries(btn.dataset || {})),
      aria: btn.getAttribute('aria-pressed') || btn.getAttribute('aria-checked') || null,
      cls: btn.className,
    }));
    return { title, options };
  };
  return {
    language: findSectionByTitle('LANGUAGE SELECTION'),
    timezone: findSectionByTitle('TIMEZONE'),
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
