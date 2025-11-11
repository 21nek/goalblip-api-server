#!/usr/bin/env node
import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';

function parseArgs(argv) {
  let matchId = null;
  let locale = 'tr';
  let slug = null;
  let headless = 'new';
  let timeout = 45_000;
  let homeTeam = null;
  let awayTeam = null;
  let pretty = false;

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

    if (arg.startsWith('--slug=')) {
      slug = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--home=')) {
      homeTeam = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--away=')) {
      awayTeam = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--timeout=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isNaN(value) && value > 0) {
        timeout = value;
      }
      continue;
    }

    if (!arg.startsWith('-') && !matchId) {
      matchId = arg;
    }
  }

  return {
    matchId,
    locale,
    slug,
    headless,
    timeout,
    homeTeam,
    awayTeam,
    pretty,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.matchId) {
    console.error('Kullanım: npm run scrape:detail -- <matchId> [--slug=deportivo-riestra-independiente]');
    process.exit(1);
  }

  const detail = await scrapeMatchDetail({
    matchId: args.matchId,
    slug: args.slug,
    locale: args.locale,
    headless: args.headless,
    navigationTimeoutMs: args.timeout,
    homeTeamName: args.homeTeam,
    awayTeamName: args.awayTeam,
  });

  const spacing = args.pretty ? 2 : 0;
  process.stdout.write(`${JSON.stringify(detail, null, spacing)}\n`);
}

main().catch((error) => {
  console.error('Failed to scrape Gol Sinyali match detail:', error.message || error);
  process.exit(1);
});
