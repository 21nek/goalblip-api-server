type StatusKey =
  | 'live'
  | 'scheduled'
  | 'finished'
  | 'postponed'
  | 'canceled'
  | 'abandoned'
  | 'delayed'
  | 'halftime'
  | 'extraTime'
  | 'penalties';

export const STATUS_TRANSLATION_KEYS: Record<StatusKey, string> = {
  live: 'match.statusLabels.live',
  scheduled: 'match.statusLabels.scheduled',
  finished: 'match.statusLabels.finished',
  postponed: 'match.statusLabels.postponed',
  canceled: 'match.statusLabels.canceled',
  abandoned: 'match.statusLabels.abandoned',
  delayed: 'match.statusLabels.delayed',
  halftime: 'match.statusLabels.halftime',
  extraTime: 'match.statusLabels.extraTime',
  penalties: 'match.statusLabels.penalties',
};

const STATUS_SYNONYMS: Record<string, StatusKey> = {
  // Live / in-progress states
  live: 'live',
  'in play': 'live',
  ongoing: 'live',
  canli: 'live',
  'devam ediyor': 'live',
  oynaniyor: 'live',
  'ikinci yari': 'live',
  'second half': 'live',
  'ilk yari': 'live',
  'first half': 'live',
  '1st half': 'live',
  '2nd half': 'live',
  'st half': 'live',
  '2nd': 'live',
  // Scheduled / upcoming
  hazirlik: 'scheduled',
  'hazirlik maci': 'scheduled',
  'mac oncesi': 'scheduled',
  baslamadi: 'scheduled',
  'not started': 'scheduled',
  upcoming: 'scheduled',
  scheduled: 'scheduled',
  'pre match': 'scheduled',
  programado: 'scheduled',
  'starting soon': 'scheduled',
  // Finished
  'mac bitti': 'finished',
  'mac sonu': 'finished',
  bitti: 'finished',
  tamamlandi: 'finished',
  finished: 'finished',
  'full time': 'finished',
  finalizado: 'finished',
  completado: 'finished',
  ft: 'finished',
  // Postponed
  ertelendi: 'postponed',
  postponed: 'postponed',
  pospuesto: 'postponed',
  // Canceled
  iptal: 'canceled',
  cancelled: 'canceled',
  canceled: 'canceled',
  cancelado: 'canceled',
  // Abandoned / suspended
  'yarim kaldi': 'abandoned',
  abandoned: 'abandoned',
  abandonned: 'abandoned',
  suspended: 'abandoned',
  suspendido: 'abandoned',
  // Delayed
  gecikmeli: 'delayed',
  delayed: 'delayed',
  retrasado: 'delayed',
  // Half-time
  'devre arasi': 'halftime',
  halftime: 'halftime',
  descanso: 'halftime',
  ht: 'halftime',
  // Extra time
  uzatmalar: 'extraTime',
  prorroga: 'extraTime',
  'extra time': 'extraTime',
  et: 'extraTime',
  // Penalties
  penaltilar: 'penalties',
  penalti: 'penalties',
  penales: 'penalties',
  penalties: 'penalties',
  pen: 'penalties',
};

function normalizeLabel(label?: string | null): string | null {
  if (!label) return null;
  const ascii = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a');
  const cleaned = ascii
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || null;
}

export function getStatusKey(label?: string | null): StatusKey | null {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;
  return STATUS_SYNONYMS[normalized] ?? null;
}

export function isLiveStatus(label?: string | null): boolean {
  const statusKey = getStatusKey(label);
  if (!statusKey) return false;
  return statusKey === 'live' || statusKey === 'halftime' || statusKey === 'extraTime';
}
