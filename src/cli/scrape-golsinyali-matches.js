#!/usr/bin/env node
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';

function parseArgs(argv) {
  let locale;
  let pretty = false;
  let headless = 'new';
  let timeout = 45_000;
  let scrollDelay = 120;
  let maxScrolls = 400;
  let view = 'today';

  for (const arg of argv) {
    if (arg === '--pretty' || arg === '-p') {
      pretty = true;
      continue;
    }

    if (arg === '--headful' || arg === '--no-headless') {
      headless = false;
      continue;
    }

    if (arg.startsWith('--headless=')) {
      const value = arg.split('=')[1];
      headless = value === 'false' ? false : value;
      continue;
    }

    if (arg.startsWith('--locale=')) {
      locale = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--timeout=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isNaN(value) && value > 0) {
        timeout = value;
      }
      continue;
    }

    if (arg.startsWith('--scroll-delay=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isNaN(value) && value > 0) {
        scrollDelay = value;
      }
      continue;
    }

    if (arg.startsWith('--max-scrolls=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isNaN(value) && value > 0) {
        maxScrolls = value;
      }
      continue;
    }

    if (arg.startsWith('--view=')) {
      view = arg.split('=')[1];
      continue;
    }

    if (!arg.startsWith('-') && !locale) {
      locale = arg;
    }
  }

  return {
    locale: locale || 'tr',
    pretty,
    headless,
    timeout,
    scrollDelay,
    maxScrolls,
    view,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const result = await scrapeMatchList({
    locale: args.locale,
    headless: args.headless,
    navigationTimeoutMs: args.timeout,
    scrollDelayMs: args.scrollDelay,
    maxScrolls: args.maxScrolls,
    view: args.view,
  });

  const spacing = args.pretty ? 2 : 0;
  process.stdout.write(`${JSON.stringify(result, null, spacing)}\n`);
}

main().catch((error) => {
  console.error('Failed to scrape Gol Sinyali matches:', error.message || error);
  process.exit(1);
});
