import { normalizeLocale } from '../../../config/locales.js';

const VIEW_LABELS = {
  tr: {
    today: 'bugün',
    tomorrow: 'yarın',
  },
  en: {
    today: 'today',
    tomorrow: 'tomorrow',
  },
  es: {
    today: 'hoy',
    tomorrow: 'mañana',
  },
};

export const VIEW_KEYS = ['today', 'tomorrow'];

export function getViewLabel(view, locale) {
  const normalizedView = VIEW_KEYS.includes(view) ? view : 'today';
  const resolvedLocale = normalizeLocale(locale);
  const base = resolvedLocale.split(/[-_]/)[0];
  const labels = VIEW_LABELS[base] || VIEW_LABELS.tr;
  return labels[normalizedView] || VIEW_LABELS.tr[normalizedView];
}

export function isValidView(view) {
  return VIEW_KEYS.includes(view);
}

const ATTRIBUTE_SELECTORS = ['button[data-view="{view}"]', '[data-tab="{view}"]', '[data-testid*="{view}"]'];

export async function ensureView(page, view, locale) {
  if (view === 'today') {
    return;
  }

  const label = getViewLabel(view, locale);
  const fallbackLabel = getViewLabel(view, 'tr');

  await page.evaluate(
    ({ label, fallbackLabel, view, selectors }) => {
      const tryAttribute = () => {
        for (const selector of selectors) {
          const candidate = document.querySelector(selector.replace('{view}', view));
          if (candidate) {
            candidate.click();
            return true;
          }
        }
        return false;
      };

      const tryTextMatch = (textLabel) => {
        const normalized = textLabel.toLowerCase();
        const candidates = Array.from(
          document.querySelectorAll('aside button, nav button, [role="tab"], div button'),
        );
        const target = candidates.find((btn) => {
          const content = btn.textContent?.trim().toLowerCase();
          return content && content.includes(normalized);
        });
        if (target) {
          target.click();
          return true;
        }
        return false;
      };

      if (tryAttribute()) return;
      if (tryTextMatch(label)) return;
      if (fallbackLabel && fallbackLabel !== label) {
        tryTextMatch(fallbackLabel);
      }
    },
    { label, fallbackLabel, view, selectors: ATTRIBUTE_SELECTORS },
  );

  await new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });
}
