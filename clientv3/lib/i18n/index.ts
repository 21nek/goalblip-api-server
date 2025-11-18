import trTranslations from './translations/tr.json';
import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';
import deTranslations from './translations/de.json';
import type { Locale } from '@/providers/locale-provider';

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

// Translation files for each locale
const translations: Record<Locale, typeof trTranslations> = {
  'tr': trTranslations,
  'en': enTranslations,
  'es': esTranslations,
  'de': deTranslations,
  'es-ES': esTranslations, // Use es.json for es-ES
  'es-AR': esTranslations, // Use es.json for es-AR
  'de-AT': deTranslations, // Use de.json for de-AT (Austria)
  'de-CH': deTranslations, // Use de.json for de-CH (Switzerland)
};

/**
 * Get translation for a key
 * Supports nested keys like "home.today" or "match.live"
 * Supports parameters like "leaguesSelected": "{count} lig seçili" -> t('filter.leaguesSelected', { count: 3 })
 */
export function getTranslation(
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const keys = key.split('.');
  let value: any = translations[locale] || translations['tr'];

  // Navigate through nested keys
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Turkish if key not found
      value = translations['tr'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          console.warn(`[i18n] Translation key not found: ${key} (locale: ${locale})`);
          return key; // Return key itself if not found
        }
      }
      break;
    }
  }

  // If value is not a string, return key
  if (typeof value !== 'string') {
    console.warn(`[i18n] Translation value is not a string: ${key} (locale: ${locale})`);
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Hook for using translations in components
 * This will be used via useTranslation hook
 */
export function createTranslationFunction(locale: Locale) {
  return (key: TranslationKey, params?: TranslationParams) => {
    return getTranslation(locale, key, params);
  };
}

