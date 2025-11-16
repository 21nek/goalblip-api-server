import {
  ensureDataDirectories,
  getListAliasPath,
  getListPathByDate,
  getMatchAliasPath,
  getMatchPath,
  readJsonFile,
  writeJsonFile,
} from '../utils/data-store.js';
import { normalizeLocale } from '../config/locales.js';

export async function saveMatchList(listData) {
  if (!listData?.dataDate) {
    throw new Error('List verisi geçersiz: dataDate alanı eksik.');
  }

  const locale = normalizeLocale(listData.locale || 'tr');

  await ensureDataDirectories({ listLocales: [locale] });
  const datedPath = getListPathByDate(listData.dataDate, { locale });
  await writeJsonFile(datedPath, listData);

  if (listData.view === 'today') {
    await writeJsonFile(getListAliasPath('today', { locale }), listData);
  } else if (listData.view === 'tomorrow') {
    await writeJsonFile(getListAliasPath('tomorrow', { locale }), listData);
  }

  return datedPath;
}

export async function loadMatchListByDate(date, { locale } = {}) {
  const normalized = locale ? normalizeLocale(locale) : null;
  if (normalized) {
    const localized = await readJsonFile(getListPathByDate(date, { locale: normalized }));
    if (localized) {
      return localized;
    }
  }
  // Geriye dönük uyumluluk için eski path'i de dene.
  return readJsonFile(getListPathByDate(date));
}

export async function loadMatchListByView(view = 'today', { locale } = {}) {
  const normalized = locale ? normalizeLocale(locale) : null;
  if (normalized) {
    const localized = await readJsonFile(getListAliasPath(view, { locale: normalized }));
    if (localized) {
      return localized;
    }
  }
  // Eski alias dosyaları (locale'siz) için fallback.
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
  const locale = normalizeLocale(detail?.locale || 'tr');

  await ensureDataDirectories({
    matchDates: [detail.dataDate],
    matchViews: view ? [view] : [],
    matchLocales: [locale],
  });

  const datedPath = getMatchPath(detail.matchId, { dataDate: detail.dataDate, locale });
  await writeJsonFile(datedPath, detail);

  if (view) {
    const aliasPath = getMatchAliasPath(detail.matchId, view, { locale });
    if (aliasPath) {
      await writeJsonFile(aliasPath, detail);
    }
  }

  return datedPath;
}

export async function loadMatchDetail(matchId, { dataDate, view, locale } = {}) {
  const normalizedLocale = locale ? normalizeLocale(locale) : null;
  if (dataDate) {
    if (normalizedLocale) {
      const localized = await readJsonFile(
        getMatchPath(matchId, { dataDate, locale: normalizedLocale }),
      );
      if (localized) {
        return localized;
      }
    }
    const dated = await readJsonFile(getMatchPath(matchId, { dataDate }));
    if (dated) {
      return dated;
    }
  }

  if (view) {
    if (normalizedLocale) {
      const localizedAliasPath = getMatchAliasPath(matchId, view, { locale: normalizedLocale });
      if (localizedAliasPath) {
        const localizedDetail = await readJsonFile(localizedAliasPath);
        if (localizedDetail) {
          return localizedDetail;
        }
      }
    }
    const aliasPath = getMatchAliasPath(matchId, view);
    if (aliasPath) {
      const detail = await readJsonFile(aliasPath);
      if (detail) {
        return detail;
      }
    }
  }

  // Default order: locale-aware aliases, sonra locale'siz alias/root fallback.
  const todayAlias = await tryReadAlias(matchId, 'today', normalizedLocale);
  if (todayAlias) {
    return todayAlias;
  }

  const tomorrowAlias = await tryReadAlias(matchId, 'tomorrow', normalizedLocale);
  if (tomorrowAlias) {
    return tomorrowAlias;
  }

  const manualAlias = await tryReadAlias(matchId, 'manual', normalizedLocale);
  if (manualAlias) {
    return manualAlias;
  }

  if (normalizedLocale) {
    const localizedRoot = await readJsonFile(getMatchPath(matchId, { locale: normalizedLocale }));
    if (localizedRoot) {
      return localizedRoot;
    }
  }

  return readJsonFile(getMatchPath(matchId));
}

async function tryReadAlias(matchId, view, locale) {
  const aliasPath = getMatchAliasPath(matchId, view, { locale });
  if (!aliasPath) return null;
  return readJsonFile(aliasPath);
}
