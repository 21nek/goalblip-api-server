import type { MatchDetail, MatchListResponse } from '@/types/match'

export function aggregateDashboardMetrics(today?: MatchListResponse | null, tomorrow?: MatchListResponse | null) {
  const totalToday = today?.totalMatches ?? 0
  const totalTomorrow = tomorrow?.totalMatches ?? 0
  const combined = (today?.matches || []).concat(tomorrow?.matches || [])
  const leagues = new Set(combined.map((match) => match.league || 'Bilinmiyor'))
  return {
    totalToday,
    totalTomorrow,
    totalLeagues: leagues.size,
    refreshedAgo: today?.scrapedAt ? timeSince(today.scrapedAt) : null,
  }
}

export function computeLeagueStats(list?: MatchListResponse | null) {
  if (!list) return []
  const grouped = list.matches.reduce(
    (acc, match) => {
      const league = match.league || 'Bilinmeyen Lig'
      acc[league] = acc[league] || []
      acc[league].push(match)
      return acc
    },
    {} as Record<string, typeof list.matches>,
  )
  return Object.keys(grouped)
    .map((league) => ({ league, matches: grouped[league] }))
    .sort((a, b) => b.matches.length - a.matches.length)
}

export function extractHighlightPredictions(detail?: MatchDetail | null, limit = 3) {
  if (!detail?.highlightPredictions) return []
  return detail.highlightPredictions.slice(0, limit).map((item) => ({
    title: item.title ?? 'Tahmin',
    pick: item.pickCode ?? '—',
    success: item.successRate ?? null,
    rating: item.rating ?? null,
    ratingMax: item.ratingMax ?? null,
  }))
}

export function findMatchMetadata(matchId: number | string, lists: Array<MatchListResponse | null | undefined>) {
  for (const list of lists) {
    if (!list) continue
    const found = list.matches.find((match) => Number(match.matchId) === Number(matchId))
    if (found) return found
  }
  return null
}

export function timeSince(timestamp: string) {
  const now = Date.now()
  const past = new Date(timestamp).getTime()
  const diffMinutes = Math.max(0, Math.floor((now - past) / (1000 * 60)))
  if (diffMinutes < 1) return 'az önce'
  if (diffMinutes < 60) return `${diffMinutes} dk`
  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} sa`
  return new Date(timestamp).toLocaleDateString('tr-TR')
}
