import type { TimeFormatPreference } from '@/providers/locale-provider';
import { formatDateTime } from '@/lib/datetime';

type Translator = (key: string, params?: Record<string, string | number>) => string;

const normalize = (value?: string | null) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractNumericValue = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  return match ? match[1].replace(',', '.') : null;
};

const PREDICTION_TITLE_MAP: Record<string, string> = {
  'mac sonucu': 'matchDetail.predictionLabels.matchResult',
  'mac sonucu 1x2': 'matchDetail.predictionLabels.matchResult',
  'mac sonucu 1 0 2': 'matchDetail.predictionLabels.matchResult',
  'match result': 'matchDetail.predictionLabels.matchResult',
  'match result 1x2': 'matchDetail.predictionLabels.matchResult',
  'match result 1 0 2': 'matchDetail.predictionLabels.matchResult',
  'karsilikli gol': 'matchDetail.predictionLabels.bothTeamsScore',
  'karsilikli gol var': 'matchDetail.predictionLabels.bothTeamsScore',
  'both teams score': 'matchDetail.predictionLabels.bothTeamsScore',
  'gol sayisi': 'matchDetail.predictionLabels.totalGoals',
  'total goals': 'matchDetail.predictionLabels.totalGoals',
  'ilk yari sonucu': 'matchDetail.predictionLabels.firstHalfResult',
  'first half result': 'matchDetail.predictionLabels.firstHalfResult',
  'ilk yari gol sayisi': 'matchDetail.predictionLabels.firstHalfGoals',
  'first half goals': 'matchDetail.predictionLabels.firstHalfGoals',
  'takim skoru': 'matchDetail.predictionLabels.teamToScore',
  'team to score': 'matchDetail.predictionLabels.teamToScore',
  'asya handikap': 'matchDetail.predictionLabels.asianHandicap',
  'asian handicap': 'matchDetail.predictionLabels.asianHandicap',
  'alt ust hatlari': 'matchDetail.predictionLabels.overUnderLines',
  'over under lines': 'matchDetail.predictionLabels.overUnderLines',
  'alt ust hatlari ilk yari': 'matchDetail.predictionLabels.firstHalfOverUnder',
  'ilk yari alt ust hatlari': 'matchDetail.predictionLabels.firstHalfOverUnder',
  'first half over under lines': 'matchDetail.predictionLabels.firstHalfOverUnder',
  'iy asya handikap': 'matchDetail.predictionLabels.firstHalfAsianHandicap',
  'ilk yari asya handikap': 'matchDetail.predictionLabels.firstHalfAsianHandicap',
  'first half asian handicap': 'matchDetail.predictionLabels.firstHalfAsianHandicap',
};

const OUTCOME_LABEL_MAP: Record<string, string> = {
  'ev sahibi': 'matchDetail.outcomeLabels.home',
  'evsahibi': 'matchDetail.outcomeLabels.home',
  'home': 'matchDetail.outcomeLabels.home',
  'home win': 'matchDetail.outcomeLabels.home',
  'home team': 'matchDetail.outcomeLabels.home',
  'ic saha': 'matchDetail.outcomeLabels.home',
  'beraberlik': 'matchDetail.outcomeLabels.draw',
  'draw': 'matchDetail.outcomeLabels.draw',
  'deplasman': 'matchDetail.outcomeLabels.away',
  'deplasman takim': 'matchDetail.outcomeLabels.away',
  'away': 'matchDetail.outcomeLabels.away',
  'away win': 'matchDetail.outcomeLabels.away',
  'away team': 'matchDetail.outcomeLabels.away',
  'misafir': 'matchDetail.outcomeLabels.away',
  'evet': 'matchDetail.outcomeLabels.yes',
  'hayir': 'matchDetail.outcomeLabels.no',
  'evet kg var': 'matchDetail.outcomeLabels.bttsYes',
  'hayir kg yok': 'matchDetail.outcomeLabels.bttsNo',
  'yes': 'matchDetail.outcomeLabels.yes',
  'no': 'matchDetail.outcomeLabels.no',
  'ev sahibi gol atar': 'matchDetail.outcomeLabels.homeWillScore',
  'deplasman gol atar': 'matchDetail.outcomeLabels.awayWillScore',
  'home team scores': 'matchDetail.outcomeLabels.homeWillScore',
  'home team to score': 'matchDetail.outcomeLabels.homeWillScore',
  'away team scores': 'matchDetail.outcomeLabels.awayWillScore',
  'away team to score': 'matchDetail.outcomeLabels.awayWillScore',
  'both teams score yes': 'matchDetail.outcomeLabels.bttsYes',
  'both teams score no': 'matchDetail.outcomeLabels.bttsNo',
  'both teams to score yes': 'matchDetail.outcomeLabels.bttsYes',
  'both teams to score no': 'matchDetail.outcomeLabels.bttsNo',
};

