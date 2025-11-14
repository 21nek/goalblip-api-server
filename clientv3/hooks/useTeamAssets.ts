import { useEffect } from 'react';
import { useMatches } from './useMatches';

export function useTeamAssets(matchId?: number | string | null) {
  const { getMatchAssets, getOrFetchMatchAssets } = useMatches();
  const numeric = matchId ? Number(matchId) : null;
  const assets = numeric ? getMatchAssets(numeric) : undefined;

  useEffect(() => {
    if (!numeric || assets) return;
    getOrFetchMatchAssets(numeric).catch(() => null);
  }, [assets, getOrFetchMatchAssets, numeric]);

  return assets;
}

