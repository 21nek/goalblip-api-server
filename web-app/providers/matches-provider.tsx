'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMatchDetail, fetchMatchList } from '@/lib/api';
import { useLocale } from './locale-provider';
import { useTranslation } from '@/hooks/useTranslation';
import type { MatchDetail, MatchDetailPendingResponse, MatchListResponse } from '@/types/match';

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
  refreshView: (view: ViewKey, forceRefresh?: boolean) => Promise<MatchListResponse | null>;
  getMatchAssets: (matchId: number | string) => MatchAssets | undefined;
  getOrFetchMatchAssets: (matchId: number | string) => Promise<MatchAssets | null>;
  recordMatchAssets: (detail: MatchDetail | null) => void;
  getMatchDetail: (matchId: number | string, date?: string) => MatchDetail | null | undefined;
  getOrFetchMatchDetail: (matchId: number | string, options?: { date?: string; view?: 'today' | 'tomorrow' | 'manual' }) => Promise<MatchDetail | null>;
  recordMatchDetail: (detail: MatchDetail | null) => void;
  getPendingMatch: (matchId: number | string, date?: string) => MatchDetailPendingResponse | undefined;
};

const MatchesContext = createContext<MatchesContextValue | undefined>(undefined);

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const { locale, timezone } = useLocale();
  const t = useTranslation();

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
  // Cache key format: `${matchId}:${dataDate}` to support multiple dates per match
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetail>>({});
  const [pendingMatches, setPendingMatches] = useState<Record<string, MatchDetailPendingResponse>>({});
  const assetRequests = useRef<Record<number, Promise<MatchAssets | null>>>({});
  // Request key format: `${matchId}:${date || 'latest'}:${view || 'latest'}`
  const detailRequests = useRef<Record<string, Promise<MatchDetail | null>>>({});
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});
  const parseErrorCode = useCallback((error: unknown): string | undefined => {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code?: string }).code;
    }
    if (error instanceof Error) {
      return error.name;
    }
    return undefined;
  }, []);

  const formatErrorMessage = useCallback(
    (error: unknown) => {
      const code = parseErrorCode(error);
      switch (code) {
        case 'REQUEST_TIMEOUT':
          return t('errors.timeout');
        case 'NETWORK_ERROR':
          return t('errors.network');
        case 'API_ERROR':
          return t('errors.api');
        default:
          return t('errors.unknown');
      }
    },
    [parseErrorCode, t],
  );

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
      if (!detail?.matchId || !detail?.dataDate) return;

      // Use matchId:dataDate as key to support multiple dates per match
      const key = `${detail.matchId}:${detail.dataDate}`;

      setMatchDetails((prev) => {
        const current = prev[key];
        if (current) {
          return { ...prev, [key]: { ...current, ...detail } };
        }
        return { ...prev, [key]: detail };
      });

      recordMatchAssets(detail);
    },
    [recordMatchAssets]
  );

  const getMatchDetail = useCallback(
    (matchId: number | string, date?: string) => {
      const numeric = Number(matchId);
      if (!numeric) return undefined;

      // If date is provided, use exact match
      if (date) {
        const key = `${numeric}:${date}`;
        return matchDetails[key];
      }

      // Otherwise, find the most recent detail for this matchId
      const keys = Object.keys(matchDetails).filter((k) => k.startsWith(`${numeric}:`));
      if (keys.length === 0) return undefined;

      // Sort by date (most recent first) and return the first one
      const sorted = keys.sort((a, b) => {
        const dateA = a.split(':')[1];
        const dateB = b.split(':')[1];
        return dateB.localeCompare(dateA);
      });

      return matchDetails[sorted[0]];
    },
    [matchDetails]
  );

  const getPendingMatch = useCallback(
    (matchId: number | string, date?: string) => {
      const numeric = Number(matchId);
      if (!numeric) return undefined;

      // If date is provided, use exact match
      if (date) {
        const key = `${numeric}:${date}`;
        return pendingMatches[key];
      }

      // Otherwise, find any pending match for this matchId
      const keys = Object.keys(pendingMatches).filter((k) => k.startsWith(`${numeric}:`));
      if (keys.length === 0) return undefined;

      return pendingMatches[keys[0]];
    },
    [pendingMatches]
  );

  const getOrFetchMatchDetail = useCallback(
    async (matchId: number | string, options?: { date?: string; view?: 'today' | 'tomorrow' | 'manual' }) => {
      const numeric = Number(matchId);
      if (!numeric || isNaN(numeric)) {
        console.warn('[MatchesProvider] Invalid matchId:', matchId);
        return null;
      }

      // Check cache first
      const cached = getMatchDetail(numeric, options?.date);
      if (cached) {
        console.log('[MatchesProvider] Using cached detail for:', numeric, options?.date ? `date:${options.date}` : '');
        return cached;
      }

      // Create request key to prevent duplicate requests
      const requestKey = `${numeric}:${options?.date || 'latest'}:${options?.view || 'latest'}:${locale}:${timezone}`;

      if (!detailRequests.current[requestKey]) {
        console.log('[MatchesProvider] Fetching detail for:', numeric, options);
        detailRequests.current[requestKey] = fetchMatchDetail(numeric, undefined, {
          ...options,
          locale,
          timezone,
        })
          .then((response) => {
            // Check if response is pending or processing
            if ('status' in response && (response.status === 'pending' || response.status === 'processing')) {
              const pending = response as MatchDetailPendingResponse;
              // Use requested date or 'latest' for pending key
              const pendingKey = options?.date ? `${numeric}:${options.date}` : `${numeric}:latest`;
              console.log('[MatchesProvider] Detail pending in queue:', numeric, 'position:', pending.queuePosition);
              setPendingMatches((prev) => ({ ...prev, [pendingKey]: pending }));

              // Start polling if not already polling
              if (!pollingIntervals.current[pendingKey]) {
                const pollInterval = 45000; // 45 seconds
                console.log('[MatchesProvider] Starting poll for:', numeric);
                pollingIntervals.current[pendingKey] = setInterval(() => {
                  // Re-fetch after interval with same options
                  delete detailRequests.current[requestKey];
                  getOrFetchMatchDetail(numeric, options).catch(() => null);
                }, pollInterval);
              }

              return null; // Return null for pending, UI will show pending state
            }

            // Normal detail response
            const detail = response as MatchDetail;
            console.log('[MatchesProvider] Detail fetched successfully:', numeric, 'date:', detail.dataDate);

            // Clear pending state and polling if exists
            const pendingKey = detail.dataDate ? `${numeric}:${detail.dataDate}` : `${numeric}:latest`;
            setPendingMatches((prev) => {
              const next = { ...prev };
              delete next[pendingKey];
              return next;
            });
            if (pollingIntervals.current[pendingKey]) {
              clearInterval(pollingIntervals.current[pendingKey]);
              delete pollingIntervals.current[pendingKey];
            }

            recordMatchDetail(detail);
            return detail;
          })
          .catch((error) => {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('[MatchesProvider] Detail fetch failed:', numeric, errorMsg);

            // Clear polling on error
            const pendingKey = options?.date ? `${numeric}:${options.date}` : `${numeric}:latest`;
            if (pollingIntervals.current[pendingKey]) {
              clearInterval(pollingIntervals.current[pendingKey]);
              delete pollingIntervals.current[pendingKey];
            }

            return null;
          })
          .finally(() => {
            delete detailRequests.current[requestKey];
          });
      }

      return detailRequests.current[requestKey];
    },
    [getMatchDetail, recordMatchDetail, locale, timezone]
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
              if ('status' in fetched && (fetched.status === 'pending' || fetched.status === 'processing')) {
                return null;
              }
              const detail = fetched as MatchDetail;
              recordMatchDetail(detail);
              return deriveAssetsFromDetail(detail);
            })
            .catch((error) => {
              const code = parseErrorCode(error);
              const errorMsg = formatErrorMessage(error);
              if (code !== 'REQUEST_TIMEOUT') {
                console.warn('[MatchesProvider] Match asset fetch failed', numeric, error);
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
    [
      matchAssets,
      matchDetails,
      recordMatchAssets,
      recordMatchDetail,
      deriveAssetsFromDetail,
      formatErrorMessage,
      parseErrorCode,
    ]
  );

  const requestView = useCallback(async (view: ViewKey, forceRefresh = false) => {
    controllersRef.current[view]?.abort();
    const controller = new AbortController();
    controllersRef.current[view] = controller;

    setViewStatus((prev) => ({ ...prev, [view]: 'loading' }));

    try {
      console.log(`[MatchesProvider] Requesting view: ${view}`, { locale, timezone, forceRefresh });
      const response = await fetchMatchList(
        view,
        { signal: controller.signal },
        { locale, timezone, refresh: forceRefresh }
      );
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
      const errorMessage = formatErrorMessage(error);
      console.error(`[MatchesProvider] Error loading view ${view}:`, errorMessage);
      setErrors((prev) => ({
        ...prev,
        [view]: errorMessage,
      }));
      setViewStatus((prev) => ({ ...prev, [view]: 'error' }));
      return null;
    }
  }, [locale, timezone, formatErrorMessage]);

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      setInitialLoading(true);
      // Öncelik: bugün görünümü. Yarın görünümü arka planda yüklenecek.
      await requestView('today');
      if (mounted) {
        setInitialLoading(false);
        // Fire-and-forget: tomorrow view; hata alsa bile today etkilenmez.
        requestView('tomorrow');
      }
    }

    loadInitial();

    return () => {
      mounted = false;
      Object.values(controllersRef.current).forEach((controller) => controller?.abort());
      // Cleanup polling intervals
      Object.values(pollingIntervals.current).forEach((interval) => clearInterval(interval));
      pollingIntervals.current = {};
    };
  }, [requestView, locale, timezone]); // Re-fetch when locale/timezone changes

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
      getPendingMatch,
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
      getPendingMatch,
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
