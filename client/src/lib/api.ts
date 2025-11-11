import type {
  MatchDetailResponse,
  MatchListResponse,
  MatchView,
} from '@/types/golsinyali';

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:4000';

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, {
      next: { revalidate: 60 },
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn('[client] API isteği başarısız:', error);
    return null;
  }
}

export async function fetchMatchList(view: MatchView): Promise<MatchListResponse | null> {
  const url = `${DEFAULT_API_BASE}/api/matches?view=${view}`;
  return safeFetch<MatchListResponse>(url);
}

export async function fetchMatchDetail(matchId: number): Promise<MatchDetailResponse | null> {
  const url = `${DEFAULT_API_BASE}/api/match/${matchId}`;
  return safeFetch<MatchDetailResponse>(url);
}

export function getApiBaseUrl() {
  return DEFAULT_API_BASE;
}
