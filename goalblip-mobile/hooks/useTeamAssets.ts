import { useEffect, useRef } from 'react';
import { useMatches } from './useMatches';

export function useTeamAssets(matchId?: number | string | null) {
  const { getMatchAssets, getOrFetchMatchAssets } = useMatches();
  const numeric = matchId ? Number(matchId) : null;
  const assets = numeric ? getMatchAssets(numeric) : undefined;
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!numeric || assets || requestedRef.current) return;
    
    requestedRef.current = true;
    // Note: No throttling needed - API now uses queue system
    getOrFetchMatchAssets(numeric).catch(() => null);
  }, [assets, getOrFetchMatchAssets, numeric]);

  return assets;
}

