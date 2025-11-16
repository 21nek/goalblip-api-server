import { DEFAULT_TIMEZONE } from '../config/timezones.js';

export function toUtcFromLocal(date, time, baseTimezone = DEFAULT_TIMEZONE) {
  if (!date || !time) {
    return null;
  }

  try {
    // Basic ISO-like composition: YYYY-MM-DDTHH:mm:00
    const [hour = '00', minute = '00'] = time.split(':');
    const isoLocal = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    const instant = new Date(isoLocal);

    // Date by default assumes local timezone; to avoid environment-dependent
    // differences we rely on Intl to shift from the declared base timezone.
    const utcTimestamp = instant.getTime() - getTimezoneOffsetMs(instant, baseTimezone);
    return new Date(utcTimestamp).toISOString();
  } catch {
    return null;
  }
}

export function formatUtcForTimezone(isoUtc, timezone, options = {}) {
  if (!isoUtc) {
    return null;
  }

  const targetTz = timezone || DEFAULT_TIMEZONE;
  const date = typeof isoUtc === 'string' ? new Date(isoUtc) : isoUtc;

  try {
    const { withDate = false } = options;
    const baseOptions = {
      timeZone: targetTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    const fmtOptions = withDate
      ? {
          ...baseOptions,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }
      : baseOptions;

    return new Intl.DateTimeFormat('en-GB', fmtOptions).format(date);
  } catch {
    return null;
  }
}

function getTimezoneOffsetMs(date, timeZone) {
  // Approximate offset by formatting the same instant in the target timezone.
  const locale = 'en-US';
  const dtf = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const values = {};
  for (const { type, value } of parts) {
    if (type !== 'literal') {
      values[type] = value;
    }
  }

  const asLocal = new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asLocal.getTime() - date.getTime();
}

