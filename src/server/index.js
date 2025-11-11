import express from 'express';
import cors from 'cors';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';
import {
  loadMatchDetail,
  loadMatchListByDate,
  loadMatchListByView,
  saveMatchDetail,
  saveMatchList,
} from '../services/match-storage.js';
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
    let detail = await loadMatchDetail(matchId);

    if (!detail) {
      const metadata = await findMatchMetadata(Number(matchId));
      const scraped = await scrapeMatchDetail({
        matchId,
        homeTeamName: metadata?.homeTeam,
        awayTeamName: metadata?.awayTeam,
      });
      await saveMatchDetail(scraped);
      detail = scraped;
    }

    res.json(detail);
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
    } = req.body || {};

    const detail = await scrapeMatchDetail({
      matchId,
      locale,
      slug,
      headless,
      homeTeamName,
      awayTeamName,
    });
    await saveMatchDetail(detail);
    res.status(201).json({ message: 'Maç detayı güncellendi.', matchId });
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
      return match;
    }
  }
  return null;
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

    const dirs = getDataDirectories();

    console.log(`⚽️  GoalBlip API ${baseUrl}`);
    console.log('📡  Sunucu Bilgisi');
    console.log(`   Host     : ${HOST}`);
    console.log(`   Port     : ${PORT}`);
    console.log(`   Data dir : ${dirs.DATA_ROOT}`);
    console.log(`   Lists    : ${dirs.LISTS_DIR}`);
    console.log(`   Matches  : ${dirs.MATCHES_DIR}`);
    console.log('🛣️  Örnek istekler:');
    console.log(`   curl ${baseUrl}/api/health`);
    console.log(`   curl ${baseUrl}/api/matches?view=today`);
    console.log(
      `   curl -X POST ${baseUrl}/api/matches/scrape -H 'Content-Type: application/json' -d '{"view":"today"}'`,
    );
    console.log(`   curl ${baseUrl}/api/match/<id>`);
  });
});