const OVER_PATTERNS = ['ust', 'over'];
const UNDER_PATTERNS = ['alt', 'under'];

const FIRST_HALF_PREFIXES = ['iy', 'ilk yari', 'first half', 'firsthalf', '1st half', '1h'];
const BOTH_TEAMS_PATTERNS = ['both teams score', 'both team score', 'both teams to score', 'both team to score'];

const isFirstHalfLabel = (normalized: string) => {
  const compact = normalized.replace(/\s+/g, '');
  return FIRST_HALF_PREFIXES.some(
    (prefix) => normalized.startsWith(prefix) || compact.startsWith(prefix.replace(/\s+/g, '')),
  );
};

const ODDS_TITLE_MAP: Record<string, string> = {
  'mac sonucu': 'matchDetail.oddsTrendCard.matchResult',
  'mac sonucu 1x2': 'matchDetail.oddsTrendCard.matchResult',
  'mac sonucu 1 0 2': 'matchDetail.oddsTrendCard.matchResult',
  'match result': 'matchDetail.oddsTrendCard.matchResult',
  'match result 1x2': 'matchDetail.oddsTrendCard.matchResult',
  'match result 1 0 2': 'matchDetail.oddsTrendCard.matchResult',
  'avrupa oranlari': 'matchDetail.oddsTrendCard.europeanOdds',
  'asya handikap': 'matchDetail.oddsTrendCard.asianHandicap',
  'alt ust hatlari': 'matchDetail.oddsTrendCard.overUnderLines',
  'ilk yari': 'matchDetail.oddsTrendCard.firstHalf',
  'iy avrupa oranlari': 'matchDetail.oddsTrendCard.firstHalfEuropean',
  'iy asya handikap': 'matchDetail.oddsTrendCard.firstHalfAsian',
  'iy alt ust hatlari': 'matchDetail.oddsTrendCard.firstHalfOverUnder',
  'ilk hat': 'matchDetail.oddsTrendCard.openingLine',
  'mac oncesi hat': 'matchDetail.oddsTrendCard.closingLine',
  'alt ust hatlari ilk yari': 'matchDetail.oddsTrendCard.firstHalfOverUnder',
};

const ODDS_ROW_MAP: Record<string, string> = {
  'ev sahibi': 'matchDetail.outcomeLabels.home',
  'beraberlik': 'matchDetail.outcomeLabels.draw',
  'deplasman': 'matchDetail.outcomeLabels.away',
  'iy ev sahibi': 'matchDetail.outcomeLabels.home',
  'iy beraberlik': 'matchDetail.outcomeLabels.draw',
  'iy deplasman': 'matchDetail.outcomeLabels.away',
  'home win': 'matchDetail.outcomeLabels.home',
  'away win': 'matchDetail.outcomeLabels.away',
  'asla handikap': 'matchDetail.predictionLabels.asianHandicap',
  'asya handikap': 'matchDetail.predictionLabels.asianHandicap',
  'alt ust hatlari': 'matchDetail.predictionLabels.overUnderLines',
  'ilk hat': 'matchDetail.oddsTrendCard.openingLine',
  'mac oncesi hat': 'matchDetail.oddsTrendCard.closingLine',
  'opening line': 'matchDetail.oddsTrendCard.openingLine',
  'closing line': 'matchDetail.oddsTrendCard.closingLine',
};

const UPCOMING_MONTHS_TR: Record<string, number> = {
  ocak: 0,
  oca: 0,
  subat: 1,
  sub: 1,
  mart: 2,
  mar: 2,
  nisan: 3,
  nis: 3,
  mayis: 4,
  may: 4,
  haziran: 5,
  haz: 5,
  temmuz: 6,
  tem: 6,
  agustos: 7,
  agu: 7,
  agus: 7,
  eylul: 8,
  eyl: 8,
  ekim: 9,
  eki: 9,
  kasim: 10,
  kas: 10,
  aralik: 11,
  ara: 11,
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
  enero: 0,
  ene: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  abr: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  ago: 7,
  septiembre: 8,
  setiembre: 8,
  sep: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
  dic: 11,
};

