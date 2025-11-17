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
    await writeJsonFile(
      getListAliasPath('today', { locale }),
      createListAliasPayload(listData.dataDate, locale),
    );
  } else if (listData.view === 'tomorrow') {
    await writeJsonFile(
      getListAliasPath('tomorrow', { locale }),
      createListAliasPayload(listData.dataDate, locale),
    );
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
    const resolved = await resolveListAlias(localized, { locale: normalized });
    if (resolved) {
      return resolved;
    }
  }
  // Eski alias dosyalar?? (locale'siz) i??in fallback.
  const legacy = await readJsonFile(getListAliasPath(view));
  return resolveListAlias(legacy, {});
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
      await writeJsonFile(
        aliasPath,
        createMatchAliasPayload({
          matchId: detail.matchId,
          locale,
          dataDate: detail.dataDate,
        }),
      );
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
        const resolvedLocalized = await resolveMatchAlias(localizedDetail, {
          matchId,
          locale: normalizedLocale,
        });
        if (resolvedLocalized) {
          return resolvedLocalized;
        }
      }
    }
    const aliasPath = getMatchAliasPath(matchId, view);
    if (aliasPath) {
      const detail = await readJsonFile(aliasPath);
      const resolved = await resolveMatchAlias(detail, { matchId });
      if (resolved) {
        return resolved;
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
  const payload = await readJsonFile(aliasPath);
  return resolveMatchAlias(payload, { matchId, locale });
}
function createListAliasPayload(date, locale) {
  return {
    __aliasRef: true,
    date,
    locale,
  };
}

function createMatchAliasPayload({ matchId, dataDate, locale }) {
  return {
    __matchAliasRef: true,
    ref: {
      matchId,
      dataDate,
      locale,
    },
  };
}

async function resolveListAlias(payload, { locale }) {
  if (!payload) {
    return null;
  }
  if (payload.__aliasRef && payload.date) {
    const effectiveLocale = payload.locale || locale || null;
    return loadMatchListByDate(payload.date, { locale: effectiveLocale });
  }
  if (payload.matches) {
    return payload;
  }
  return null;
}

async function resolveMatchAlias(payload, { matchId, locale }) {
  if (!payload) {
    return null;
  }
  if (payload.__matchAliasRef && payload.ref?.dataDate) {
    const targetLocale = payload.ref.locale || locale || null;
    return loadMatchDetail(matchId, {
      dataDate: payload.ref.dataDate,
      locale: targetLocale,
    });
  }
  if (payload.matchId) {
    return payload;
  }
  return null;
}
