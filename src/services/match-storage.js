import {
  ensureDataDirectories,
  getListAliasPath,
  getListPathByDate,
  getMatchAliasPath,
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
  if (!detail?.dataDate) {
    throw new Error('Detay verisi geçersiz: dataDate alanı eksik.');
  }

  const view = detail?.viewContext;
  await ensureDataDirectories({
    matchDates: [detail.dataDate],
    matchViews: view ? [view] : [],
  });

  const datedPath = getMatchPath(detail.matchId, { dataDate: detail.dataDate });
  await writeJsonFile(datedPath, detail);

  if (view) {
    const aliasPath = getMatchAliasPath(detail.matchId, view);
    if (aliasPath) {
      await writeJsonFile(aliasPath, detail);
    }
  }

  return datedPath;
}

export async function loadMatchDetail(matchId, { dataDate, view } = {}) {
  if (dataDate) {
    const dated = await readJsonFile(getMatchPath(matchId, { dataDate }));
    if (dated) {
      return dated;
    }
  }

  if (view) {
    const aliasPath = getMatchAliasPath(matchId, view);
    if (aliasPath) {
      const detail = await readJsonFile(aliasPath);
      if (detail) {
        return detail;
      }
    }
  }

  // Default order: today alias, tomorrow alias, legacy root file.
  const todayAlias = await tryReadAlias(matchId, 'today');
  if (todayAlias) {
    return todayAlias;
  }

  const tomorrowAlias = await tryReadAlias(matchId, 'tomorrow');
  if (tomorrowAlias) {
    return tomorrowAlias;
  }

  const manualAlias = await tryReadAlias(matchId, 'manual');
  if (manualAlias) {
    return manualAlias;
  }

  return readJsonFile(getMatchPath(matchId));
}

async function tryReadAlias(matchId, view) {
  const aliasPath = getMatchAliasPath(matchId, view);
  if (!aliasPath) return null;
  return readJsonFile(aliasPath);
}
