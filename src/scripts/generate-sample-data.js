import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeMatchList } from '../scrapers/golsinyali/match-list.js';
import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const LISTS_DIR = path.join(DATA_DIR, 'lists');
const MATCHES_DIR = path.join(DATA_DIR, 'matches');

async function ensureStructure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(LISTS_DIR, { recursive: true });
  await fs.mkdir(MATCHES_DIR, { recursive: true });
}

async function writeJson(targetPath, data) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(data, null, 2), 'utf-8');
  return targetPath;
}

async function main() {
  await ensureStructure();

  const listResults = [];
  for (const view of ['today', 'tomorrow']) {
    try {
      const list = await scrapeMatchList({ view });
      listResults.push({ view, list });
      const destination = path.join(LISTS_DIR, `${list.dataDate}.json`);
      await writeJson(destination, list);

      if (view === 'today') {
        await writeJson(path.join(LISTS_DIR, 'latest.json'), list);
        await writeJson(path.join(LISTS_DIR, 'sample-latest.json'), list);
      } else if (view === 'tomorrow') {
        await writeJson(path.join(LISTS_DIR, 'upcoming.json'), list);
        await writeJson(path.join(LISTS_DIR, 'sample-upcoming.json'), list);
      }

      console.log(`✔️  ${view} listesi kaydedildi (${list.dataDate}).`);
    } catch (error) {
      console.warn(`⚠️  ${view} listesi alınamadı:`, error.message || error);
    }
  }

  const primaryList = listResults.find((entry) => entry.view === 'today') ?? listResults[0];
  const firstMatch = primaryList?.list?.matches?.[0];
  if (!firstMatch) {
    console.warn('Match list boş döndü, detay verisi oluşturulamadı.');
    return;
  }

  const detail = await scrapeMatchDetail({
    matchId: firstMatch.matchId,
    locale: primaryList.list.locale,
    homeTeamName: firstMatch.homeTeam,
    awayTeamName: firstMatch.awayTeam,
  });

  const detailPath = path.join(MATCHES_DIR, `${firstMatch.matchId}.json`);
  await writeJson(detailPath, detail);
  await writeJson(path.join(MATCHES_DIR, `sample-${firstMatch.matchId}.json`), detail);

  console.log('Veriler data/ klasör yapısına kaydedildi.');
}

main().catch((error) => {
  console.error('Örnek veri oluşturulurken hata oluştu:', error);
  process.exit(1);
});
