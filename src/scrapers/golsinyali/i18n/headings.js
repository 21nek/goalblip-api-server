import { normalizeLocale } from '../../../config/locales.js';

const TURKISH_HEADINGS = {
  highlight: ['Öne Çıkan Tahminler'],
  detailed: ['Detaylı Tahminler'],
  odds: ['Oran Trend Analizi'],
  upcoming: ['Gelecek Maçlar'],
};

const ENGLISH_HEADINGS = {
  highlight: ['Featured Predictions', 'Highlighted Predictions', 'Top Predictions'],
  detailed: ['Detailed Predictions', 'Detailed Analysis'],
  odds: ['Odds Trend Analysis', 'Odds Trends', 'Odds Movement'],
  upcoming: ['Upcoming Matches', 'Next Matches'],
};

const SPANISH_HEADINGS = {
  highlight: ['Predicciones Destacadas', 'Pronósticos Destacados'],
  detailed: ['Predicciones Detalladas', 'Análisis Detallado'],
  odds: ['Análisis de Tendencias de Cuotas', 'Tendencias de Cuotas'],
  upcoming: ['Próximos Partidos', 'Próximos Encuentros'],
};

const HEADING_MAP = {
  tr: TURKISH_HEADINGS,
  en: ENGLISH_HEADINGS,
  es: SPANISH_HEADINGS,
};

export function buildHeadingConfig(locale) {
  const resolved = normalizeLocale(locale);
  const base = resolved.split(/[-_]/)[0];
  const headingSet = HEADING_MAP[base] || TURKISH_HEADINGS;
  return {
    highlight: headingSet.highlight || TURKISH_HEADINGS.highlight,
    detailed: headingSet.detailed || TURKISH_HEADINGS.detailed,
    odds: headingSet.odds || TURKISH_HEADINGS.odds,
    upcoming: headingSet.upcoming || TURKISH_HEADINGS.upcoming,
  };
}
