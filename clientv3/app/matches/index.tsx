import { useRouter } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar } from '@/components/ui/avatar';
import { useMatches } from '@/hooks/useMatches';
import { useTeamAssets } from '@/hooks/useTeamAssets';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import type { MatchSummary } from '@/types/match';

const ALL = 'ALL';

export default function MatchesScreen() {
  const router = useRouter();
  const { getViewData, initialLoading, refreshView, viewStatus, errors } = useMatches();
  const [view, setView] = useState<'today' | 'tomorrow'>('today');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const current = getViewData(view);
  const loading = initialLoading && !current;
  const error = errors[view];

  const leagueCounts = useMemo(() => {
    const base = current?.matches ?? [];
    const counts = base.reduce<Record<string, { name: string; total: number }>>(
      (acc, match) => {
        const key = match.league || 'Lig Bilinmiyor';
        acc[key] = acc[key] || { name: key, total: 0 };
        acc[key].total += 1;
        return acc;
      },
      {}
    );
    return Object.values(counts).sort((a, b) => b.total - a.total);
  }, [current?.matches]);

  const data = useMemo(() => {
    if (!current?.matches) return [];
    const term = search.trim().toLowerCase();
    let base = selectedLeagues.length
      ? current.matches.filter((match) =>
          selectedLeagues.includes(match.league || 'Lig Bilinmiyor')
        )
      : current.matches;
    if (term) {
      base = base.filter((match) =>
        `${match.homeTeam} ${match.awayTeam} ${match.league}`.toLowerCase().includes(term)
      );
    }
    return base;
  }, [current, search, selectedLeagues]);

  function toggleLeague(league: string) {
    if (league === ALL) {
      setSelectedLeagues([]);
      return;
    }
    setSelectedLeagues((prev) => {
      if (prev.includes(league)) {
        return prev.filter((item) => item !== league);
      }
      if (prev.length >= 3) {
        const [, ...rest] = prev;
        return [...rest, league];
      }
      return [...prev, league];
    });
  }

  function clearFilters() {
    setSelectedLeagues([]);
    setSearch('');
  }

  return (
    <AppShell title="Fikstür">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Maç Fikstürü</Text>
            {lastRefreshTime && (
              <Text style={styles.lastRefresh}>
                Son güncelleme: {lastRefreshTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <View style={styles.tabs}>
            {(['today', 'tomorrow'] as const).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setView(item)}
              style={[styles.tab, view === item && styles.tabActive]}
              activeOpacity={0.7}
            >
                <Text style={[styles.tabText, view === item && styles.tabTextActive]}>
                  {item === 'today' ? 'Bugün' : 'Yarın'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedLeagues.length && styles.chipActive]}
            onPress={() => toggleLeague(ALL)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, !selectedLeagues.length && styles.chipTextActive]}>
              Tüm ligler
            </Text>
          </TouchableOpacity>
          {leagueCounts.map((entry) => {
            const active = selectedLeagues.includes(entry.name);
            return (
              <TouchableOpacity
                key={entry.name}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleLeague(entry.name)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {entry.name} ({entry.total})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.searchContainer}>
          <View style={styles.searchIconWrapper}>
            <Icon name="search" size={20} color={colors.textTertiary} />
          </View>
          <TextInput
            placeholder="Takım veya lig ara"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={styles.search}
            clearButtonMode="while-editing"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
              <Icon name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {selectedLeagues.length || search ? (
          <TouchableOpacity onPress={clearFilters} style={styles.clearFilter}>
            <Icon name="close-circle" size={16} color={colors.accent} />
            <Text style={styles.clearFilterText}>Filtreleri temizle</Text>
          </TouchableOpacity>
        ) : null}
        
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.loadingText}>Maçlar yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <EmptyState
              icon="warning"
              title="Veri Yüklenemedi"
              message={`${error}\n\nLütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`}
              action={
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={async () => {
                    setRefreshing(true);
                    await refreshView(view);
                    setRefreshing(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              }
            />
          </View>
        ) : data.length === 0 ? (
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
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => `${item.matchId}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MatchRow match={item} onPress={() => router.push(`/matches/${item.matchId}`)} />
            )}
            initialNumToRender={12}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews
            refreshControl={
              <RefreshControl
                tintColor={colors.accent}
                colors={[colors.accent]}
                refreshing={refreshing || viewStatus[view] === 'loading'}
                onRefresh={async () => {
                  setRefreshing(true);
                  await refreshView(view);
                  setRefreshing(false);
                  setLastRefreshTime(new Date());
                }}
                title="Yenileniyor..."
                titleColor={colors.textTertiary}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </AppShell>
  );
}

const MatchRow = memo(function MatchRow({ match, onPress }: { match: MatchSummary; onPress: () => void }) {
  const assets = useTeamAssets(match.matchId);
  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.leagueInfo}>
          <Text style={styles.league}>{match.league || 'Lig Bilgisi'}</Text>
        </View>
        <Text style={styles.kickoff}>{match.kickoffTime || '--:--'}</Text>
      </View>
      <View style={styles.teamsRow}>
        <View style={styles.teamBlock}>
          <TeamAvatar name={match.homeTeam} logo={assets?.homeLogo} />
          <Text style={styles.team}>{match.homeTeam}</Text>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <Text style={[styles.team, styles.teamRight]}>{match.awayTeam}</Text>
          <TeamAvatar name={match.awayTeam} logo={assets?.awayLogo} />
        </View>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.status}>{match.statusLabel || 'Hazırlık'}</Text>
        <Text style={styles.matchId}>#{match.matchId}</Text>
      </View>
    </TouchableOpacity>
  );
});

const TeamAvatar = memo(function TeamAvatar({ name, logo }: { name: string; logo?: string | null }) {
  return <Avatar name={name} logo={logo} size={36} />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTop: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  lastRefresh: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 11,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  chipRow: {
    marginVertical: spacing.xs,
  },
  chipRowContent: {
    paddingRight: spacing.xl,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: colors.bgSecondary,
    minHeight: 32,
    justifyContent: 'center',
    ...shadows.subtle,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '22',
    borderWidth: 1.5,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  searchIconWrapper: {
    marginRight: spacing.sm,
  },
  search: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    padding: 0,
  },
  searchClear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
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
    ...typography.bodySmall,
    color: colors.bgPrimary,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl * 2,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    paddingTop: 40,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  retryButtonText: {
    color: colors.bgPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  matchCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  league: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  kickoff: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 15,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  teamBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamBlockRight: {
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  team: {
    ...typography.body,
    color: colors.textPrimary,
    flexShrink: 1,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  teamRight: {
    textAlign: 'right',
    marginRight: spacing.sm,
    marginLeft: 0,
  },
  vs: {
    ...typography.caption,
    color: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  status: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  matchId: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  clearFilter: {
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  clearFilterIcon: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  clearFilterText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: typography.caption.fontSize,
    marginLeft: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxxl * 2.5,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
});

