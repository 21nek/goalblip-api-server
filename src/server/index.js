import express from 'express';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';
import {
  loadMatchDetail,
  loadMatchListByDate,
  loadMatchListByView,
  saveMatchDetail,
  saveMatchList,
} from '../services/match-storage.js';
import { ensureDataDirectories } from '../utils/data-store.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());

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
    const detail = await loadMatchDetail(req.params.matchId);
    if (!detail) {
      res.status(404).json({ error: 'Maç detayı bulunamadı.' });
      return;
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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Beklenmeyen sunucu hatası.',
  });
});

ensureDataDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`⚽️  GoalBlip API http://localhost:${PORT}`);
  });
});
