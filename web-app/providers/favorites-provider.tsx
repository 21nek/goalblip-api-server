'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getItem, setItem } from '@/lib/storage';
import type { MatchSummary } from '@/types/match';

const STORAGE_KEY = '@goalblip:favorites';

type FavoritesContextValue = {
  favoriteMatchIds: Set<number>;
  isFavorite: (matchId: number) => boolean;
  toggleFavorite: (match: MatchSummary) => Promise<void>;
  addFavorite: (match: MatchSummary) => Promise<void>;
  removeFavorite: (matchId: number) => Promise<void>;
  isLoading: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteMatchIds, setFavoriteMatchIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from storage
  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const stored = await getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as number[];
          if (mounted) {
            setFavoriteMatchIds(new Set(parsed));
          }
        }
      } catch (error) {
        console.error('[FavoritesProvider] Failed to load favorites:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  // Save favorites to storage
  const saveFavorites = useCallback(async (ids: Set<number>) => {
    try {
      const array = Array.from(ids);
      await setItem(STORAGE_KEY, JSON.stringify(array));
    } catch (error) {
      console.error('[FavoritesProvider] Failed to save favorites:', error);
    }
  }, []);

  const isFavorite = useCallback(
    (matchId: number) => {
      return favoriteMatchIds.has(matchId);
    },
    [favoriteMatchIds],
  );

  const addFavorite = useCallback(
    async (match: MatchSummary) => {
      const newSet = new Set(favoriteMatchIds);
      newSet.add(match.matchId);
      setFavoriteMatchIds(newSet);
      await saveFavorites(newSet);
    },
    [favoriteMatchIds, saveFavorites],
  );

  const removeFavorite = useCallback(
    async (matchId: number) => {
      const newSet = new Set(favoriteMatchIds);
      newSet.delete(matchId);
      setFavoriteMatchIds(newSet);
      await saveFavorites(newSet);
    },
    [favoriteMatchIds, saveFavorites],
  );

  const toggleFavorite = useCallback(
    async (match: MatchSummary) => {
      if (favoriteMatchIds.has(match.matchId)) {
        await removeFavorite(match.matchId);
      } else {
        await addFavorite(match);
      }
    },
    [favoriteMatchIds, addFavorite, removeFavorite],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteMatchIds,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

