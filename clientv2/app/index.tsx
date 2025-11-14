import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, Platform, ScrollView, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native'

import { StatCard } from '@/components/stat-card'
import { TopLeagueCard } from '@/components/top-league-card'
import { AIShortlistCard } from '@/components/home/ai-shortlist-card'
import { AppShell } from '@/components/layout/app-shell'
import { useMatches } from '@/hooks/useMatches'
import { useTeamAssets } from '@/hooks/useTeamAssets'
import { aggregateDashboardMetrics, computeLeagueStats } from '@/lib/match-helpers'
import { DEFAULT_LEAGUE_ICON, LEAGUE_ICONS } from '@/lib/branding'
import type { MatchSummary } from '@/types/match'

const ALL_LEAGUES = 'ALL'

export default function HomeScreen() {
  const router = useRouter()
  const { today, tomorrow, initialLoading, getMatchDetail, getOrFetchMatchDetail } = useMatches()
  const [selectedLeague, setSelectedLeague] = useState<string>(ALL_LEAGUES)

  const metrics = aggregateDashboardMetrics(today, tomorrow)
  const leagueLeaders = computeLeagueStats(today).slice(0, 8)
  const filteredMatches = useMemo(() => {
    const base = today?.matches ?? []
    if (selectedLeague === ALL_LEAGUES) {
      return base
    }
    return base.filter((match) => match.league === selectedLeague)
  }, [selectedLeague, today?.matches])
  const shortlistMatches = useMemo(() => filteredMatches.slice(0, 5), [filteredMatches])
  const topMatches = useMemo(() => {
    const base = filteredMatches.length ? filteredMatches : today?.matches ?? []
    return base.slice(0, 10)
  }, [filteredMatches, today?.matches])
  const shortlistData = useMemo(
    () =>
      shortlistMatches.map((match) => ({
        match,
        detail: getMatchDetail(match.matchId),
      })),
    [getMatchDetail, shortlistMatches],
  )
  const missingShortlistIds = useMemo(
    () => shortlistData.filter((item) => !item.detail).map((item) => item.match.matchId),
    [shortlistData],
  )
  useEffect(() => {
    if (!missingShortlistIds.length) return
    let cancelled = false
    async function hydrate() {
      for (const id of missingShortlistIds) {
        if (cancelled) break
        await getOrFetchMatchDetail(id)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [getOrFetchMatchDetail, missingShortlistIds])
  const loading = initialLoading
  const featuredMatches = useMemo(() => filteredMatches.slice(0, 6), [filteredMatches])

  return (
    <AppShell title="Panel">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#cbe043" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lig vitrin</Text>
              <TouchableOpacity onPress={() => router.push('/matches')}>
                <Text style={styles.sectionLink}>Tüm ligler</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.leagueCard, selectedLeague === ALL_LEAGUES && styles.leagueCardSelected]}
                onPress={() => setSelectedLeague(ALL_LEAGUES)}
              >
                <Text style={styles.allLeaguesLabel}>Tüm Ligler</Text>
                <Text style={styles.allLeaguesCount}>{today?.totalMatches ?? 0} maç</Text>
              </TouchableOpacity>
              {leagueLeaders.map((league) => {
                const isSelected = selectedLeague === league.league
                return (
                  <TouchableOpacity
                    key={league.league}
                    style={[styles.leagueCard, isSelected && styles.leagueCardSelected]}
                    onPress={() => setSelectedLeague(isSelected ? ALL_LEAGUES : league.league)}
                  >
                    <Image source={LEAGUE_ICONS[league.league] ?? DEFAULT_LEAGUE_ICON} style={styles.leagueLogo} resizeMode="cover" />
                    <TopLeagueCard
                      league={league.league}
                      total={league.matches.length}
                      kickoff={league.matches[0]?.kickoffTime}
                    />
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bugünden 10 maç</Text>
              <TouchableOpacity onPress={() => router.push('/matches')}>
                <Text style={styles.sectionLink}>Tümü</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topMatches.map((match) => (
                <FeaturedMatchCard key={match.matchId} match={match} onPress={() => router.push(`/matches/${match.matchId}`)} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.hero}>
            <Text style={styles.kicker}>GoalBlip Scout</Text>
            <Text style={styles.title}>Gerçek zamanlı maç istihbaratı</Text>
            <Text style={styles.subtitle}>Fikstür, oran trendleri ve AI tahminleri tek panelde.</Text>
            <View style={styles.heroActions}>
              <TouchableOpacity onPress={() => router.push('/matches')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Maç Listesi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/matches')} style={[styles.secondaryButton, styles.heroActionsSpacer]}>
                <Text style={styles.secondaryButtonText}>Ligleri İncele</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI kısa liste</Text>
              <TouchableOpacity onPress={() => router.push('/matches')}>
                <Text style={styles.sectionLink}>Tüm öneriler</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shortlistData.length ? (
                shortlistData.map(({ match, detail }) => (
                  <AIShortlistCard
                    key={match.matchId}
                    match={match}
                    detail={detail}
                    loading={!detail}
                    onPress={() => router.push(`/matches/${match.matchId}`)}
                  />
                ))
              ) : (
                <View style={styles.shortlistEmpty}>
                  <Text style={styles.emptyText}>Bu lig için öneri bulunamadı.</Text>
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Bugünkü maç" value={metrics.totalToday?.toString() ?? '—'} caption="/api/matches verisi" />
            <StatCard label="Toplam lig" value={metrics.totalLeagues?.toString() ?? '—'} caption="global kapsam" />
            <StatCard
              label="Güncelleme"
              value={metrics.refreshedAgo ?? '—'}
              caption={today?.scrapedAt ? new Date(today.scrapedAt).toLocaleTimeString('tr-TR') : ''}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Öne çıkan maçlar</Text>
              <TouchableOpacity onPress={() => router.push('/matches')}>
                <Text style={styles.sectionLink}>Hepsini gör</Text>
              </TouchableOpacity>
            </View>
            {featuredMatches.length ? (
              featuredMatches.map((match) => (
                <FeaturedListCard key={`featured-${match.matchId}`} match={match} onPress={() => router.push(`/matches/${match.matchId}`)} />
              ))
            ) : (
              <Text style={styles.emptyText}>Bugün için öne çıkan maç bulunamadı.</Text>
            )}
          </View>
        </>
      )}
      </ScrollView>
    </AppShell>
  )
}

function FeaturedMatchCard({ match, onPress }: { match: MatchSummary; onPress: () => void }) {
  const assets = useTeamAssets(match.matchId)
  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress}>
      <View style={styles.matchCardHeader}>
        <Image source={LEAGUE_ICONS[match.league || ''] ?? DEFAULT_LEAGUE_ICON} style={styles.matchCardBadge} />
        <Text style={styles.matchLeague}>{match.league || 'Lig'}</Text>
        <Text style={styles.matchKickoff}>{match.kickoffTime || '--:--'}</Text>
      </View>
      <View style={styles.matchTeamsRow}>
        <TeamBadge name={match.homeTeam} logo={assets?.homeLogo} />
        <Text style={styles.vsSmall}>vs</Text>
        <TeamBadge name={match.awayTeam} logo={assets?.awayLogo} align="right" />
      </View>
      <View style={styles.matchMetaRow}>
        <Text style={styles.matchStatus}>{match.statusLabel || 'Hazırlık'}</Text>
        <Text style={styles.matchLink}>#{match.matchId}</Text>
      </View>
    </TouchableOpacity>
  )
}

function FeaturedListCard({ match, onPress }: { match: MatchSummary; onPress: () => void }) {
  const assets = useTeamAssets(match.matchId)
  return (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={styles.featureTeams}>
        <TeamBadge name={match.homeTeam} logo={assets?.homeLogo} textStyle={styles.featureTeam} />
        <Text style={styles.vsSmall}>vs</Text>
        <TeamBadge name={match.awayTeam} logo={assets?.awayLogo} align="right" textStyle={styles.featureTeam} />
      </View>
      <View style={styles.featureMeta}>
        <Text style={styles.matchLeague}>{match.league || 'Lig'}</Text>
        <Text style={styles.matchKickoff}>{match.kickoffTime || '--:--'}</Text>
      </View>
    </TouchableOpacity>
  )
}

function TeamBadge({ name, logo, align = 'left', textStyle }: { name: string; logo?: string | null; align?: 'left' | 'right'; textStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={[styles.teamBadgeRow, align === 'right' && styles.teamBadgeRowRight]}>
      {align === 'right' ? null : <TeamLogo name={name} logo={logo} />}
      <Text style={[styles.matchTeam, align === 'right' && styles.matchTeamRight, textStyle]} numberOfLines={1}>
        {name}
      </Text>
      {align === 'right' ? <TeamLogo name={name} logo={logo} /> : null}
    </View>
  )
}

function TeamLogo({ name, logo }: { name: string; logo?: string | null }) {
  const [failed, setFailed] = useState(false)
  const initials = getInitials(name)
  const showLogo = logo && !failed
  return (
    <View style={styles.featureBadge}>
      {showLogo ? (
        <Image source={{ uri: logo }} style={styles.featureBadgeImage} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Text style={styles.featureBadgeText}>{initials}</Text>
      )}
    </View>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const isWeb = Platform.OS === 'web'

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
  },
  kicker: {
    color: '#94a3b8',
    fontSize: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    color: '#cbd5f5',
    fontSize: 16,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  heroActionsSpacer: {
    ...(isWeb ? {} : { marginLeft: 12 }),
  },
  primaryButton: {
    backgroundColor: '#cbe043',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#050814',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbe043',
  },
  secondaryButtonText: {
    color: '#cbe043',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionLink: {
    color: '#cbe043',
    fontSize: 14,
  },
  loadingBox: {
    backgroundColor: '#0f172a',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111b2f',
    borderRadius: 24,
    paddingRight: 12,
  },
  leagueCardSelected: {
    borderColor: '#cbe043',
  },
  leagueLogo: {
    width: 44,
    height: 44,
    marginRight: 10,
    borderRadius: 22,
    backgroundColor: '#1e293b',
  },
  allLeaguesLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  allLeaguesCount: {
    color: '#94a3b8',
    fontSize: 12,
  },
  matchCard: {
    width: 220,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
  },
  matchTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  matchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchCardBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    marginRight: 8,
  },
  matchLeague: {
    color: '#64748b',
    fontSize: 12,
  },
  matchTeam: {
    color: '#f8fafc',
    fontSize: 16,
  },
  matchTeamRight: {
    textAlign: 'right',
  },
  vsSmall: {
    color: '#94a3b8',
    fontSize: 12,
  },
  matchKickoff: {
    color: '#cbe043',
    fontSize: 16,
    fontWeight: '700',
  },
  matchMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  matchStatus: {
    color: '#94a3b8',
    fontSize: 12,
  },
  matchLink: {
    color: '#94a3b8',
    fontSize: 12,
  },
  shortlistEmpty: {
    minWidth: 240,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  featureCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#111b2f',
    padding: 16,
    marginBottom: 12,
  },
  featureTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureTeam: {
    color: '#f8fafc',
    fontSize: 16,
    flex: 1,
  },
  featureBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  featureBadgeImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  featureBadgeText: {
    color: '#cbe043',
    fontWeight: '700',
  },
  featureMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamBadgeRowRight: {
    justifyContent: 'flex-end',
  },
})
