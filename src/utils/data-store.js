import fs from 'fs/promises';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), 'data');
const LISTS_DIR = path.join(DATA_ROOT, 'lists');
const MATCHES_DIR = path.join(DATA_ROOT, 'matches');

export function getDataDirectories() {
  return { DATA_ROOT, LISTS_DIR, MATCHES_DIR };
}

export async function ensureDataDirectories() {
  await fs.mkdir(LISTS_DIR, { recursive: true });
  await fs.mkdir(MATCHES_DIR, { recursive: true });
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

export function getMatchPath(matchId, { sample = false } = {}) {
  const prefix = sample ? 'sample-' : '';
  return path.join(MATCHES_DIR, `${prefix}${matchId}.json`);
}
