import { useRouter } from 'expo-router';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ViewToken,
  Animated,
} from 'react-native';
import { getContainerPadding } from '@/lib/responsive';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { MatchCard } from '@/components/home/match-card';
import { LeagueHeader } from '@/components/home/league-header';
import { FilterSection } from '@/components/home/filter-section';
import { FilterSortModal, type SortOption, type ViewOption } from '@/components/home/filter-sort-modal';
import { LeagueSelectionModal } from '@/components/home/league-selection-modal';
import { useMatches } from '@/hooks/useMatches';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocale } from '@/providers/locale-provider';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import type { MatchSummary } from '@/types/match';

const ALL_LEAGUES = 'ALL';
const UNKNOWN_LEAGUE_KEY = '__unknown__';

type ListItem =
  | { type: 'league'; key: string; label: string }
  | { type: 'match'; match: MatchSummary };

export default function HomeScreen() {
  const router = useRouter();
  const t = useTranslation();
  const { locale } = useLocale();
  const { today, tomorrow, initialLoading, getMatchDetail, getOrFetchMatchDetail, errors, refreshView } = useMatches();
  const [view, setView] = useState<'today' | 'tomorrow'>('today');
  const [search, setSearch] = useState('');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('league');
  const [viewOption, setViewOption] = useState<ViewOption>('grouped');
  const [itemsToShow, setItemsToShow] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const supportsNativeDriver = Platform.OS !== 'web';

  const current = view === 'today' ? today : tomorrow;
  const loading = initialLoading && !current;
  const error = errors[view];
  // Compute league stats
  const unknownLeagueLabel = t('common.unknownLeague');
  const leagueCounts = useMemo(() => {
    const base = current?.matches ?? [];
    const map = base.reduce<Record<string, { key: string; name: string; total: number }>>(
      (acc, match) => {
        const key = match.league || UNKNOWN_LEAGUE_KEY;
        const name = match.league || unknownLeagueLabel;
        acc[key] = acc[key] || { key, name, total: 0 };
        acc[key].total += 1;
        return acc;
      },
      {},
    );
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [current?.matches, unknownLeagueLabel]);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    if (!current?.matches) return [];

    let matches = current.matches;

    // Date filter: For "today" view, filter out all matches if dataDate is from previous days
    if (view === 'today' && current.dataDate) {
      const now = new Date();
      const dataDate = new Date(current.dataDate);

      // Reset hours to compare just the dates
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dataDateStart = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate());

      // If dataDate is strictly older than today
      if (dataDateStart < todayStart) {
        console.warn('[HomeScreen] Filtering out stale data:', {
          dataDate: current.dataDate,
          today: todayStart.toISOString().split('T')[0],
          view,
        });
        matches = [];

        // Trigger auto-refresh
        if (!refreshing) {
          console.log('[HomeScreen] Auto-refreshing stale data...');
          setTimeout(() => {
            refreshView('today', true).catch(err => console.error('Auto-refresh failed', err));
          }, 0);
        }
      }
    }

    // League filter
    if (selectedLeagues.length > 0) {
      matches = matches.filter((match) =>
        selectedLeagues.includes(match.league || UNKNOWN_LEAGUE_KEY),
      );
    }

    // Search filter
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      matches = matches.filter((match) =>
        `${match.homeTeam} ${match.awayTeam} ${match.league}`.toLowerCase().includes(term)
      );
    }

    // Sort matches based on sortOption
    matches = [...matches].sort((a, b) => {
      switch (sortOption) {
        case 'time': {
          const timeA = a.kickoffIsoUtc ? new Date(a.kickoffIsoUtc).getTime() : 0;
          const timeB = b.kickoffIsoUtc ? new Date(b.kickoffIsoUtc).getTime() : 0;
          return timeA - timeB;
        }
        case 'date': {
          const dateA = a.kickoffIsoUtc ? new Date(a.kickoffIsoUtc) : new Date(0);
          const dateB = b.kickoffIsoUtc ? new Date(b.kickoffIsoUtc) : new Date(0);
          const dateDiff = dateA.getTime() - dateB.getTime();
          if (dateDiff !== 0) return dateDiff;
          return dateA.getTime() - dateB.getTime();
        }
        case 'team': {
          const nameA = (a.homeTeam || '').toLowerCase();
          const nameB = (b.homeTeam || '').toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case 'league':
        default: {
          const leagueA = (a.league || unknownLeagueLabel).toLowerCase();
          const leagueB = (b.league || unknownLeagueLabel).toLowerCase();
          const leagueDiff = leagueA.localeCompare(leagueB);
          if (leagueDiff !== 0) return leagueDiff;
          const timeA = a.kickoffIsoUtc ? new Date(a.kickoffIsoUtc).getTime() : 0;
          const timeB = b.kickoffIsoUtc ? new Date(b.kickoffIsoUtc).getTime() : 0;
          return timeA - timeB;
        }
      }
    });

    return matches;
  }, [current?.matches, current?.dataDate, view, selectedLeagues, search, sortOption, unknownLeagueLabel, refreshing, refreshView]);

  // Group matches by league (only if viewOption is 'grouped')
  const groupedMatches = useMemo(() => {
    if (viewOption === 'flat') return {};

    const grouped: Record<string, { label: string; matches: MatchSummary[] }> = {};
    filteredMatches.forEach((match) => {
      const key = match.league || UNKNOWN_LEAGUE_KEY;
      const label = match.league || unknownLeagueLabel;
      if (!grouped[key]) {
        grouped[key] = { label, matches: [] };
      }
      grouped[key].matches.push(match);
    });
    return grouped;
  }, [filteredMatches, unknownLeagueLabel, viewOption]);

  // Create list items (league headers + matches or flat list)
  const allListItems = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    if (viewOption === 'flat') {
      // Flat list - no league headers
      filteredMatches.forEach((match) => {
        items.push({ type: 'match', match });
      });
    } else {
      // Grouped by league
      const leagues = Object.keys(groupedMatches).sort((a, b) =>
        groupedMatches[a].label.localeCompare(groupedMatches[b].label),
      );

      leagues.forEach((key) => {
        const entry = groupedMatches[key];
        items.push({ type: 'league', key, label: entry.label });
        entry.matches.forEach((match) => {
          items.push({ type: 'match', match });
        });
      });
    }

    return items;
  }, [groupedMatches, filteredMatches, viewOption]);

  // Paginated list items
  const listItems = useMemo(() => {
    return allListItems.slice(0, itemsToShow);
  }, [allListItems, itemsToShow]);

  // Reset pagination when filters/sort/view changes
  useEffect(() => {
    setItemsToShow(20);
  }, [search, selectedLeagues, sortOption, viewOption, view]);

  // Get active filters count
  const activeFiltersCount = selectedLeagues.length;

  // Toggle league filter
  const toggleLeague = useCallback((league: string) => {
    if (league === ALL_LEAGUES) {
      setSelectedLeagues([]);
      return;
    }
    setSelectedLeagues((prev) => {
      if (prev.includes(league)) {
        return prev.filter((l) => l !== league);
      }
      if (prev.length >= 3) {
        const [, ...rest] = prev;
        return [...rest, league];
      }
      return [...prev, league];
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedLeagues([]);
    setSearch('');
  }, []);

  // Handle league modal
  const handleOpenLeagueModal = useCallback(() => {
    setLeagueModalVisible(true);
  }, []);

  const handleCloseLeagueModal = useCallback(() => {
    setLeagueModalVisible(false);
  }, []);

  // Handle filter sort modal
  const handleOpenFilterSortModal = useCallback(() => {
    setFilterModalVisible(true);
  }, []);

  const handleCloseFilterSortModal = useCallback(() => {
    setFilterModalVisible(false);
  }, []);

  const handleSelectAllLeagues = useCallback(() => {
    setSelectedLeagues([]);
  }, []);

  // Load more items
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || itemsToShow >= allListItems.length) {
      return;
    }

    setIsLoadingMore(true);

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: supportsNativeDriver,
    }).start(() => {
      // Load more items
      setItemsToShow((prev) => Math.min(prev + 20, allListItems.length));

      // Fade in animation after a short delay
      setTimeout(() => {
        setIsLoadingMore(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: supportsNativeDriver,
        }).start();
      }, 100);
    });
  }, [isLoadingMore, itemsToShow, allListItems.length, fadeAnim, supportsNativeDriver]);

  // Check if there are more items to load
  const hasMore = itemsToShow < allListItems.length;

  // Prefetch details for visible matches - when user sees a match, start loading its detail
  const prefetchedIds = useRef<Set<string>>(new Set()); // Key format: `${matchId}:${date}`

  // Store latest values in refs to avoid recreating callback
  const listItemsRef = useRef(listItems);
  const currentRef = useRef(current);
  const getMatchDetailRef = useRef(getMatchDetail);
  const getOrFetchMatchDetailRef = useRef(getOrFetchMatchDetail);

  // Update refs when values change
  useEffect(() => {
    listItemsRef.current = listItems;
    currentRef.current = current;
    getMatchDetailRef.current = getMatchDetail;
    getOrFetchMatchDetailRef.current = getOrFetchMatchDetail;
  }, [listItems, current, getMatchDetail, getOrFetchMatchDetail]);

  // Stable callback that doesn't change between renders - only prefetch visible matches
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Only prefetch details for currently visible matches
      const listData = currentRef.current;
      if (!listData) return;

      viewableItems.forEach((item) => {
        if (item.item.type === 'match') {
          const matchId = item.item.match.matchId;
          const date = listData.dataDate;
          const view = listData.view;
          const prefetchKey = `${matchId}:${date}`;

          // Only fetch if not already prefetched and not already cached
          if (!prefetchedIds.current.has(prefetchKey) && !getMatchDetailRef.current(matchId, date)) {
            prefetchedIds.current.add(prefetchKey);
            // Fire and forget - queue will handle it
            // Pass date and view context for proper API routing
            getOrFetchMatchDetailRef.current(matchId, { date, view }).catch(() => {
              // Silently fail
            });
          }
        }
      });
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  });

  // Format meta info
  const metaInfo = useMemo(() => {
    if (!current) return null;
    const date = new Date(current.dataDate);
    const time = current.scrapedAt ? new Date(current.scrapedAt).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }) : null;
    return `${date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}${time ? ` • ${time}` : ''
      }`;
  }, [current, locale]);


  // Render list item
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'league') {
      return <LeagueHeader league={item.label} />;
    }

    const match = item.match;
    // Get detail for current list's date
    const detail = current?.dataDate ? getMatchDetail(match.matchId, current.dataDate) : getMatchDetail(match.matchId);

    return (
      <MatchCard
        match={match}
        detail={detail}
        onPress={() => {
          // Navigate with date and view context
          const params: { matchId: string; date?: string; view?: string } = { matchId: String(match.matchId) };
          if (current?.dataDate) params.date = current.dataDate;
          if (current?.view) params.view = current.view;
          router.push({ pathname: '/matches/[matchId]', params });
        }}
      />
    );
  }, [getMatchDetail, router, current]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshView(view);
    setRefreshing(false);
  }, [refreshView, view]);


  // List header component (tabs, meta info, filters) - MUST be before early returns
  const listHeader = useMemo(() => (
    <View>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, view === 'today' && styles.tabActive]}
          onPress={() => setView('today')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, view === 'today' && styles.tabTextActive]}>
            {t('home.today')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'tomorrow' && styles.tabActive]}
          onPress={() => setView('tomorrow')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, view === 'tomorrow' && styles.tabTextActive]}>
            {t('home.tomorrow')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Meta Info */}
      {metaInfo && (
        <Text style={styles.metaInfo} numberOfLines={1} ellipsizeMode="tail">
          {metaInfo}
        </Text>
      )}

      {/* Filter Section */}
      <View style={styles.filterWrapper}>
        <FilterSection
          search={search}
          onSearchChange={setSearch}
          leagues={leagueCounts}
          selectedLeagues={selectedLeagues}
          onToggleLeague={toggleLeague}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={clearFilters}
          onOpenLeagueModal={handleOpenLeagueModal}
          onOpenFilterSortModal={handleOpenFilterSortModal}
        />
      </View>
    </View>
  ), [view, metaInfo, search, leagueCounts, selectedLeagues, activeFiltersCount, handleOpenLeagueModal, handleOpenFilterSortModal]);

  // Early returns - AFTER all hooks
  if (loading) {
    return (
      <AppShell>
        <View style={styles.loadingContainer}>
          <Skeleton width={200} height={32} borderRadius={8} />
          <View style={{ marginTop: spacing.lg }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ marginBottom: spacing.md }}>
                <SkeletonCard />
              </View>
            ))}
          </View>
        </View>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <View style={styles.errorContainer}>
          <EmptyState
            icon="warning"
            title={t('home.dataLoadError')}
            message={`${error}\n\n${t('home.dataLoadErrorMessage')}`}
            action={
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
              </TouchableOpacity>
            }
          />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {listItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          {listHeader}
          <EmptyState
            icon="search"
            title={t('home.noMatches')}
            message={
              search || selectedLeagues.length
                ? t('home.noMatchesFiltered')
                : t('home.noMatchesMessage')
            }
            action={
              (search || selectedLeagues.length) && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={clearFilters}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>{t('home.clearFilters')}</Text>
                </TouchableOpacity>
              )
            }
          />
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item, index) => {
            if (item.type === 'league') {
              return `league-${item.key}-${index}`;
            }
            return `match-${item.match.matchId}-${index}`;
          }}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={
            hasMore ? (
              <Animated.View
                style={[
                  styles.loadMoreContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {isLoadingMore ? (
                  <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color={colors.accent} />
                    <Text style={styles.loadingMoreText}>{t('home.loadingMore')}</Text>
                  </View>
                ) : (
                  <View style={styles.loadMorePlaceholder} />
                )}
              </Animated.View>
            ) : null
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          initialNumToRender={15}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews
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
          ItemSeparatorComponent={() => null}
        />
      )}

      {/* League Selection Modal */}
      <LeagueSelectionModal
        visible={leagueModalVisible}
        onClose={handleCloseLeagueModal}
        leagues={leagueCounts}
        selectedLeagues={selectedLeagues}
        onToggleLeague={toggleLeague}
        onSelectAll={handleSelectAllLeagues}
        onClearAll={() => setSelectedLeagues([])}
      />

      {/* Filter & Sort Modal */}
      <FilterSortModal
        visible={filterModalVisible}
        onClose={handleCloseFilterSortModal}
        leagues={leagueCounts}
        selectedLeagues={selectedLeagues}
        onToggleLeague={toggleLeague}
        onSelectAllLeagues={handleSelectAllLeagues}
        onClearAllLeagues={() => setSelectedLeagues([])}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewOption={viewOption}
        onViewChange={setViewOption}
      />
    </AppShell>
  );
}

