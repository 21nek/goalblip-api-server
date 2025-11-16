import fs from 'fs/promises';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), 'data');
const LISTS_DIR = path.join(DATA_ROOT, 'lists');
const MATCHES_DIR = path.join(DATA_ROOT, 'matches');
const MATCHES_ALIAS_DIR = path.join(MATCHES_DIR, 'aliases');
const MATCH_ALIAS_MAP = {
  today: 'latest',
  tomorrow: 'upcoming',
};

export function getDataDirectories() {
  return { DATA_ROOT, LISTS_DIR, MATCHES_DIR };
}

export async function ensureDataDirectories(options = {}) {
  await fs.mkdir(LISTS_DIR, { recursive: true });
  await fs.mkdir(MATCHES_DIR, { recursive: true });
  await fs.mkdir(MATCHES_ALIAS_DIR, { recursive: true });

  const listLocales = options.listLocales ?? [];
  for (const locale of listLocales) {
    if (locale) {
      await fs.mkdir(path.join(LISTS_DIR, locale), { recursive: true });
    }
  }

  const matchDates = options.matchDates ?? [];
  for (const date of matchDates) {
    if (date) {
      await fs.mkdir(path.join(MATCHES_DIR, date), { recursive: true });
    }
  }

  const matchViews = options.matchViews ?? [];
  for (const view of matchViews) {
    const aliasDir = getMatchAliasDir(view);
    if (aliasDir) {
      await fs.mkdir(aliasDir, { recursive: true });
    }
  }

  const matchLocales = options.matchLocales ?? [];
  for (const locale of matchLocales) {
    if (locale) {
      await fs.mkdir(path.join(MATCHES_DIR, locale), { recursive: true });
      await fs.mkdir(path.join(MATCHES_ALIAS_DIR, locale), { recursive: true });
    }
  }
}

export async function writeJsonFile(targetPath, payload) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
  return targetPath;
}

export async function readJsonFile(targetPath) {
  try {
    const raw = await fs.readFile(targetPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export function getListPathByDate(date, { locale } = {}) {
  if (locale) {
    return path.join(LISTS_DIR, locale, `${date}.json`);
  }
  return path.join(LISTS_DIR, `${date}.json`);
}

export function getListAliasPath(view, { locale } = {}) {
  const alias = view === 'tomorrow' ? 'upcoming' : 'latest';
  if (locale) {
    return path.join(LISTS_DIR, locale, `${alias}.json`);
  }
  return path.join(LISTS_DIR, `${alias}.json`);
}

function getMatchAliasDir(view, { locale } = {}) {
  if (!view) return null;
  const aliasFolder = MATCH_ALIAS_MAP[view] ?? view;
  if (locale) {
    return path.join(MATCHES_ALIAS_DIR, locale, aliasFolder);
  }
  return path.join(MATCHES_ALIAS_DIR, aliasFolder);
}

export function getMatchPath(matchId, { sample = false, dataDate, locale } = {}) {
  const prefix = sample ? 'sample-' : '';
  const filename = `${prefix}${matchId}.json`;
  if (dataDate && locale) {
    return path.join(MATCHES_DIR, locale, dataDate, filename);
  }
  if (dataDate) {
    return path.join(MATCHES_DIR, dataDate, filename);
  }
  if (locale) {
    return path.join(MATCHES_DIR, locale, filename);
  }
  return path.join(MATCHES_DIR, filename);
}

export function getMatchAliasPath(matchId, view, { locale } = {}) {
  const aliasDir = getMatchAliasDir(view, { locale });
  if (!aliasDir) {
    return null;
  }
  return path.join(aliasDir, `${matchId}.json`);
}
