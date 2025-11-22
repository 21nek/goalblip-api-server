import type { TimeFormatPreference } from '@/providers/locale-provider';

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'short',
  timeStyle: 'short',
};

function applyTimePreference(
  options: Intl.DateTimeFormatOptions,
  preference: TimeFormatPreference,
) {
  const hasTimeComponent =
    Boolean(options.timeStyle) ||
    Boolean(options.hour) ||
    Boolean(options.minute) ||
    Boolean(options.second);
  if (!hasTimeComponent) {
    return;
  }

  if (preference === '12h') {
    options.hour12 = true;
    options.hourCycle = 'h12';
  } else if (preference === '24h') {
    options.hour12 = false;
    options.hourCycle = 'h23';
  }
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale: string,
  timezone?: string | null,
  timeFormat: TimeFormatPreference = 'auto',
  customOptions?: Intl.DateTimeFormatOptions,
) {
  if (!value) return null;
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = customOptions
    ? { ...customOptions }
    : { ...DEFAULT_OPTIONS };

  if (timezone) {
    options.timeZone = timezone;
  }

  applyTimePreference(options, timeFormat);

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function formatTimeOnly(
  value: string | Date | null | undefined,
  locale: string,
  timezone: string | undefined,
  timeFormat: TimeFormatPreference,
) {
  return formatDateTime(value, locale, timezone, timeFormat, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
