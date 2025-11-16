import { useLocale } from '@/providers/locale-provider';
import { createTranslationFunction } from '@/lib/i18n';
import { useMemo } from 'react';

/**
 * Hook for accessing translations
 * Usage:
 *   const t = useTranslation();
 *   <Text>{t('home.today')}</Text>
 *   <Text>{t('filter.leaguesSelected', { count: 3 })}</Text>
 */
export function useTranslation() {
  const { locale } = useLocale();
  
  const t = useMemo(() => {
    return createTranslationFunction(locale);
  }, [locale]);

  return t;
}

