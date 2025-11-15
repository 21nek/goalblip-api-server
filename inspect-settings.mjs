import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('https://www.golsinyali.com/en/match', { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForSelector('button', { timeout: 60000 });
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Settings');
  btn?.click();
});
await page.waitForSelector('div[role="dialog"],div[role="alertdialog"],div[class*="settings"]', { timeout: 10000 }).catch(() => {});
const modalHtml = await page.evaluate(() => {
  const modal = document.querySelector('div[class*="settings"]') || document.querySelector('div[role="dialog"]');
  return modal ? modal.innerText : null;
});
const optionSnapshot = await page.evaluate(() => {
  const langCards = Array.from(document.querySelectorAll('[data-settings="language"] button, [data-language-option] button'));
  const tzButtons = Array.from(document.querySelectorAll('[data-timezone-option] button'));
  const fallbackList = Array.from(document.querySelectorAll('button')).map((btn) => btn.textContent?.trim());
  return {
    langCount: langCards.length,
    tzCount: tzButtons.length,
    fallbackList,
  };
});
console.log({ modalHtml, optionSnapshot });
await browser.close();