const getStyles = () => {
  const containerPadding = getContainerPadding();

  return StyleSheet.create({
    list: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.full,
      padding: spacing.xs,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      marginHorizontal: containerPadding,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.accent,
    },
    tabText: {
      ...typography.bodySmall,
      color: colors.textTertiary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: colors.bgPrimary,
      fontWeight: '600',
    },
    metaInfo: {
      ...typography.caption,
      color: colors.textTertiary,
      paddingBottom: spacing.sm,
      paddingHorizontal: containerPadding,
    },
    filterWrapper: {
      marginHorizontal: -containerPadding, // Negative margin to extend to edges
    },
    loadingContainer: {
      padding: spacing.lg,
    },
    errorContainer: {
      flex: 1,
      paddingTop: spacing.xxxl * 2,
      paddingBottom: spacing.xl * 2,
    },
    emptyContainer: {
      flex: 1,
      paddingTop: spacing.xxxl * 2,
    },
    retryButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      marginTop: spacing.lg,
    },
    retryButtonText: {
      ...typography.bodySmall,
      color: colors.bgPrimary,
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: spacing.xxxl * 2.5,
      paddingTop: spacing.sm,
      paddingHorizontal: containerPadding,
    },
    loadMoreContainer: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingMore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    loadingMoreText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    loadMorePlaceholder: {
      height: spacing.lg,
    },
  });
};

const styles = getStyles();
