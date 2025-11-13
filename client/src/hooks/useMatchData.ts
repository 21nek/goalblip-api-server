import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMatchDetail, fetchMatchList } from '../lib/api';
import type { MatchDetail, MatchListResponse, MatchSummary } from '../types';

export function useMatchList(view: 'today' | 'tomorrow') {
  const [data, setData] = useState<MatchListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMatchList(view);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    load();
  }, [load]);

  const leagues = useMemo(() => {
    if (!data) return [] as Array<{ name: string; matches: MatchSummary[] }>;
    const grouped = data.matches.reduce<Record<string, MatchSummary[]>>((acc, match) => {
      const key = match.league || 'Lig Bilinmiyor';
      acc[key] = acc[key] || [];
      acc[key].push(match);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, matches]) => ({ name, matches }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return {
    data,
    leagues,
    loading,
    error,
    refresh: load,
  };
}

export function useMatchDetail(matchId: number | null) {
  const [data, setData] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchMatchDetail(matchId);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  return { data, loading, error };
}
