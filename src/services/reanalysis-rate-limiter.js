const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const MIN_INTERVAL_MS = Number(process.env.REANALYSIS_MIN_INTERVAL_MS) || FIFTEEN_MINUTES_MS;

const lastRequestsByMatch = new Map();

function keyForMatch(matchId) {
  return String(matchId ?? '').trim();
}

function getLastRequestAt(matchId) {
  const key = keyForMatch(matchId);
  return lastRequestsByMatch.get(key) ?? 0;
}

export function canTriggerReanalysis(matchId, now = Date.now()) {
  const lastRequestAt = getLastRequestAt(matchId);
  const nextAllowedAt = lastRequestAt + MIN_INTERVAL_MS;
  const remainingMs = Math.max(0, nextAllowedAt - now);
  return {
    allowed: remainingMs <= 0,
    remainingMs,
    nextAllowedAt,
  };
}

export function registerReanalysisRequest(matchId, now = Date.now()) {
  const key = keyForMatch(matchId);
  lastRequestsByMatch.set(key, now);
}

export function getReanalysisLimitInfo(matchId, now = Date.now()) {
  const lastRequestAt = getLastRequestAt(matchId);
  const nextAllowedAt = lastRequestAt + MIN_INTERVAL_MS;
  return {
    lastRequestAt,
    nextAllowedAt,
    remainingMs: Math.max(0, nextAllowedAt - now),
    intervalMs: MIN_INTERVAL_MS,
  };
}

export function getReanalysisIntervalMs() {
  return MIN_INTERVAL_MS;
}
