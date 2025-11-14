import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { AppShell } from '@/components/layout/app-shell'
import { useMatches } from '@/hooks/useMatches'
import { useTeamAssets } from '@/hooks/useTeamAssets'
import { DEFAULT_LEAGUE_ICON, LEAGUE_ICONS } from '@/lib/branding'
import type { MatchSummary } from '@/types/match'

const ALL = 'ALL'

export default function MatchesScreen() {
  const router = useRouter()
  const { getViewData, initialLoading, refreshView, viewStatus } = useMatches()
  const [view, setView] = useState<'today' | 'tomorrow'>('today')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])

  const current = getViewData(view)
  const loading = initialLoading && !current

  const leagueCounts = useMemo(() => {
    const base = current?.matches ?? []
    const counts = base.reduce<Record<string, { name: string; total: number }>>((acc, match) => {
      const key = match.league || 'Lig Bilinmiyor'
      acc[key] = acc[key] || { name: key, total: 0 }
      acc[key].total += 1
      return acc
    }, {})
    return Object.values(counts).sort((a, b) => b.total - a.total)
  }, [current?.matches])

  const data = useMemo(() => {
    if (!current?.matches) return []
    const term = search.trim().toLowerCase()
    let base = selectedLeagues.length
      ? current.matches.filter((match) => selectedLeagues.includes(match.league || 'Lig Bilinmiyor'))
      : current.matches
    if (term) {
      base = base.filter((match) => `${match.homeTeam} ${match.awayTeam} ${match.league}`.toLowerCase().includes(term))
    }
    return base
  }, [current, search, selectedLeagues])

  function toggleLeague(league: string) {
    if (league === ALL) {
      setSelectedLeagues([])
      return
    }
    setSelectedLeagues((prev) => {
      if (prev.includes(league)) {
        return prev.filter((item) => item !== league)
      }
      if (prev.length >= 3) {
        const [, ...rest] = prev
        return [...rest, league]
      }
      return [...prev, league]
    })
  }

  function clearFilters() {
    setSelectedLeagues([])
    setSearch('')
  }

  return (
    <AppShell title="Fikstür">
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maç Fikstürü</Text>
        <View style={styles.tabs}>
          {(['today', 'tomorrow'] as const).map((item) => (
            <TouchableOpacity key={item} onPress={() => setView(item)} style={[styles.tab, view === item && styles.tabActive]}>
              <Text style={[styles.tabText, view === item && styles.tabTextActive]}>{item === 'today' ? 'Bugün' : 'Yarın'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <TouchableOpacity style={[styles.chip, !selectedLeagues.length && styles.chipActive]} onPress={() => toggleLeague(ALL)}>
          <Text style={[styles.chipText, !selectedLeagues.length && styles.chipTextActive]}>Tüm ligler</Text>
        </TouchableOpacity>
        {leagueCounts.map((entry) => {
          const active = selectedLeagues.includes(entry.name)
          return (
            <TouchableOpacity key={entry.name} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleLeague(entry.name)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {entry.name} ({entry.total})
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <TextInput
        placeholder="Takım veya lig ara"
        placeholderTextColor="#64748b"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {selectedLeagues.length || search ? (
        <TouchableOpacity onPress={clearFilters} style={styles.clearFilter}>
          <Text style={styles.clearFilterText}>Filtreleri temizle</Text>
        </TouchableOpacity>
      ) : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#cbe043" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.matchId}`}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => <MatchRow match={item} onPress={() => router.push(`/matches/${item.matchId}`)} />}
          initialNumToRender={12}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              tintColor="#cbe043"
              refreshing={refreshing || viewStatus[view] === 'loading'}
              onRefresh={async () => {
                setRefreshing(true)
                await refreshView(view)
                setRefreshing(false)
              }}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
      </View>
    </AppShell>
  )
}

function MatchRow({ match, onPress }: { match: MatchSummary; onPress: () => void }) {
  const assets = useTeamAssets(match.matchId)
  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.leagueInfo}>
          <Image source={LEAGUE_ICONS[match.league || ''] ?? DEFAULT_LEAGUE_ICON} style={styles.leagueBadge} />
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
  )
}

function TeamAvatar({ name, logo }: { name: string; logo?: string | null }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const showLogo = logo && !failed
  return (
    <View style={styles.teamAvatar}>
      {showLogo ? (
        <Image source={{ uri: logo }} style={styles.teamAvatarImage} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Text style={styles.teamAvatarText}>{initials || '?'}</Text>
      )}
    </View>
  )
}

const isWeb = Platform.OS === 'web'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 999,
    padding: 4,
  },
  chipRow: {
    marginVertical: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: {
    borderColor: '#cbe043',
    backgroundColor: '#cbe04322',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#f8fafc',
  },
  search: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#cbe043',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#050814',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
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
    color: '#94a3b8',
    fontSize: 12,
  },
  leagueBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  kickoff: {
    color: '#cbe043',
    fontWeight: '600',
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
    ...(isWeb ? {} : { marginLeft: 8 }),
  },
  team: {
    color: '#f8fafc',
    fontSize: 16,
    flexShrink: 1,
  },
  teamRight: {
    textAlign: 'right',
  },
  vs: {
    color: '#94a3b8',
    marginHorizontal: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  status: {
    color: '#64748b',
    fontSize: 12,
  },
  matchId: {
    color: '#475569',
    fontSize: 10,
  },
  teamAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  teamAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  teamAvatarText: {
    color: '#cbe043',
    fontWeight: '700',
  },
  clearFilter: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  clearFilterText: {
    color: '#cbe043',
    fontSize: 12,
  },
})
