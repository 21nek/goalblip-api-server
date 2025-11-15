import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';
import { saveMatchDetail, saveMatchList } from '../services/match-storage.js';
import { ensureDataDirectories } from '../utils/data-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const LISTS_DIR = path.join(DATA_DIR, 'lists');
const MATCHES_DIR = path.join(DATA_DIR, 'matches');

async function writeJson(targetPath, payload) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
  return targetPath;
}

async function main() {
  await ensureDataDirectories();

  const listResults = [];
  for (const view of ['today', 'tomorrow']) {
    try {
      const list = await scrapeMatchList({ view });
      listResults.push({ view, list });
      await saveMatchList(list);

      if (view === 'today') {
        await writeJson(path.join(LISTS_DIR, 'sample-latest.json'), list);
      } else if (view === 'tomorrow') {
        await writeJson(path.join(LISTS_DIR, 'sample-upcoming.json'), list);
      }

      console.log(`[ok] ${view} listesi kaydedildi (${list.dataDate}).`);
    } catch (error) {
      console.warn(`[warn] ${view} listesi alinamada:`, error.message || error);
    }
  }

  const primaryList = listResults.find((entry) => entry.view === 'today') ?? listResults[0];
  const firstMatch = primaryList?.list?.matches?.[0];
  if (!firstMatch) {
    console.warn('Match list bos dondu, detay verisi olusturulamadi.');
    return;
  }

  const detail = await scrapeMatchDetail({
    matchId: firstMatch.matchId,
    locale: primaryList.list.locale,
    homeTeamName: firstMatch.homeTeam,
    awayTeamName: firstMatch.awayTeam,
    view: primaryList.view,
  });

  await saveMatchDetail({
    ...detail,
    dataDate: primaryList.list.dataDate,
    viewContext: primaryList.view,
  });

  await writeJson(path.join(MATCHES_DIR, `sample-${firstMatch.matchId}.json`), detail);

  console.log('Veriler data/ klasor yapisina kaydedildi.');
}

main().catch((error) => {
  console.error('Ornek veri olusturulurken hata olustu:', error);
  process.exit(1);
});
