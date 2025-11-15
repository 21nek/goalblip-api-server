import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600 });
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
const info = await page.evaluate(() => {
  const findButtonHtml = (label) => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
    if (!btn) return null;
    return {
      text: label,
      outer: btn.outerHTML,
      parentHtml: btn.parentElement?.outerHTML?.slice(0, 500) || null,
      ancestors: btn.closest('div')?.className || null,
    };
  };
  return {
    langButton: findButtonHtml('?? Language'),
    tzButton: findButtonHtml('?? Timezone'),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
