export const DEFAULT_TIMEZONE = 'Europe/Istanbul';

export const TIMEZONE_PRESETS = [
  { id: 'UTC', label: 'UTC (GMT+0)', tz: 'UTC' },
  { id: 'ISTANBUL', label: 'İstanbul (GMT+3)', tz: 'Europe/Istanbul' },
  { id: 'LONDON', label: 'London (GMT+0)', tz: 'Europe/London' },
  { id: 'MADRID', label: 'Madrid (GMT+1)', tz: 'Europe/Madrid' },
  { id: 'BERLIN', label: 'Berlin (GMT+1)', tz: 'Europe/Berlin' },
  { id: 'PARIS', label: 'Paris (GMT+1)', tz: 'Europe/Paris' },
  { id: 'CIUDAD_DE_MEXICO', label: 'Ciudad de México (GMT-6)', tz: 'America/Mexico_City' },
  { id: 'BUENOS_AIRES', label: 'Buenos Aires (GMT-3)', tz: 'America/Argentina/Buenos_Aires' },
  { id: 'NEW_YORK', label: 'New York (GMT-5)', tz: 'America/New_York' },
  { id: 'LOS_ANGELES', label: 'Los Angeles (GMT-8)', tz: 'America/Los_Angeles' },
  { id: 'CHICAGO', label: 'Chicago (GMT-6)', tz: 'America/Chicago' },
  { id: 'BOGOTA', label: 'Bogotá (GMT-5)', tz: 'America/Bogota' },
  { id: 'LIMA', label: 'Lima (GMT-5)', tz: 'America/Lima' },
  { id: 'SANTIAGO', label: 'Santiago (GMT-4)', tz: 'America/Santiago' },
  { id: 'DUBAI', label: 'Dubai (GMT+4)', tz: 'Asia/Dubai' },
  { id: 'TOKYO', label: 'Tokyo (GMT+9)', tz: 'Asia/Tokyo' },
  { id: 'SYDNEY', label: 'Sydney (GMT+10)', tz: 'Australia/Sydney' },
];

export function findTimezoneById(id) {
  if (!id) {
    return TIMEZONE_PRESETS.find((item) => item.tz === DEFAULT_TIMEZONE) || TIMEZONE_PRESETS[0];
  }
  return (
    TIMEZONE_PRESETS.find((item) => item.id === id) ||
    TIMEZONE_PRESETS.find((item) => item.tz === id) ||
    TIMEZONE_PRESETS[0]
  );
}

