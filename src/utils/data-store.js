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

export function getListPathByDate(date) {
  return path.join(LISTS_DIR, `${date}.json`);
}

export function getListAliasPath(view) {
  const alias = view === 'tomorrow' ? 'upcoming' : 'latest';
  return path.join(LISTS_DIR, `${alias}.json`);
}

function getMatchAliasDir(view) {
  if (!view) return null;
  const aliasFolder = MATCH_ALIAS_MAP[view] ?? view;
  return path.join(MATCHES_ALIAS_DIR, aliasFolder);
}

export function getMatchPath(matchId, { sample = false, dataDate } = {}) {
  const prefix = sample ? 'sample-' : '';
  const filename = `${prefix}${matchId}.json`;
  if (dataDate) {
    return path.join(MATCHES_DIR, dataDate, filename);
  }
  return path.join(MATCHES_DIR, filename);
}

export function getMatchAliasPath(matchId, view) {
  const aliasDir = getMatchAliasDir(view);
  if (!aliasDir) {
    return null;
  }
  return path.join(aliasDir, `${matchId}.json`);
}
