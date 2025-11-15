import express from 'express';
import cors from 'cors';
import os from 'os';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
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
    let payload = null;

    if (refresh === 'true') {
      const scrape = await scrapeMatchList({ locale, view });
      await saveMatchList(scrape);
      payload = scrape;
    } else if (date) {
      payload = await loadMatchListByDate(date);
    } else {
      payload = await loadMatchListByView(view);
    }

    if (!payload && !date) {
      const fresh = await scrapeMatchList({ locale, view });
      await saveMatchList(fresh);
      payload = fresh;
    }

    if (!payload) {
      res.status(404).json({ error: 'Maç listesi bulunamadı.' });
      return;
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.post('/api/matches/scrape', async (req, res, next) => {
  try {
    const { view = 'today', locale = 'tr', headless = 'new' } = req.body || {};
    const list = await scrapeMatchList({ view, locale, headless });
    await saveMatchList(list);
    res.status(201).json({
      message: 'Maç listesi güncellendi.',
      view: list.view,
      dataDate: list.dataDate,
      total: list.totalMatches,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/matches/:date', async (req, res, next) => {
  try {
    const payload = await loadMatchListByDate(req.params.date);
    if (!payload) {
      res.status(404).json({ error: 'Belirtilen tarihe ait veri bulunamadı.' });
      return;
    }
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.get('/api/match/:matchId', async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const locale = req.query.locale || 'tr';
    const requestedDate = typeof req.query.date === 'string' ? req.query.date : undefined;
    const preferredView = typeof req.query.view === 'string' ? req.query.view : undefined;
    const detail = await loadMatchDetail(matchId, { dataDate: requestedDate, view: preferredView });

    if (detail) {
      res.json(detail);
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
    const list = await loadMatchListByView(view);
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
  app.listen(PORT, HOST, () => {
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
});
