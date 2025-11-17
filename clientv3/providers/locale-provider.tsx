import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '@/lib/storage';

// Supported locales
export const SUPPORTED_LOCALES = ['tr', 'en', 'es'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export type TimeFormatPreference = 'auto' | '24h' | '12h';

export const LOCALE_LABEL_KEYS: Record<Locale, string> = {
  tr: 'settings.localeNames.tr',
  en: 'settings.localeNames.en',
  es: 'settings.localeNames.es',
};

export const LOCALE_NATIVE_META: Record<Locale, { nativeName: string; languageWord: string }> = {
  tr: { nativeName: 'T\u00fcrk\u00e7e', languageWord: 'Dil' },
  en: { nativeName: 'English', languageWord: 'Language' },
  es: { nativeName: 'Espa\u00f1ol', languageWord: 'Idioma' },
};


// Timezone presets - IANA IDs
export const TIMEZONE_PRESETS = [
  { id: 'ISTANBUL', labelKey: 'settings.timezoneLabels.ISTANBUL', tz: 'Europe/Istanbul' },
  { id: 'UTC', labelKey: 'settings.timezoneLabels.UTC', tz: 'UTC' },
  { id: 'LONDON', labelKey: 'settings.timezoneLabels.LONDON', tz: 'Europe/London' },
  { id: 'MADRID', labelKey: 'settings.timezoneLabels.MADRID', tz: 'Europe/Madrid' },
  { id: 'BERLIN', labelKey: 'settings.timezoneLabels.BERLIN', tz: 'Europe/Berlin' },
  { id: 'PARIS', labelKey: 'settings.timezoneLabels.PARIS', tz: 'Europe/Paris' },
  { id: 'CIUDAD_DE_MEXICO', labelKey: 'settings.timezoneLabels.CIUDAD_DE_MEXICO', tz: 'America/Mexico_City' },
  { id: 'BUENOS_AIRES', labelKey: 'settings.timezoneLabels.BUENOS_AIRES', tz: 'America/Argentina/Buenos_Aires' },
  { id: 'NEW_YORK', labelKey: 'settings.timezoneLabels.NEW_YORK', tz: 'America/New_York' },
  { id: 'LOS_ANGELES', labelKey: 'settings.timezoneLabels.LOS_ANGELES', tz: 'America/Los_Angeles' },
  { id: 'CHICAGO', labelKey: 'settings.timezoneLabels.CHICAGO', tz: 'America/Chicago' },
  { id: 'BOGOTA', labelKey: 'settings.timezoneLabels.BOGOTA', tz: 'America/Bogota' },
  { id: 'LIMA', labelKey: 'settings.timezoneLabels.LIMA', tz: 'America/Lima' },
  { id: 'SANTIAGO', labelKey: 'settings.timezoneLabels.SANTIAGO', tz: 'America/Santiago' },
  { id: 'DUBAI', labelKey: 'settings.timezoneLabels.DUBAI', tz: 'Asia/Dubai' },
  { id: 'TOKYO', labelKey: 'settings.timezoneLabels.TOKYO', tz: 'Asia/Tokyo' },
  { id: 'SYDNEY', labelKey: 'settings.timezoneLabels.SYDNEY', tz: 'Australia/Sydney' },
] as const;

export type TimezonePreset = typeof TIMEZONE_PRESETS[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const DEFAULT_TIMEZONE = 'Europe/London';
export const DEFAULT_TIME_FORMAT: TimeFormatPreference = 'auto';

const STORAGE_KEYS = {
  locale: '@goalblip:locale',
  timezone: '@goalblip:timezone',
  initialSetupCompleted: '@goalblip:initialSetupCompleted',
  timeFormat: '@goalblip:timeFormat',
};

type LocaleContextValue = {
  locale: Locale;
  timezone: string; // IANA timezone ID
  timezoneId: string; // Preset ID (ISTANBUL, UTC, etc.)
  initialSetupCompleted: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  setTimezone: (timezone: string) => Promise<void>;
  timeFormat: TimeFormatPreference;
  setTimeFormat: (format: TimeFormatPreference) => Promise<void>;
  completeInitialSetup: () => Promise<void>;
  getTimezonePreset: () => TimezonePreset | null;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [timezone, setTimezoneState] = useState<string>(DEFAULT_TIMEZONE);
  const [timezoneId, setTimezoneIdState] = useState<string>('LONDON');
  const [timeFormat, setTimeFormatState] = useState<TimeFormatPreference>(DEFAULT_TIME_FORMAT);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialSetupCompleted, setInitialSetupCompletedState] = useState(false);

  // Find timezone preset by IANA ID
  const findTimezonePreset = useCallback((tz: string): TimezonePreset | null => {
    const preset = TIMEZONE_PRESETS.find((p) => p.tz === tz);
    if (preset) return preset;
    
    // Try to find by preset ID
    const presetById = TIMEZONE_PRESETS.find((p) => p.id === tz);
    if (presetById) return presetById;
    
    return null;
  }, []);

  // Load saved preferences
  useEffect(() => {
    let mounted = true;
    
    async function loadPreferences() {
      try {
        const [savedLocale, savedTimezone, setupCompleted, savedTimeFormat] = await Promise.all([
          getItem(STORAGE_KEYS.locale),
          getItem(STORAGE_KEYS.timezone),
          getItem(STORAGE_KEYS.initialSetupCompleted),
          getItem(STORAGE_KEYS.timeFormat),
        ]);
        
        if (mounted) {
          if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as Locale)) {
            setLocaleState(savedLocale as Locale);
          }
          
          if (savedTimezone) {
            const preset = findTimezonePreset(savedTimezone);
            if (preset) {
              setTimezoneState(preset.tz);
              setTimezoneIdState(preset.id);
            } else {
              // If not found in presets, use as-is (might be a custom IANA ID)
              setTimezoneState(savedTimezone);
              setTimezoneIdState(savedTimezone);
            }
          }
          
          if (savedTimeFormat && ['auto', '24h', '12h'].includes(savedTimeFormat)) {
            setTimeFormatState(savedTimeFormat as TimeFormatPreference);
          }

          // Check if initial setup was completed
          setInitialSetupCompletedState(setupCompleted === 'true');
        }
      } catch (error) {
        console.error('[LocaleProvider] Failed to load preferences:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
        }
      }
    }
    
    loadPreferences();
    
    return () => {
      mounted = false;
    };
  }, [findTimezonePreset]);

  const setLocale = useCallback(async (newLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn('[LocaleProvider] Invalid locale:', newLocale);
      return;
    }
    
    setLocaleState(newLocale);
    try {
      await setItem(STORAGE_KEYS.locale, newLocale);
    } catch (error) {
      console.error('[LocaleProvider] Failed to save locale:', error);
    }
  }, []);

  const setTimezone = useCallback(async (newTimezone: string) => {
    const preset = findTimezonePreset(newTimezone);
    
    if (preset) {
      setTimezoneState(preset.tz);
      setTimezoneIdState(preset.id);
      try {
        // Store IANA ID
        await setItem(STORAGE_KEYS.timezone, preset.tz);
      } catch (error) {
        console.error('[LocaleProvider] Failed to save timezone:', error);
      }
    } else {
      // Custom IANA ID, use as-is
      setTimezoneState(newTimezone);
      setTimezoneIdState(newTimezone);
      try {
        await setItem(STORAGE_KEYS.timezone, newTimezone);
      } catch (error) {
        console.error('[LocaleProvider] Failed to save timezone:', error);
      }
    }
  }, [findTimezonePreset]);

  const setTimeFormat = useCallback(async (format: TimeFormatPreference) => {
    setTimeFormatState(format);
    try {
      await setItem(STORAGE_KEYS.timeFormat, format);
    } catch (error) {
      console.error('[LocaleProvider] Failed to save time format:', error);
    }
  }, []);

  const completeInitialSetup = useCallback(async () => {
    setInitialSetupCompletedState(true);
    try {
      await setItem(STORAGE_KEYS.initialSetupCompleted, 'true');
    } catch (error) {
      console.error('[LocaleProvider] Failed to save initial setup completion:', error);
    }
  }, []);

  const getTimezonePreset = useCallback((): TimezonePreset | null => {
    return findTimezonePreset(timezone);
  }, [timezone, findTimezonePreset]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      timezone,
      timezoneId,
      initialSetupCompleted,
      setLocale,
      setTimezone,
      timeFormat,
      setTimeFormat,
      completeInitialSetup,
      getTimezonePreset,
    }),
    [locale, timezone, timezoneId, timeFormat, initialSetupCompleted, setLocale, setTimezone, setTimeFormat, completeInitialSetup, getTimezonePreset]
  );

  // Don't render children until preferences are loaded
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}

