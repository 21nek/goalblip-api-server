import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMatchDetail, fetchMatchList } from '@/lib/api';
import type { MatchDetail, MatchListResponse } from '@/types/match';

type ViewKey = 'today' | 'tomorrow';

type MatchAssets = {
  homeLogo?: string | null;
  awayLogo?: string | null;
  homeName?: string | null;
  awayName?: string | null;
};

type MatchesContextValue = {
  today: MatchListResponse | null;
  tomorrow: MatchListResponse | null;
  initialLoading: boolean;
  viewStatus: Record<ViewKey, 'idle' | 'loading' | 'error'>;
  errors: Partial<Record<ViewKey, string | null>>;
  refreshView: (view: ViewKey) => Promise<MatchListResponse | null>;
  getMatchAssets: (matchId: number | string) => MatchAssets | undefined;
  getOrFetchMatchAssets: (matchId: number | string) => Promise<MatchAssets | null>;
  recordMatchAssets: (detail: MatchDetail | null) => void;
  getMatchDetail: (matchId: number | string) => MatchDetail | null | undefined;
  getOrFetchMatchDetail: (matchId: number | string) => Promise<MatchDetail | null>;
  recordMatchDetail: (detail: MatchDetail | null) => void;
};

const MatchesContext = createContext<MatchesContextValue | undefined>(undefined);

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{
    today: MatchListResponse | null;
    tomorrow: MatchListResponse | null;
  }>({
    today: null,
    tomorrow: null,
  });
  
  const [viewStatus, setViewStatus] = useState<Record<ViewKey, 'idle' | 'loading' | 'error'>>({
    today: 'idle',
    tomorrow: 'idle',
  });
  
  const [errors, setErrors] = useState<Partial<Record<ViewKey, string | null>>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const controllersRef = useRef<Partial<Record<ViewKey, AbortController>>>({});
  const [matchAssets, setMatchAssets] = useState<Record<number, MatchAssets>>({});
  const [matchDetails, setMatchDetails] = useState<Record<number, MatchDetail>>({});
  const assetRequests = useRef<Record<number, Promise<MatchAssets | null>>>({});
  const detailRequests = useRef<Record<number, Promise<MatchDetail | null>>>({});

  const deriveAssetsFromDetail = useCallback((detail: MatchDetail | null): MatchAssets | null => {
    const scoreboard = detail?.scoreboard;
    if (!detail?.matchId || !scoreboard) return null;
    
    return {
      homeLogo: scoreboard.homeTeam?.logo ?? null,
      homeName: scoreboard.homeTeam?.name ?? detail.matchId.toString(),
      awayLogo: scoreboard.awayTeam?.logo ?? null,
      awayName: scoreboard.awayTeam?.name ?? detail.matchId.toString(),
    };
  }, []);

  const recordMatchAssets = useCallback(
    (detail: MatchDetail | null) => {
      const assets = deriveAssetsFromDetail(detail);
      if (!detail?.matchId || !assets) return;
      
      const matchId = detail.matchId;
      setMatchAssets((prev) => {
        const current = prev[matchId] ?? {};
        const nextEntry: MatchAssets = {
          homeLogo: assets.homeLogo ?? current.homeLogo,
          homeName: assets.homeName ?? current.homeName,
          awayLogo: assets.awayLogo ?? current.awayLogo,
          awayName: assets.awayName ?? current.awayName,
        };
        
        const changed =
          nextEntry.homeLogo !== current.homeLogo ||
          nextEntry.awayLogo !== current.awayLogo ||
          nextEntry.homeName !== current.homeName ||
          nextEntry.awayName !== current.awayName;
        
        if (!changed) return prev;
        return { ...prev, [matchId]: nextEntry };
      });
    },
    [deriveAssetsFromDetail]
  );

  const getMatchAssets = useCallback(
    (matchId: number | string) => {
      const numeric = Number(matchId);
      if (!numeric) return undefined;
      return matchAssets[numeric];
    },
    [matchAssets]
  );

  const recordMatchDetail = useCallback(
    (detail: MatchDetail | null) => {
      if (!detail?.matchId) return;
      
      setMatchDetails((prev) => {
        const current = prev[detail.matchId];
        if (current) {
          return { ...prev, [detail.matchId]: { ...current, ...detail } };
        }
        return { ...prev, [detail.matchId]: detail };
      });
      
      recordMatchAssets(detail);
    },
    [recordMatchAssets]
  );

  const getMatchDetail = useCallback(
    (matchId: number | string) => {
      const numeric = Number(matchId);
      if (!numeric) return undefined;
      return matchDetails[numeric];
    },
    [matchDetails]
  );

  const getOrFetchMatchDetail = useCallback(
    async (matchId: number | string) => {
      const numeric = Number(matchId);
      if (!numeric || isNaN(numeric)) {
        console.warn('[MatchesProvider] Invalid matchId:', matchId);
        return null;
      }
      
      if (matchDetails[numeric]) {
        console.log('[MatchesProvider] Using cached detail for:', numeric);
        return matchDetails[numeric];
      }
      
      if (!detailRequests.current[numeric]) {
        console.log('[MatchesProvider] Fetching detail for:', numeric);
        detailRequests.current[numeric] = fetchMatchDetail(numeric)
          .then((detail) => {
            console.log('[MatchesProvider] Detail fetched successfully:', numeric);
            recordMatchDetail(detail);
            return detail;
          })
          .catch((error) => {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('[MatchesProvider] Detail fetch failed:', numeric, errorMsg);
            
            // Timeout hatası ise, kullanıcıya bilgi ver ama null döndürme (retry için)
            if (errorMsg.includes('zaman aşımı')) {
              console.warn('[MatchesProvider] Timeout for match detail, will retry on next access:', numeric);
            }
            
            return null;
          })
          .finally(() => {
            delete detailRequests.current[numeric];
          });
      }
      
      return detailRequests.current[numeric];
    },
    [matchDetails, recordMatchDetail]
  );

  const getOrFetchMatchAssets = useCallback(
    async (matchId: number | string) => {
      const numeric = Number(matchId);
      if (!numeric) return null;
      
      if (matchAssets[numeric]) {
        return matchAssets[numeric];
      }
      
      const detail = matchDetails[numeric];
      if (detail) {
        recordMatchAssets(detail);
        return matchAssets[numeric] ?? deriveAssetsFromDetail(detail);
      }
      
      if (!assetRequests.current[numeric]) {
        // Eğer detail request zaten varsa, onu bekle
        if (detailRequests.current[numeric]) {
          assetRequests.current[numeric] = detailRequests.current[numeric]
            .then((detail) => {
              if (detail) {
                recordMatchDetail(detail);
                return deriveAssetsFromDetail(detail);
              }
              return null;
            })
            .catch(() => null)
            .finally(() => {
              delete assetRequests.current[numeric];
            });
        } else {
          assetRequests.current[numeric] = fetchMatchDetail(numeric)
            .then((fetched) => {
              recordMatchDetail(fetched);
              return deriveAssetsFromDetail(fetched);
            })
            .catch((error) => {
              const errorMsg = error instanceof Error ? error.message : String(error);
              // Timeout hatası için daha az agresif log
              if (!errorMsg.includes('zaman aşımı')) {
                console.warn('[MatchesProvider] Match asset fetch failed', numeric, errorMsg);
              }
              return null;
            })
            .finally(() => {
              delete assetRequests.current[numeric];
            });
        }
      }
      
      return assetRequests.current[numeric];
    },
    [matchAssets, matchDetails, recordMatchAssets, recordMatchDetail, deriveAssetsFromDetail]
  );

  const requestView = useCallback(async (view: ViewKey) => {
    controllersRef.current[view]?.abort();
    const controller = new AbortController();
    controllersRef.current[view] = controller;
    
    setViewStatus((prev) => ({ ...prev, [view]: 'loading' }));
    
    try {
      console.log(`[MatchesProvider] Requesting view: ${view}`);
      const response = await fetchMatchList(view, { signal: controller.signal });
      console.log(`[MatchesProvider] View ${view} loaded:`, response?.matches?.length || 0, 'matches');
      setData((prev) => ({ ...prev, [view]: response }));
      setErrors((prev) => ({ ...prev, [view]: null }));
      setViewStatus((prev) => ({ ...prev, [view]: 'idle' }));
      return response;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log(`[MatchesProvider] Request aborted for view: ${view}`);
        return null;
      }
      const errorMessage = (error as Error).message || 'Beklenmeyen hata';
      console.error(`[MatchesProvider] Error loading view ${view}:`, errorMessage);
      setErrors((prev) => ({
        ...prev,
        [view]: errorMessage,
      }));
      setViewStatus((prev) => ({ ...prev, [view]: 'error' }));
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    async function loadInitial() {
      setInitialLoading(true);
      await Promise.all([requestView('today'), requestView('tomorrow')]);
      if (mounted) {
        setInitialLoading(false);
      }
    }
    
    loadInitial();
    
    return () => {
      mounted = false;
      Object.values(controllersRef.current).forEach((controller) => controller?.abort());
    };
  }, [requestView]);

  const value = useMemo<MatchesContextValue>(
    () => ({
      today: data.today,
      tomorrow: data.tomorrow,
      initialLoading,
      viewStatus,
      errors,
      refreshView: requestView,
      getMatchAssets,
      getOrFetchMatchAssets,
      recordMatchAssets,
      getMatchDetail,
      getOrFetchMatchDetail,
      recordMatchDetail,
    }),
    [
      data.today,
      data.tomorrow,
      initialLoading,
      viewStatus,
      errors,
      requestView,
      getMatchAssets,
      getOrFetchMatchAssets,
      recordMatchAssets,
      getMatchDetail,
      getOrFetchMatchDetail,
      recordMatchDetail,
    ]
  );

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
}

export function useMatchesContext() {
  const ctx = useContext(MatchesContext);
  if (!ctx) {
    throw new Error('useMatchesContext must be used within MatchesProvider');
  }
  return ctx;
}

