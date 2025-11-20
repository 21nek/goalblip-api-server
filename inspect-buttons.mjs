import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: false }); // Show browser
const page = await browser.newPage();
await page.goto('https://www.golsinyali.com/tr/maclar', { waitUntil: 'networkidle2', timeout: 60000 });

// Wait for page to load
await new Promise(r => setTimeout(r, 3000));

// Look for tabs in the sidebar
const tabInfo = await page.evaluate(() => {
  // Find the sidebar
  const aside = document.querySelector('aside');
  if (!aside) return { error: 'No aside found' };

  // Look for buttons in the sidebar
  const buttons = Array.from(aside.querySelectorAll('button'));

  return {
    totalButtons: buttons.length,
    buttons: buttons.slice(0, 10).map((btn, idx) => ({
      index: idx,
      text: btn.textContent?.replace(/\s+/g, ' ').trim(),
      classes: btn.className,
      dataView: btn.getAttribute('data-view'),
      dataTab: btn.getAttribute('data-tab'),
      innerHTML: btn.innerHTML.substring(0, 150)
    }))
  };
});

console.log(JSON.stringify(tabInfo, null, 2));

// Don't close immediately so we can see the page
await new Promise(r => setTimeout(r, 5000));
await browser.close();
