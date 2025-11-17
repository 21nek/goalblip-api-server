import express from 'express';
import cors from 'cors';
import os from 'os';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { findTimezoneById } from '../config/timezones.js';
import { formatUtcForTimezone } from '../utils/datetime.js';
import { normalizeLocale } from '../config/locales.js';
import { isValidView } from '../scrapers/golsinyali/i18n/views.js';
import {
  loadMatchDetail,
  loadMatchListByDate,
  loadMatchListByView,
  saveMatchList,
} from '../services/match-storage.js';
import { enqueueMatchDetailScrape } from '../services/scrape-queue.js';
import { ensureDataDirectories, getDataDirectories } from '../utils/data-store.js';
import {
  DETAIL_CACHE_TTL_MS,
  LIST_CACHE_TTL_MS,
  isStale,
  expiresAt,
} from '../config/cache.js';
import { requestListRefresh, startRefreshScheduler } from '../services/refresh-scheduler.js';
import {
  canTriggerReanalysis,
  getReanalysisLimitInfo,
  registerReanalysisRequest,
  getReanalysisIntervalMs,
} from '../services/reanalysis-rate-limiter.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) || '*',
  }),
);

app.use((req, _res, next) => {
  const locale =
    req.query.locale ||
    (typeof req.body?.locale === 'string' ? req.body.locale : undefined) ||
    'tr';
  const view =
    req.query.view ||
    (typeof req.body?.view === 'string' ? req.body.view : undefined) ||
    undefined;
  const timezone = req.query.timezone || req.body?.timezone;
  console.info('[api]', req.method, req.path, {
    locale,
    view,
    timezone,
  });
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/matches', async (req, res, next) => {
  try {
    const { date, view = 'today', refresh, locale = 'tr' } = req.query;
    const normalizedLocale = normalizeLocale(typeof locale === 'string' ? locale : 'tr');
    if (!isValidView(view)) {
      res.status(400).json({ error: `GeÃ§ersiz view parametresi: ${view}` });
      return;
    }
    const timezoneParam =
      typeof req.query.timezone === 'string' && req.query.timezone.trim()
        ? req.query.timezone.trim()
        : null;
    const tzPreset = findTimezoneById(timezoneParam);
    const targetTimezone = tzPreset.tz;
    let payload = null;

    if (refresh === 'true') {
      const scrape = await scrapeMatchList({ locale: normalizedLocale, view });
      await saveMatchList(scrape);
      payload = scrape;
    } else if (date) {
      payload = await loadMatchListByDate(date, { locale: normalizedLocale });
    } else {
      payload = await loadMatchListByView(view, { locale: normalizedLocale });
    }

    if (!payload && !date) {
      const fresh = await scrapeMatchList({ locale: normalizedLocale, view });
      await saveMatchList(fresh);
      payload = fresh;
    }

    if (!payload) {
      res.status(404).json({ error: 'MaÃ§ listesi bulunamadÄ±.' });
      return;
    }

    const listIsStale = isStale(payload.scrapedAt, LIST_CACHE_TTL_MS);
    if (listIsStale) {
      requestListRefresh(normalizedLocale, view).catch((error) => {
        console.error('[api] failed to schedule list refresh', error);
      });
    }

    const matches = Array.isArray(payload.matches)
      ? payload.matches.map((match) => {
          const kickoffDisplay =
            match.kickoffIsoUtc && targetTimezone
              ? formatUtcForTimezone(match.kickoffIsoUtc, targetTimezone)
              : match.kickoffTime ?? null;
          return {
            ...match,
            kickoffTimeDisplay: kickoffDisplay,
          };
        })
      : [];

    res.json({
      ...payload,
      locale: payload.locale || normalizedLocale,
      timezone: targetTimezone,
      timezoneId: tzPreset.id,
      cache: buildCacheMeta(payload.scrapedAt, LIST_CACHE_TTL_MS, listIsStale),
      matches,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/matches/scrape', async (req, res, next) => {
  try {
    const { view = 'today', locale = 'tr', headless = 'new' } = req.body || {};
    const normalizedLocale = normalizeLocale(locale);
    if (!isValidView(view)) {
      res.status(400).json({ error: `GeÃ§ersiz view parametresi: ${view}` });
      return;
    }
    const list = await scrapeMatchList({ view, locale: normalizedLocale, headless });
    await saveMatchList(list);
    res.status(201).json({
      message: 'MaÃ§ listesi gÃ¼ncellendi.',
      view: list.view,
      dataDate: list.dataDate,
      locale: list.locale,
      total: list.totalMatches,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/matches/:date', async (req, res, next) => {
  try {
    const locale = normalizeLocale(
      typeof req.query.locale === 'string' ? req.query.locale : 'tr',
    );
    const timezoneParam =
      typeof req.query.timezone === 'string' && req.query.timezone.trim()
        ? req.query.timezone.trim()
        : null;
    const tzPreset = findTimezoneById(timezoneParam);
    const targetTimezone = tzPreset.tz;

    const payload = await loadMatchListByDate(req.params.date, { locale });
    if (!payload) {
      res.status(404).json({ error: 'Belirtilen tarihe ait veri bulunamadı.' });
      return;
    }

    const listIsStale = isStale(payload.scrapedAt, LIST_CACHE_TTL_MS);
    if (listIsStale) {
      const fallbackView = payload?.view && isValidView(payload.view) ? payload.view : undefined;
      if (fallbackView) {
        requestListRefresh(locale, fallbackView).catch((error) => {
          console.error('[api] failed to schedule dated list refresh', error);
        });
      }
    }

    const matches = Array.isArray(payload.matches)
      ? payload.matches.map((match) => {
          const kickoffDisplay =
            match.kickoffIsoUtc && targetTimezone
              ? formatUtcForTimezone(match.kickoffIsoUtc, targetTimezone)
              : match.kickoffTime ?? null;
          return {
            ...match,
            kickoffTimeDisplay: kickoffDisplay,
          };
        })
      : [];

    res.json({
      ...payload,
      locale: payload.locale || locale,
      timezone: targetTimezone,
      timezoneId: tzPreset.id,
      cache: buildCacheMeta(payload.scrapedAt, LIST_CACHE_TTL_MS, listIsStale),
      matches,
    });
  } catch (error) {
    next(error);
  }
});
app.get('/api/match/:matchId', async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const locale = normalizeLocale(req.query.locale || 'tr');
    const timezoneParam =
      typeof req.query.timezone === 'string' && req.query.timezone.trim()
        ? req.query.timezone.trim()
        : null;
    const tzPreset = findTimezoneById(timezoneParam);
    const targetTimezone = tzPreset.tz;
    const requestedDate = typeof req.query.date === 'string' ? req.query.date : undefined;
    const preferredView = typeof req.query.view === 'string' ? req.query.view : undefined;
    const detail = await loadMatchDetail(matchId, {
      dataDate: requestedDate,
      view: preferredView,
      locale,
    });

    if (detail) {
      const enriched = { ...detail };
      if (enriched.scoreboard && enriched.scoreboard.kickoffIsoUtc && targetTimezone) {
        const displayTime = formatUtcForTimezone(
          enriched.scoreboard.kickoffIsoUtc,
          targetTimezone,
        );
        enriched.scoreboard = {
          ...enriched.scoreboard,
          kickoffTimeDisplay: displayTime,
          kickoffTimezone: tzPreset?.label || tzPreset?.id || targetTimezone,
          kickoffTimezoneId: tzPreset?.id ?? null,
        };
      }

      const detailIsStale = isStale(enriched.scrapedAt, DETAIL_CACHE_TTL_MS);
      if (detailIsStale) {
        enqueueMatchDetailScrape({
          matchId,
          locale,
          homeTeamName: enriched.scoreboard?.homeTeam?.name ?? metadataFallback(enriched, 'home'),
          awayTeamName: enriched.scoreboard?.awayTeam?.name ?? metadataFallback(enriched, 'away'),
          dataDate: enriched.dataDate || requestedDate || currentIsoDate(),
          view: enriched.viewContext || preferredView || 'manual',
          viewContext: enriched.viewContext || preferredView || 'manual',
          sourceListScrapedAt: enriched.sourceListScrapedAt ?? enriched.scrapedAt ?? null,
        });
      }

      res.json({
        ...enriched,
        timezone: targetTimezone,
        timezoneId: tzPreset.id,
        locale: enriched.locale || locale,
        cache: buildCacheMeta(enriched.scrapedAt, DETAIL_CACHE_TTL_MS, detailIsStale),
      });
      return;
    }

    const metadata = await findMatchMetadata(Number(matchId));
    const resolvedDate = requestedDate ?? metadata?.dataDate ?? currentIsoDate();
    const viewContext = preferredView ?? metadata?.view ?? 'manual';

    const { queuePosition, alreadyQueued, status: queueStatus } = enqueueMatchDetailScrape({
      matchId,
      locale,
      homeTeamName: metadata?.homeTeam,
      awayTeamName: metadata?.awayTeam,
      dataDate: resolvedDate,
      view: viewContext,
      viewContext,
      sourceListScrapedAt: metadata?.listScrapedAt,
    });

    const queueState = queueStatus === 'active' ? 'processing' : 'pending';
    const message = alreadyQueued
      ? 'Maï¿½ï¿½ detayï¿½ï¿½ halihazï¿½ï¿½rda analiz kuyruï¿½unda.'
      : 'Maï¿½ï¿½ detayï¿½ï¿½ analiz edilmek ï¿½ï¿½zere kuyruï¿½a eklendi.';

    res.status(202).json({
      status: queueState,
      message,
      matchId,
      queuePosition,
      alreadyQueued,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/match/:matchId/scrape', async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const {
      locale = 'tr',
      slug,
      headless = 'new',
      homeTeamName,
      awayTeamName,
      dataDate,
      view,
    } = req.body || {};

    const resolvedDate = dataDate || currentIsoDate();
    const viewContext = view || 'manual';

    const { queuePosition, alreadyQueued, status: queueStatus } = enqueueMatchDetailScrape({
      matchId,
      locale,
      slug,
      headless,
      homeTeamName,
      awayTeamName,
      dataDate: resolvedDate,
      view: viewContext,
      viewContext,
    });
    const queueState = queueStatus === 'active' ? 'processing' : 'pending';
    const message = alreadyQueued
      ? 'Maï¿½ï¿½ detayï¿½ï¿½ zaten analiz kuyruï¿½unda.'
      : 'Maï¿½ï¿½ detayï¿½ï¿½ analiz kuyruï¿½una alï¿½ndï¿½.';
    res.status(202).json({
      status: queueState,
      message,
      matchId,
      queuePosition,
      alreadyQueued,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/match/:matchId/reanalyze', async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const locale = normalizeLocale(req.body?.locale || req.query.locale || 'tr');
    const requestedDate =
      typeof req.body?.date === 'string'
        ? req.body.date
        : typeof req.query.date === 'string'
          ? req.query.date
          : undefined;
    const preferredView =
      typeof req.body?.view === 'string'
        ? req.body.view
        : typeof req.query.view === 'string'
          ? req.query.view
          : undefined;

    const detail = await loadMatchDetail(matchId, {
      dataDate: requestedDate,
      view: preferredView,
      locale,
    });

    const metadata = detail ? null : await findMatchMetadata(Number(matchId));
    if (!detail && !metadata) {
      res.status(404).json({ error: 'Maç kaydı bulunamadı.' });
      return;
    }

    const limiterState = canTriggerReanalysis(matchId);
    if (!limiterState.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil(limiterState.remainingMs / 1000));
      res
        .status(429)
        .set('Retry-After', String(retryAfterSeconds))
        .json({
          error: 'Yeniden analiz talepleri aynı maç için 15 dakikada bir kabul edilebilir.',
          nextAllowedAt: new Date(limiterState.nextAllowedAt).toISOString(),
          retryAfterSeconds,
        });
      return;
    }

    const resolvedDate =
      detail?.dataDate ?? requestedDate ?? metadata?.dataDate ?? currentIsoDate();
    const viewContext = detail?.viewContext ?? preferredView ?? metadata?.view ?? 'manual';

    const { queuePosition, alreadyQueued, status: queueStatus } = enqueueMatchDetailScrape({
      matchId,
      locale,
      homeTeamName:
        detail?.scoreboard?.homeTeam?.name ??
        metadata?.homeTeam ??
        metadataFallback(detail, 'home'),
      awayTeamName:
        detail?.scoreboard?.awayTeam?.name ??
        metadata?.awayTeam ??
        metadataFallback(detail, 'away'),
      dataDate: resolvedDate,
      view: viewContext,
      viewContext,
      sourceListScrapedAt: detail?.sourceListScrapedAt ?? metadata?.listScrapedAt ?? null,
    });

    registerReanalysisRequest(matchId);
    const nextAllowedInfo = getReanalysisLimitInfo(matchId);
    const queueState = queueStatus === 'active' ? 'processing' : 'pending';

    res.status(202).json({
      status: queueState,
      message: alreadyQueued
        ? 'Maç zaten analiz kuyruğunda.'
        : 'Yeniden analiz için kuyruk talebi oluşturuldu.',
      matchId,
      queuePosition,
      alreadyQueued,
      nextAllowedAt: new Date(nextAllowedInfo.nextAllowedAt).toISOString(),
      intervalMs: getReanalysisIntervalMs(),
    });
  } catch (error) {
    next(error);
  }
});

async function findMatchMetadata(matchId) {
  const views = ['today', 'tomorrow'];
  for (const view of views) {
    // VarsayÄ±lan olarak TR listesi Ã¼zerinden metadata bakÄ±yoruz.
    const list = await loadMatchListByView(view, { locale: 'tr' });
    const match =
      list?.matches?.find(
        (item) => Number(item.matchId) === Number(matchId) || String(item.matchId) === String(matchId),
      ) ?? null;
    if (match) {
      return {
        ...match,
        dataDate: list?.dataDate,
        view,
        listScrapedAt: list?.scrapedAt,
      };
    }
  }
  return null;
}

function currentIsoDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function buildCacheMeta(scrapedAt, ttlMs, stale) {
  return {
    scrapedAt: scrapedAt ?? null,
    ttlMs,
    expiresAt: expiresAt(scrapedAt, ttlMs),
    stale,
  };
}

function metadataFallback(detail, side) {
  if (!detail) {
    return null;
  }
  const scoreboardTeam = detail.scoreboard?.[side === 'home' ? 'homeTeam' : 'awayTeam'];
  if (scoreboardTeam?.name) {
    return scoreboardTeam.name;
  }
  const key = side === 'home' ? 'homeTeam' : 'awayTeam';
  return detail[key] ?? null;
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Beklenmeyen sunucu hatasÄ±.',
  });
});

ensureDataDirectories().then(() => {
  startRefreshScheduler();
  const server = app.listen(PORT, HOST, () => {
    const hostDisplay = HOST === '0.0.0.0' || HOST === '::' ? 'localhost' : HOST;
    const baseUrl = `http://${hostDisplay}:${PORT}`;
    const networkInterfaces = os.networkInterfaces();
    const localIps = Object.values(networkInterfaces)
      .flatMap((entries) => entries || [])
      .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
      .map((entry) => entry.address);

    const dirs = getDataDirectories();

    console.log(`âš½ï¸  GoalBlip API ${baseUrl}`);
    console.log('ğŸ“¡  Sunucu Bilgisi');
    console.log(`   Host     : ${HOST}`);
    console.log(`   Port     : ${PORT}`);
    console.log(`   Data dir : ${dirs.DATA_ROOT}`);
    console.log(`   Lists    : ${dirs.LISTS_DIR}`);
    console.log(`   Matches  : ${dirs.MATCHES_DIR}`);
    if (localIps.length) {
      console.log('ğŸŒ  Yerel IP adresleri:');
      localIps.forEach((ip) => {
        console.log(`   http://${ip}:${PORT}`);
      });
    } else {
      console.log('ğŸŒ  Yerel IP adresi tespit edilemedi.');
    }
    console.log('ğŸ›£ï¸  Ã–rnek istekler:');
    console.log(`   curl ${baseUrl}/api/health`);
    console.log(`   curl ${baseUrl}/api/matches?view=today`);
    console.log(
      `   curl -X POST ${baseUrl}/api/matches/scrape -H 'Content-Type: application/json' -d '{"view":"today"}'`,
    );
    console.log(`   curl ${baseUrl}/api/match/<id>`);
  });

  server.on('close', () => {
    console.log('ğŸ›‘ HTTP server closed');
  });
});
