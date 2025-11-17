export const LIST_CACHE_TTL_MS = Number(process.env.LIST_CACHE_TTL_MS) || 3 * 60 * 60 * 1000; // 3 hours
export const DETAIL_CACHE_TTL_MS =
  Number(process.env.DETAIL_CACHE_TTL_MS) || 3 * 60 * 60 * 1000; // 3 hours

export function isStale(scrapedAt, ttlMs) {
  if (!scrapedAt || !ttlMs) {
    return false;
  }
  const timestamp = Date.parse(scrapedAt);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  return Date.now() - timestamp >= ttlMs;
}

export function expiresAt(scrapedAt, ttlMs) {
  const timestamp = Date.parse(scrapedAt);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp + ttlMs).toISOString();
}
