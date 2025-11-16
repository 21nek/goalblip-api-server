import puppeteer from 'puppeteer';
import {
  BASE_URL,
  DEFAULT_NAVIGATION_TIMEOUT,
  DEFAULT_USER_AGENT,
  DEFAULT_VIEWPORT,
  MATCH_LIST_PATH,
} from './constants.js';
import { localeToPathSegment, normalizeLocale } from '../../config/locales.js';
import { ensureView, isValidView } from './i18n/views.js';
import { toUtcFromLocal } from '../../utils/datetime.js';

const SELECTORS = {
  scroller:
    'body > div > div > aside > div.flex-1.overflow-y-auto.scrollbar-thin.scrollbar-thumb-gray-700.scrollbar-track-transparent',
  list:
    'body > div > div > aside > div.flex-1.overflow-y-auto.scrollbar-thin.scrollbar-thumb-gray-700.scrollbar-track-transparent > div',
};
SELECTORS.card = `${SELECTORS.list} > div > button`;

const DEFAULT_SCROLL_DELAY_MS = 120;
const MAX_SCROLL_ATTEMPTS = 400;
const TIME_ZONE = 'Europe/Istanbul';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scrapeMatchList(options = {}) {
  const {
    locale = 'tr',
    headless = 'new',
    navigationTimeoutMs = DEFAULT_NAVIGATION_TIMEOUT,
    scrollDelayMs = DEFAULT_SCROLL_DELAY_MS,
    maxScrolls = MAX_SCROLL_ATTEMPTS,
    logger = console,
    userAgent = DEFAULT_USER_AGENT,
    view = 'today',
  } = options;

  if (!isValidView(view)) {
    throw new Error(`Geçersiz 'view' parametresi: ${view}. Desteklenen değerler: today, tomorrow`);
  }

  const normalizedLocale = normalizeLocale(locale);
  const targetUrl = buildMatchListUrl(normalizedLocale);
  const browser = await puppeteer.launch({ headless });

  try {
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.setUserAgent(userAgent);
    page.setDefaultNavigationTimeout?.(navigationTimeoutMs);
    page.setDefaultTimeout?.(navigationTimeoutMs);

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: navigationTimeoutMs });
    await page.waitForSelector(SELECTORS.card, { timeout: navigationTimeoutMs });
    await ensureView(page, view, normalizedLocale);

    const dataDate = computeDataDate(view);
    const matches = await harvestMatches(page, {
      scrollDelayMs,
      maxScrolls,
      logger,
      dataDate,
    });

    return {
      view,
      dataDate,
      locale: normalizedLocale,
      url: targetUrl,
      scrapedAt: new Date().toISOString(),
      totalMatches: matches.length,
      matches,
    };
  } finally {
    await browser.close();
  }
}

async function harvestMatches(page, { scrollDelayMs, maxScrolls, logger, dataDate }) {
  const seen = new Map();
  let scrollAttempts = 0;
  let stagnantIterations = 0;
  let previousCount = 0;

  while (scrollAttempts < maxScrolls) {
    const { matches: visibleMatches, isAtBottom } = await collectVisibleMatches(page);

    visibleMatches.forEach((match, index) => {
      const key = match.matchId ?? fallbackKey(match, index);
      const normalized = normalizeMatch(match, { dataDate });

      if (seen.has(key)) {
        const existing = seen.get(key);
        existing.orderHint = Math.min(existing.orderHint, normalized.orderHint);
        return;
      }

      seen.set(key, normalized);
    });

    if (seen.size === previousCount) {
      stagnantIterations += 1;
    } else {
      stagnantIterations = 0;
      previousCount = seen.size;
    }

    if (isAtBottom) {
      scrollAttempts += 1;
      if (stagnantIterations >= 2) {
        break;
      }
      await sleep(scrollDelayMs);
      continue;
    }

    const scrolled = await scrollList(page);
    scrollAttempts += 1;

    if (!scrolled) {
      break;
    }

    await sleep(scrollDelayMs);
  }

  if (scrollAttempts >= maxScrolls) {
    logger?.warn?.(
      `Reached the scroll limit (${maxScrolls}). Returned ${seen.size} matches that were visible before the guard kicked in.`,
    );
  }

  return Array.from(seen.values())
    .sort((a, b) => a.orderHint - b.orderHint)
    .map((match, index) => {
      const { orderHint, ...rest } = match;
      return { order: index + 1, ...rest };
    });
}

