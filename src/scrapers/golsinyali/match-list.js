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
const ALLOWED_HOST = new URL(BASE_URL).hostname;
const TRACKING_HOST_PATTERNS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'doubleclick.net',
  'facebook.com',
  'fbcdn.net',
  'hotjar.com',
  'segment.io',
  'mixpanel.com',
  'amplitude.com',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupRequestInterception(page, logger = console) {
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const type = request.resourceType();
    const url = request.url();
    try {
      const hostname = new URL(url).hostname;
      const isAllowedHost = hostname === ALLOWED_HOST || hostname.endsWith('.golsinyali.com');

      // Always drop known tracking hosts
      if (TRACKING_HOST_PATTERNS.some((pat) => hostname.includes(pat))) {
        return request.abort();
      }

      // Allow images from the target host (team logos); block other images/media/fonts/etc.
      if (['image', 'font', 'media'].includes(type)) {
        return isAllowedHost ? request.continue() : request.abort();
      }

      // Stylesheets are optional; keep only first-party to reduce footprint
      if (type === 'stylesheet') {
        return isAllowedHost ? request.continue() : request.abort();
      }

      // Block beacons/prefetch/preflight
      if (['other', 'beacon', 'prefetch', 'preflight'].includes(type)) {
        return request.abort();
      }

      if (type === 'script' || type === 'xhr' || type === 'fetch' || type === 'document') {
        if (hostname !== ALLOWED_HOST && !hostname.endsWith('.golsinyali.com')) {
          return request.abort();
        }
      }
      return request.continue();
    } catch (err) {
      logger?.warn?.('[scrape] request interception error, continuing', err?.message ?? err);
      return request.continue();
    }
  });
}

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
  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.setUserAgent(userAgent);
    page.setDefaultNavigationTimeout?.(navigationTimeoutMs);
    page.setDefaultTimeout?.(navigationTimeoutMs);
    await setupRequestInterception(page, logger);

    await page.evaluateOnNewDocument(() => {
      // Stub common analytics globals to no-op
      const noopFn = () => {};
      const noopObj = new Proxy(
        {},
        {
          get: () => noopFn,
          set: () => true,
        },
      );
      // @ts-ignore
      window.dataLayer = [];
      // @ts-ignore
      window.gtag = noopFn;
      // @ts-ignore
      window.ga = noopFn;
      // @ts-ignore
      window.fbq = noopFn;
      // @ts-ignore
      window._gaq = [];
      // Block sendBeacon
      // @ts-ignore
      navigator.sendBeacon = noopFn;
      // Patch fetch/xhr to drop analytics hosts
      const blockedHosts = [
        'google-analytics.com',
        'googletagmanager.com',
        'doubleclick.net',
        'facebook.com',
        'fbcdn.net',
        'hotjar.com',
        'segment.io',
        'mixpanel.com',
        'amplitude.com',
      ];
      const shouldBlock = (url) => {
        try {
          const h = new URL(url).hostname;
          return blockedHosts.some((p) => h.includes(p));
        } catch {
          return false;
        }
      };
      const origFetch = window.fetch;
      // @ts-ignore
      window.fetch = (...args) => {
        if (args[0] && shouldBlock(args[0])) return Promise.resolve(new Response(null, { status: 204 }));
        return origFetch(...args);
      };
      const origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (...args) {
        if (args[1] && shouldBlock(args[1])) {
          // short-circuit send
          this.send = () => {};
        }
        return origOpen.apply(this, args);
      };
    });

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

    const filteredMatches = matches.filter((match) => {
      if (!match.kickoffIsoUtc) return true;
      return match.kickoffIsoUtc.slice(0, 10) === dataDate;
    });

    return {
      view,
      dataDate,
      locale: normalizedLocale,
      url: targetUrl,
      scrapedAt: new Date().toISOString(),
      totalMatches: filteredMatches.length,
      matches: filteredMatches,
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
  return formatDate(offsetDays, TIME_ZONE);
}

function formatDate(offsetDays, timeZone) {
  const now = new Date();

  // Get the current date in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;

  // Create a date object at noon in the target timezone to avoid DST issues
  let targetDate = new Date(`${year}-${month}-${day}T12:00:00`);

  // Add offset days
  if (offsetDays !== 0) {
    targetDate.setDate(targetDate.getDate() + offsetDays);
  }

  // Format as YYYY-MM-DD
  const resultYear = targetDate.getFullYear();
  const resultMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
  const resultDay = String(targetDate.getDate()).padStart(2, '0');

  return `${resultYear}-${resultMonth}-${resultDay}`;
}
