import fs from 'fs/promises';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), 'data');
const LISTS_DIR = path.join(DATA_ROOT, 'lists');
const MATCHES_DIR = path.join(DATA_ROOT, 'matches');
const MATCHES_ALIAS_DIR = path.join(MATCHES_DIR, 'aliases');

const ROOT_LOCALE = 'tr';

async function ensureDir(target) {
  await fs.mkdir(target, { recursive: true });
}

async function moveFile(src, dest) {
  try {
    await ensureDir(path.dirname(dest));
    await fs.rename(src, dest);
    console.log(`[migrate] moved ${src} -> ${dest}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

async function migrateListFiles() {
  await ensureDir(path.join(LISTS_DIR, ROOT_LOCALE));
  const entries = await fs.readdir(LISTS_DIR, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => {
        const src = path.join(LISTS_DIR, entry.name);
        const dest = path.join(LISTS_DIR, ROOT_LOCALE, entry.name);
        return moveFile(src, dest);
      }),
  );
}

async function migrateMatchDateDirs() {
  await ensureDir(path.join(MATCHES_DIR, ROOT_LOCALE));
  const entries = await fs.readdir(MATCHES_DIR, { withFileTypes: true });
  const dateDirs = entries.filter(
    (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name),
  );
  for (const dir of dateDirs) {
    const src = path.join(MATCHES_DIR, dir.name);
    const dest = path.join(MATCHES_DIR, ROOT_LOCALE, dir.name);
    await ensureDir(path.dirname(dest));
    await fs.rename(src, dest);
    console.log(`[migrate] moved ${src} -> ${dest}`);
  }
}

async function migrateMatchRootFiles() {
  const entries = await fs.readdir(MATCHES_DIR, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => {
        const src = path.join(MATCHES_DIR, entry.name);
        const dest = path.join(MATCHES_DIR, ROOT_LOCALE, entry.name);
        return moveFile(src, dest);
      }),
  );
}

async function migrateAliasFiles() {
  await ensureDir(path.join(MATCHES_ALIAS_DIR, ROOT_LOCALE));
  const entries = await fs.readdir(MATCHES_ALIAS_DIR, { withFileTypes: true });
  const aliasDirs = entries.filter(
    (entry) => entry.isDirectory() && entry.name !== ROOT_LOCALE,
  );

  // Move loose files in aliases root
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => {
        const src = path.join(MATCHES_ALIAS_DIR, entry.name);
        const dest = path.join(MATCHES_ALIAS_DIR, ROOT_LOCALE, entry.name);
        return moveFile(src, dest);
      }),
  );

  for (const dir of aliasDirs) {
    const srcDir = path.join(MATCHES_ALIAS_DIR, dir.name);
    const destDir = path.join(MATCHES_ALIAS_DIR, ROOT_LOCALE, dir.name);
    await ensureDir(path.dirname(destDir));
    await fs.rename(srcDir, destDir);
    console.log(`[migrate] moved ${srcDir} -> ${destDir}`);
  }
}

async function main() {
  console.log('[migrate] starting locale migration');
  await migrateListFiles();
  await migrateMatchDateDirs();
  await migrateMatchRootFiles();
  await migrateAliasFiles();
  console.log('[migrate] completed locale migration');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[migrate] error:', error);
    process.exit(1);
  });
