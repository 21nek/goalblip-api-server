import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { saveMatchList } from './match-storage.js';
import { enqueueMatchDetailScrape } from './scrape-queue.js';
import { normalizeLocale, SUPPORTED_LOCALES } from '../config/locales.js';

const REFRESH_VIEWS = ['today', 'tomorrow'];
const REFRESH_INTERVAL_MS =
  Number(process.env.LIST_REFRESH_INTERVAL_MS) || 3 * 60 * 60 * 1000; // 3 hours
const PRIORITY_MATCH_REFRESH_LIMIT =
  Number(process.env.PRIORITY_MATCH_REFRESH_LIMIT) || 50;

const inFlightListRefresh = new Map();
let intervalHandle = null;

export function startRefreshScheduler({ logger = console } = {}) {
  if (intervalHandle) {
    return;
  }

  const runRefresh = async () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const view of REFRESH_VIEWS) {
        try {
          await requestListRefresh(locale, view, logger);
        } catch (error) {
          logger?.error?.('[refresh-scheduler] failed to refresh', {
            locale,
            view,
            error,
          });
        }
      }
    }
  };

  runRefresh().catch((error) => {
    logger?.error?.('[refresh-scheduler] initial refresh failed', error);
  });

  intervalHandle = setInterval(() => {
    runRefresh().catch((error) => {
      logger?.error?.('[refresh-scheduler] periodic refresh failed', error);
    });
  }, REFRESH_INTERVAL_MS);
}

export async function requestListRefresh(locale, view, logger = console) {
  const normalizedLocale = normalizeLocale(locale || 'tr');
  const normalizedView = REFRESH_VIEWS.includes(view) ? view : 'today';
  const key = `${normalizedLocale}:${normalizedView}`;

  if (inFlightListRefresh.has(key)) {
    return inFlightListRefresh.get(key);
  }

  const job = (async () => {
    try {
      logger?.info?.('[refresh-scheduler] refreshing', { locale: normalizedLocale, view: normalizedView });
      const list = await scrapeMatchList({ locale: normalizedLocale, view: normalizedView });
      await saveMatchList(list);
      queuePriorityMatchDetails(list, normalizedLocale, normalizedView, logger);
    } catch (error) {
      logger?.error?.('[refresh-scheduler] refresh error', { locale: normalizedLocale, view: normalizedView, error });
    } finally {
      inFlightListRefresh.delete(key);
    }
  })();

  inFlightListRefresh.set(key, job);
  return job;
}

function queuePriorityMatchDetails(list, locale, view, logger) {
  if (!Array.isArray(list?.matches) || !list.matches.length) {
    return;
  }
  const slice = list.matches.slice(0, PRIORITY_MATCH_REFRESH_LIMIT);
  slice.forEach((match) => {
    const matchId = match?.matchId;
    if (!matchId) {
      return;
    }
    enqueueMatchDetailScrape({
      matchId,
      locale,
      homeTeamName: match.homeTeam,
      awayTeamName: match.awayTeam,
      dataDate: list.dataDate,
      view,
      viewContext: view,
      sourceListScrapedAt: list.scrapedAt,
    });
  });
}
