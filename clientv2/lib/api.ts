import { API_BASE_URL } from '@/lib/config'
import type { MatchDetail, MatchListResponse } from '@/types/match'

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const target = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const response = await fetch(target, init)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API error ${response.status}`)
  }
  return (await response.json()) as T
}

export function fetchMatchList(view: 'today' | 'tomorrow' = 'today', init?: RequestInit) {
  const params = new URLSearchParams({ view, locale: 'tr' })
  return fetchJson<MatchListResponse>(`/api/matches?${params.toString()}`, init)
}

export function fetchMatchDetail(matchId: number | string, init?: RequestInit) {
  return fetchJson<MatchDetail>(`/api/match/${matchId}`, init)
}
