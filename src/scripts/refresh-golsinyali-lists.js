import { SUPPORTED_LOCALES } from '../config/locales.js';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { saveMatchList } from '../services/match-storage.js';

const DELAY_MS = Number(process.env.REFRESH_DELAY_MS) || 1500;
const TARGET_VIEWS = ['today', 'tomorrow'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function refreshAllLocales() {
  for (const locale of SUPPORTED_LOCALES) {
    for (const view of TARGET_VIEWS) {
      console.log(`[refresh] scraping ${view} list for ${locale}...`);
      try {
        const list = await scrapeMatchList({ locale, view });
        await saveMatchList(list);
        console.log(
          `[refresh] saved ${locale}/${view} (${list.totalMatches} matches, date ${list.dataDate})`,
        );
      } catch (error) {
        console.error(`[refresh] failed for ${locale}/${view}:`, error.message || error);
      }
      if (DELAY_MS > 0) {
        await sleep(DELAY_MS);
      }
    }
  }

  console.log('[refresh] completed multi-locale scrape');
}

refreshAllLocales()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[refresh] unexpected error:', err);
    process.exit(1);
  });
