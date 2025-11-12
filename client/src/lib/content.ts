import { promises as fs } from 'fs';
import path from 'path';
import { defaultLocale, isLocale } from './i18n';
import type { HomeContent } from '@/src/types/home';

async function readHome(locale: string): Promise<HomeContent | null> {
  try {
    const file = path.join(process.cwd(), 'content', 'home', `${locale}.json`);
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data) as HomeContent;
  } catch {
    return null;
  }
}

export async function getHomeContent(locale: string): Promise<HomeContent> {
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const data = await readHome(safeLocale);
  if (data) {
    return data;
  }
  const fallback = await readHome(defaultLocale);
  if (!fallback) {
    throw new Error('Home content not found');
  }
  return fallback;
}