async function collectVisibleMatches(page) {
  return page.evaluate((selectors) => {
    const cards = Array.from(document.querySelectorAll(selectors.card));

    const matches = cards.map((button, idx) => {
      const metaRow = button.firstElementChild;
      const leagueSpan = metaRow?.querySelector('span');
      const league = leagueSpan ? (leagueSpan.textContent || '').trim() : null;
      const infoContainer = metaRow?.querySelector('div');
      const infoTexts = infoContainer
        ? Array.from(infoContainer.querySelectorAll('span'))
            .map((node) => (node.textContent || '').trim())
            .filter(Boolean)
        : [];
      const kickoffTime = infoTexts[0] ?? null;
      const statusLabel = infoTexts.slice(1).join(' • ') || null;

      const teamsRoot = button.querySelector('[class*="space-y-1.5"]');
      const rows = teamsRoot ? Array.from(teamsRoot.children) : [];
      const formatRow = (row) => {
        if (!row) {
          return { sideCode: null, name: null };
        }
        const spans = Array.from(row.querySelectorAll('span'));
        const sideCode = spans.length ? (spans[0].textContent || '').trim() : null;
        const name = spans.length ? (spans[spans.length - 1].textContent || '').trim() : null;
        return { sideCode, name };
      };

      const home = formatRow(rows[0]);
      const away = formatRow(rows[1]);

      const wrapper = button.parentElement;
      const translate = wrapper?.style?.transform || '';
      const matchOffset = /translateY\((-?\d+(?:\.\d+)?)px\)/.exec(translate);
      const orderHint = matchOffset ? Number(matchOffset[1]) : idx * 1e3;

      return {
        matchId: button.dataset.matchId || null,
        league,
        kickoffTime,
        statusLabel,
        homeTeam: home.name,
        homeSideCode: home.sideCode,
        awayTeam: away.name,
        awaySideCode: away.sideCode,
        orderHint,
      };
    });

    const scroller = document.querySelector(selectors.scroller);
    const isAtBottom = scroller
      ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
      : true;

    return { matches, isAtBottom };
  }, SELECTORS);
}

async function scrollList(page) {
  return page.evaluate((selector) => {
    const scroller = document.querySelector(selector);
    if (!scroller) {
      return false;
    }

    const before = scroller.scrollTop;
    scroller.scrollBy({ top: scroller.clientHeight * 0.9, behavior: 'instant' });
    return scroller.scrollTop !== before;
  }, SELECTORS.scroller);
}

function normalizeMatch(match, { dataDate }) {
  const kickoffTime = textContentValue(match.kickoffTime);
  const kickoffIsoUtc =
    dataDate && kickoffTime ? toUtcFromLocal(dataDate, kickoffTime, TIME_ZONE) : null;

  return {
    matchId: match.matchId ? Number(match.matchId) : null,
    league: textContentValue(match.league),
    kickoffTime,
    kickoffIsoUtc,
    kickoffTimezone: TIME_ZONE,
    statusLabel: textContentValue(match.statusLabel),
    homeTeam: textContentValue(match.homeTeam),
    homeSideCode: textContentValue(match.homeSideCode),
    awayTeam: textContentValue(match.awayTeam),
    awaySideCode: textContentValue(match.awaySideCode),
    orderHint: Number.isFinite(match.orderHint) ? match.orderHint : Number.MAX_SAFE_INTEGER,
  };
}

function textContentValue(value) {
  if (typeof value !== 'string') {
    return value ?? null;
  }
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length ? cleaned : null;
}

function fallbackKey(match, index) {
  const ordinal = Number.isFinite(match.orderHint) ? match.orderHint : index;
  return [match.league, match.kickoffTime, match.homeTeam, match.awayTeam, ordinal]
    .filter((value) => value !== undefined && value !== null && `${value}`.length > 0)
    .join('::');
}

function buildMatchListUrl(locale) {
  const safeSegment = localeToPathSegment(locale).replace(/^\/+|\/+$|\s+/g, '');
  const finalSegment = safeSegment || 'tr';
  return `${BASE_URL}/${finalSegment}/${MATCH_LIST_PATH}`;
}

function computeDataDate(view) {
  const offsetDays = view === 'tomorrow' ? 1 : 0;
  const target = addDays(new Date(), offsetDays);
  return formatDate(target, TIME_ZONE);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function formatDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return parts;
}