export function localizePredictionTitle(label?: string | null, t?: Translator) {
  if (!label || !t) return label ?? '';
  const normalized = normalize(label);
  if (!normalized) {
    return label;
  }
  const direct = PREDICTION_TITLE_MAP[normalized];
  if (direct) {
    return t(direct);
  }
  // handle combined phrases such as "ily asya handikap"
  if (normalized.includes('ilk yari') && normalized.includes('asiya')) {
    return t('matchDetail.predictionLabels.firstHalfAsianHandicap');
  }
  if (normalized.startsWith('ilk yari alt') || normalized.startsWith('ilk yari ust')) {
    return t('matchDetail.predictionLabels.firstHalfOverUnder');
  }
  return label;
}

export function localizeOutcomeLabel(label?: string | null, t?: Translator) {
  if (!label || !t) return label ?? '';
  const normalized = normalize(label);
  if (!normalized) {
    return label;
  }

  const numericValue = extractNumericValue(label);

  const direct = OUTCOME_LABEL_MAP[normalized];
  if (direct) {
    return t(direct);
  }

  // First half over/under
  if (isFirstHalfLabel(normalized)) {
    if (FIRST_HALF_PREFIXES.some((prefix) => normalized.startsWith(`${prefix} ust`))) {
      return numericValue
        ? t('matchDetail.outcomeLabels.firstHalfOver', { value: numericValue })
        : t('matchDetail.outcomeLabels.over');
    }
    if (FIRST_HALF_PREFIXES.some((prefix) => normalized.startsWith(`${prefix} alt`))) {
      return numericValue
        ? t('matchDetail.outcomeLabels.firstHalfUnder', { value: numericValue })
        : t('matchDetail.outcomeLabels.under');
    }
  }

  // General over/under with value
  if (OVER_PATTERNS.some((pattern) => normalized.startsWith(pattern))) {
    return numericValue
      ? t('matchDetail.outcomeLabels.overWithValue', { value: numericValue })
      : t('matchDetail.outcomeLabels.over');
  }
  if (UNDER_PATTERNS.some((pattern) => normalized.startsWith(pattern))) {
    return numericValue
      ? t('matchDetail.outcomeLabels.underWithValue', { value: numericValue })
      : t('matchDetail.outcomeLabels.under');
  }

  // Both teams to score yes/no variations
  if (
    normalized.includes('kg') ||
    normalized.includes('btts') ||
    BOTH_TEAMS_PATTERNS.some((pattern) => normalized.includes(pattern))
  ) {
    if (normalized.includes('hayir') || normalized.includes('no')) {
      return t('matchDetail.outcomeLabels.bttsNo');
    }
    if (normalized.includes('evet') || normalized.includes('yes')) {
      return t('matchDetail.outcomeLabels.bttsYes');
    }
  }

  return label;
}

export function localizeOddsTitle(label?: string | null, t?: Translator) {
  if (!label || !t) return label ?? '';
  const normalized = normalize(label);
  if (!normalized) return label;
  const key = ODDS_TITLE_MAP[normalized];
  return key ? t(key) : label;
}

export function localizeOddsRowLabel(label?: string | null, t?: Translator) {
  if (!label || !t) return label ?? '';
  const normalized = normalize(label);
  if (!normalized) return label;
  const key =
    ODDS_ROW_MAP[normalized] ||
    OUTCOME_LABEL_MAP[normalized];
  if (key) {
    return t(key);
  }
  const localized = localizeOutcomeLabel(label, t);
  return localized || label;
}

export function formatUpcomingDateText(
  dateText?: string | null,
  locale?: string,
  baseDate?: string,
  timezone?: string,
  timeFormat: TimeFormatPreference = 'auto',
) {
  if (!dateText || !locale) return dateText ?? '';
  const stripped = dateText.replace(/^[^\dA-Za-z]+/, '').trim();
  const match = stripped.match(/(\d{1,2})\s+([A-Za-z\u00C0-\u024F\.]+)\s+(\d{1,2}:\d{2})/);
  if (!match) {
    return dateText;
  }
  const day = Number(match[1]);
  const monthToken = normalize(match[2]);
  const hourMinute = match[3];
  const monthIndex = UPCOMING_MONTHS_TR[monthToken];
  if (monthIndex === undefined) {
    return dateText;
  }
  const base = baseDate ? new Date(baseDate) : new Date();
  let year = base.getFullYear();
  const [hours, minutes] = hourMinute.split(':').map((part) => Number(part));
  let targetDate = new Date(year, monthIndex, day, hours, minutes);
  if (baseDate && targetDate.getTime() + 2 * 24 * 60 * 60 * 1000 < base.getTime()) {
    year += 1;
    targetDate = new Date(year, monthIndex, day, hours, minutes);
  }
  const formatted = formatDateTime(targetDate, locale, timezone, timeFormat, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return formatted ?? targetDate.toLocaleString();
}
