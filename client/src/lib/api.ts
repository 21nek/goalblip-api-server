import type { MatchDetail, MatchListResponse } from '../types';
import { API_BASE_URL } from './utils';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMatchList(view: 'today' | 'tomorrow' = 'today'): Promise<MatchListResponse> {
  const url = new URL('/api/matches', API_BASE_URL);
  url.searchParams.set('view', view);
  url.searchParams.set('locale', 'tr');
  return http<MatchListResponse>(url.toString());
}

export async function fetchMatchDetail(matchId: number | string): Promise<MatchDetail> {
  const url = `${API_BASE_URL}/api/match/${matchId}`;
  return http<MatchDetail>(url);
}
