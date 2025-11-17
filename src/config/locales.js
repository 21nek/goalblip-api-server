export const DEFAULT_LOCALE = 'tr';

export const SUPPORTED_LOCALES = ['tr'];

const LOCALE_PATH_MAP = {
  tr: 'tr',
};

export function normalizeLocale(input) {
  const value = (input || DEFAULT_LOCALE).toString().trim();
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const lowered = value.toLowerCase();
  const direct = SUPPORTED_LOCALES.find((code) => code.toLowerCase() === lowered);
  if (direct) {
    return direct;
  }

  // Fallback: basic language code (tr, en, es, vs.)
  const [lang] = lowered.split(/[_-]/);
  const langMatch = SUPPORTED_LOCALES.find((code) => code.split(/[_-]/)[0].toLowerCase() === lang);
  return langMatch || DEFAULT_LOCALE;
}

export function localeToPathSegment(locale) {
  const safeLocale = normalizeLocale(locale);
  return LOCALE_PATH_MAP[safeLocale] || safeLocale;
}

