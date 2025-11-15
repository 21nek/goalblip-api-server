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
} from 'react-native';
import { getContainerPadding } from '@/lib/responsive';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { MatchCard } from '@/components/home/match-card';
import { LeagueHeader } from '@/components/home/league-header';
import { FilterSection } from '@/components/home/filter-section';
import { LeagueSelectionModal } from '@/components/home/league-selection-modal';
import { useMatches } from '@/hooks/useMatches';
import { computeLeagueStats } from '@/lib/match-helpers';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import type { MatchSummary } from '@/types/match';

const ALL_LEAGUES = 'ALL';

type ListItem = 
  | { type: 'league'; league: string }
  | { type: 'match'; match: MatchSummary };

export default function HomeScreen() {
  const router = useRouter();
  const { today, tomorrow, initialLoading, getMatchDetail, getOrFetchMatchDetail, errors, refreshView } = useMatches();
  const [view, setView] = useState<'today' | 'tomorrow'>('today');
  const [search, setSearch] = useState('');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const current = view === 'today' ? today : tomorrow;
  const loading = initialLoading && !current;
  const error = errors[view];

  // Compute league stats
  const leagueStats = useMemo(() => computeLeagueStats(current), [current]);
  const leagueCounts = useMemo(() => {
    return leagueStats.map((stat) => ({
      name: stat.league,
      total: stat.matches.length,
    }));
  }, [leagueStats]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    if (!current?.matches) return [];
    
    let matches = current.matches;
    
    // Date filter: For "today" view, filter out all matches if dataDate is from previous days
    // API doesn't auto-delete old data, so we need to filter on client side
    if (view === 'today' && current.dataDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dataDate = new Date(current.dataDate);
      dataDate.setHours(0, 0, 0, 0);
      
      // If dataDate is older than today, filter out ALL matches
      // This prevents showing yesterday's matches as today's matches
      if (dataDate < today) {
        console.warn('[HomeScreen] Filtering out stale data:', {
          dataDate: current.dataDate,
          today: today.toISOString().split('T')[0],
          view,
          originalMatchCount: matches.length
        });
        
        // Filter out all matches from previous days
        matches = [];
      }
    }
    
    // League filter
    if (selectedLeagues.length > 0) {
      matches = matches.filter((match) => selectedLeagues.includes(match.league || 'Lig Bilinmiyor'));
    }
    
    // Search filter
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      matches = matches.filter((match) =>
        `${match.homeTeam} ${match.awayTeam} ${match.league}`.toLowerCase().includes(term)
      );
    }
    
    return matches;
  }, [current?.matches, current?.dataDate, view, selectedLeagues, search]);

  // Group matches by league
  const groupedMatches = useMemo(() => {
    const grouped: Record<string, MatchSummary[]> = {};
    filteredMatches.forEach((match) => {
      const league = match.league || 'Lig Bilinmiyor';
      if (!grouped[league]) {
        grouped[league] = [];
      }
      grouped[league].push(match);
    });
    return grouped;
  }, [filteredMatches]);

  // Create list items (league headers + matches)
  const listItems = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    const leagues = Object.keys(groupedMatches).sort();
    
    leagues.forEach((league) => {
      items.push({ type: 'league', league });
      groupedMatches[league].forEach((match) => {
        items.push({ type: 'match', match });
      });
    });
    
    return items;
  }, [groupedMatches]);

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

  const handleSelectAllLeagues = useCallback(() => {
    setSelectedLeagues([]);
  }, []);

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
    const time = current.scrapedAt ? new Date(current.scrapedAt).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : null;
    return `${date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}${time ? ` • ${time}` : ''}`;
  }, [current]);

  // Render list item
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'league') {
      return <LeagueHeader league={item.league} />;
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
            Bugün
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'tomorrow' && styles.tabActive]}
          onPress={() => setView('tomorrow')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, view === 'tomorrow' && styles.tabTextActive]}>
            Yarın
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
        />
      </View>
    </View>
  ), [view, metaInfo, search, leagueCounts, selectedLeagues, activeFiltersCount, handleOpenLeagueModal]);

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
            title="Veri Yüklenemedi"
            message={`${error}\n\nLütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`}
            action={
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
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
            title="Maç Bulunamadı"
                    message={
                      search || selectedLeagues.length
                        ? 'Arama kriterlerinize uygun maç bulunamadı.\n\nFiltreleri temizleyip tekrar deneyebilirsiniz.'
                        : 'Bu görünüm için henüz maç yok.\n\nYakında yeni maçlar eklenecek!'
                    }
                    action={
                      (search || selectedLeagues.length) && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={clearFilters}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>Filtreleri Temizle</Text>
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
              return `league-${item.league}-${index}`;
            }
            return `match-${item.match.matchId}-${index}`;
          }}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
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
              title="Yenileniyor..."
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
        onClearAll={clearFilters}
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
  });
};

const styles = getStyles();
