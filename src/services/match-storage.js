import {
  ensureDataDirectories,
  getListAliasPath,
  getListPathByDate,
  getMatchPath,
  readJsonFile,
  writeJsonFile,
} from '../utils/data-store.js';

export async function saveMatchList(listData) {
  if (!listData?.dataDate) {
    throw new Error('List verisi geçersiz: dataDate alanı eksik.');
  }

  await ensureDataDirectories();
  const datedPath = getListPathByDate(listData.dataDate);
  await writeJsonFile(datedPath, listData);

  if (listData.view === 'today') {
    await writeJsonFile(getListAliasPath('today'), listData);
  } else if (listData.view === 'tomorrow') {
    await writeJsonFile(getListAliasPath('tomorrow'), listData);
  }

  return datedPath;
}

export async function loadMatchListByDate(date) {
  return readJsonFile(getListPathByDate(date));
}

export async function loadMatchListByView(view = 'today') {
  return readJsonFile(getListAliasPath(view));
}

export async function saveMatchDetail(detail) {
  if (!detail?.matchId) {
    throw new Error('Detay verisi geçersiz: matchId alanı eksik.');
  }
  await ensureDataDirectories();
  const path = getMatchPath(detail.matchId);
  await writeJsonFile(path, detail);
  return path;
}

export async function loadMatchDetail(matchId) {
  return readJsonFile(getMatchPath(matchId));
}
