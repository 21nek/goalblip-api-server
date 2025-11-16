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
      res.status(400).json({ error: `Geçersiz view parametresi: ${view}` });
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
      res.status(404).json({ error: 'Maç listesi bulunamadı.' });
      return;
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
      res.status(400).json({ error: `Geçersiz view parametresi: ${view}` });
      return;
    }
    const list = await scrapeMatchList({ view, locale: normalizedLocale, headless });
    await saveMatchList(list);
    res.status(201).json({
      message: 'Maç listesi güncellendi.',
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
        };
      }

      res.json({
        ...enriched,
        timezone: targetTimezone,
        timezoneId: tzPreset.id,
        locale: enriched.locale || locale,
      });
      return;
    }

    const metadata = await findMatchMetadata(Number(matchId));
    const resolvedDate = requestedDate ?? metadata?.dataDate ?? currentIsoDate();
    const viewContext = preferredView ?? metadata?.view ?? 'manual';

    const { queuePosition } = enqueueMatchDetailScrape({
      matchId,
      locale,
      homeTeamName: metadata?.homeTeam,
      awayTeamName: metadata?.awayTeam,
      dataDate: resolvedDate,
      view: viewContext,
      viewContext,
      sourceListScrapedAt: metadata?.listScrapedAt,
    });

    res.status(202).json({
      status: 'pending',
      message: 'Ma�� detay�� analiz edilmek ��zere kuyru�a eklendi.',
      matchId,
      queuePosition,
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

    const { queuePosition } = enqueueMatchDetailScrape({
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
    res.status(202).json({
      status: 'pending',
      message: 'Mac detayi analiz kuyruguna alindi.',
      matchId,
      queuePosition,
    });
  } catch (error) {
    next(error);
  }
});

async function findMatchMetadata(matchId) {
  const views = ['today', 'tomorrow'];
  for (const view of views) {
    // Varsayılan olarak TR listesi üzerinden metadata bakıyoruz.
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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Beklenmeyen sunucu hatası.',
  });
});

ensureDataDirectories().then(() => {
  const server = app.listen(PORT, HOST, () => {
    const hostDisplay = HOST === '0.0.0.0' || HOST === '::' ? 'localhost' : HOST;
    const baseUrl = `http://${hostDisplay}:${PORT}`;
    const networkInterfaces = os.networkInterfaces();
    const localIps = Object.values(networkInterfaces)
      .flatMap((entries) => entries || [])
      .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
      .map((entry) => entry.address);

    const dirs = getDataDirectories();

    console.log(`⚽️  GoalBlip API ${baseUrl}`);
    console.log('📡  Sunucu Bilgisi');
    console.log(`   Host     : ${HOST}`);
    console.log(`   Port     : ${PORT}`);
    console.log(`   Data dir : ${dirs.DATA_ROOT}`);
    console.log(`   Lists    : ${dirs.LISTS_DIR}`);
    console.log(`   Matches  : ${dirs.MATCHES_DIR}`);
    if (localIps.length) {
      console.log('🌐  Yerel IP adresleri:');
      localIps.forEach((ip) => {
        console.log(`   http://${ip}:${PORT}`);
      });
    } else {
      console.log('🌐  Yerel IP adresi tespit edilemedi.');
    }
    console.log('🛣️  Örnek istekler:');
    console.log(`   curl ${baseUrl}/api/health`);
    console.log(`   curl ${baseUrl}/api/matches?view=today`);
    console.log(
      `   curl -X POST ${baseUrl}/api/matches/scrape -H 'Content-Type: application/json' -d '{"view":"today"}'`,
    );
    console.log(`   curl ${baseUrl}/api/match/<id>`);
  });

  server.on('close', () => {
    console.log('🛑 HTTP server closed');
  });
});
