import { useMemo } from 'react';
import { useMatchesContext } from '@/providers/matches-provider';
import type { MatchListResponse } from '@/types/match';

type ViewKey = 'today' | 'tomorrow';

export function useMatches() {
  const {
    today,
    tomorrow,
    initialLoading,
    viewStatus,
    errors,
    refreshView,
    getMatchAssets,
    getOrFetchMatchAssets,
    recordMatchAssets,
    getMatchDetail,
    getOrFetchMatchDetail,
    recordMatchDetail,
    getPendingMatch,
  } = useMatchesContext();

  const dataByView: Record<ViewKey, MatchListResponse | null> = useMemo(
    () => ({
      today,
      tomorrow,
    }),
    [today, tomorrow]
  );

  return {
    today,
    tomorrow,
    initialLoading,
    viewStatus,
    errors,
    refreshView,
    getMatchAssets,
    getOrFetchMatchAssets,
    recordMatchAssets,
    getMatchDetail,
    getOrFetchMatchDetail,
    recordMatchDetail,
    getPendingMatch,
    getViewData: (view: ViewKey) => dataByView[view],
  };
}

