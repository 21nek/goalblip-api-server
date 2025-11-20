import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MatchCard } from '@/components/home/match-card';
import { useTranslation } from '@/hooks/useTranslation';
import { useFavorites } from '@/providers/favorites-provider';
import { useMatches } from '@/hooks/useMatches';
import { colors, spacing } from '@/lib/theme';
import { getContainerPadding } from '@/lib/responsive';

export default function FavoritesScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { favoriteMatchIds, isLoading: favoritesLoading } = useFavorites();
  const { today, tomorrow, refreshMatchList, refreshing } = useMatches();

  // Get all favorite matches from today and tomorrow
  const favoriteMatches = useMemo(() => {
    const matches: typeof today.matches = [];
    
    if (today?.matches) {
      today.matches.forEach((match) => {
        if (favoriteMatchIds.has(match.matchId)) {
          matches.push(match);
        }
      });
    }
    
    if (tomorrow?.matches) {
      tomorrow.matches.forEach((match) => {
        if (favoriteMatchIds.has(match.matchId)) {
          matches.push(match);
        }
      });
    }
    
    // Sort by kickoff time (earliest first)
    return matches.sort((a, b) => {
      const timeA = a.kickoffIsoUtc || a.kickoffTimeDisplay || '';
      const timeB = b.kickoffIsoUtc || b.kickoffTimeDisplay || '';
      return timeA.localeCompare(timeB);
    });
  }, [today?.matches, tomorrow?.matches, favoriteMatchIds]);

  const handleRefresh = async () => {
    await refreshMatchList('today');
    await refreshMatchList('tomorrow');
  };

  const handleMatchPress = (match: typeof favoriteMatches[0]) => {
    const params: { matchId: string; date?: string; view?: string } = {
      matchId: String(match.matchId),
    };
    if (today?.dataDate) params.date = today.dataDate;
    if (today?.view) params.view = today.view;
    router.push({ pathname: '/matches/[matchId]', params });
  };

  const containerPadding = getContainerPadding();
  const styles = getStyles(containerPadding);

  if (favoritesLoading) {
    return (
      <AppShell title={t('favoritesScreen.title')}>
        <View style={styles.container}>
          <EmptyState
            icon="star"
            title={t('favoritesScreen.loading')}
            message=""
          />
        </View>
      </AppShell>
    );
  }

  if (favoriteMatches.length === 0) {
    return (
      <AppShell title={t('favoritesScreen.title')}>
        <View style={styles.container}>
          <EmptyState
            icon="star"
            title={t('favoritesScreen.emptyTitle')}
            message={t('favoritesScreen.emptyMessage')}
          />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title={t('favoritesScreen.title')}>
      <FlatList
        data={favoriteMatches}
        keyExtractor={(item) => String(item.matchId)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => handleMatchPress(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            colors={[colors.accent]}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            title={t('home.refreshing')}
            titleColor={colors.textTertiary}
          />
        }
      />
    </AppShell>
  );
}

const getStyles = (containerPadding: number) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxxl * 2,
  },
  listContent: {
    padding: containerPadding,
    paddingBottom: spacing.xl * 2,
  },
  separator: {
    height: spacing.md,
  },
});
