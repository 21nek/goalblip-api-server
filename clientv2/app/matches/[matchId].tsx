import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { extractHighlightPredictions } from '@/lib/match-helpers'
import { useMatches } from '@/hooks/useMatches'
import { AppShell } from '@/components/layout/app-shell'
import type { MatchDetail } from '@/types/match'

type TeamInfo = { name?: string | null; logo?: string | null; score?: number | null }
type Outcome = { label?: string | null; valuePercent?: number | null }
type OddsRow = { label?: string | null; values?: string[] | null }

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>()
  const router = useRouter()
  const { getMatchDetail, getOrFetchMatchDetail } = useMatches()
  const numericId = matchId ? Number(matchId) : null
  const cachedDetail = numericId ? getMatchDetail(numericId) ?? null : null
  const [detail, setDetail] = useState<MatchDetail | null>(cachedDetail)
  const [loading, setLoading] = useState(!cachedDetail)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!numericId) return
    if (cachedDetail) {
      setDetail(cachedDetail)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    getOrFetchMatchDetail(numericId)
      .then((response) => {
        if (!active) return
        setDetail(response)
        setError(response ? null : 'Maç detayı alınamadı.')
      })
      .catch((err) => {
        console.warn('Detail fetch failed', err)
        if (active) setError((err as Error).message || 'Maç detayı alınamadı.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [cachedDetail, getOrFetchMatchDetail, numericId])

  const predictions = extractHighlightPredictions(detail, 5)
  const scoreboard = detail?.scoreboard
  const detailPredictions = detail?.detailPredictions ?? []
  const oddsTrends = detail?.oddsTrends ?? []
  const upcoming = detail?.upcomingMatches ?? []

  return (
    <AppShell title="Maç Analizi" showBackButton rightSlot={<TouchableOpacity onPress={() => router.push('/matches')}><Text style={{ color: '#cbe043', fontWeight: '600' }}>Fikstür</Text></TouchableOpacity>}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#cbe043" />
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryText}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      ) : detail ? (
        <>
          <View style={styles.scoreboard}>
            <Text style={styles.league}>{scoreboard?.leagueLabel || 'Lig Bilgisi'}</Text>
            {scoreboard?.statusBadges?.length ? (
              <View style={styles.badgeRow}>
                {scoreboard.statusBadges.map((badge) => (
                  <Text key={badge} style={styles.statusBadge}>
                    {badge}
                  </Text>
                ))}
              </View>
            ) : null}
            <View style={styles.teamsRow}>
              <TeamBlock team={scoreboard?.homeTeam} align="left" />
              <TeamBlock team={scoreboard?.awayTeam} align="right" />
            </View>
            <Text style={styles.kickoff}>
              {scoreboard?.kickoff || detail.lastUpdatedAt || 'Kickoff yakında'}
              {scoreboard?.kickoffTimezone ? ` • ${scoreboard.kickoffTimezone}` : ''}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Öne Çıkan Tahminler</Text>
            {predictions.length ? (
              predictions.map((pred, index) => (
                <View key={`${pred.title}-${index}`} style={styles.predictionCard}>
                  <View>
                    <Text style={styles.predictionTitle}>{pred.title}</Text>
                    <Text style={styles.predictionValue}>{pred.pick}</Text>
                  </View>
                  <Text style={styles.predictionStat}>
                    {pred.success ?? (pred.rating && pred.ratingMax ? Math.round((pred.rating / pred.ratingMax) * 100) : '—')}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Tahmin verisi bulunamadı.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detaylı Tahminler</Text>
            {detailPredictions.length ? (
              detailPredictions.map((prediction) => (
                <PredictionDetail key={prediction.position} title={prediction.title} confidence={prediction.confidence} outcomes={prediction.outcomes} />
              ))
            ) : (
              <Text style={styles.empty}>Bu maç için detaylı tahmin bulunamadı.</Text>
            )}
          </View>

          {oddsTrends.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Oran Trend Analizi</Text>
              {oddsTrends.map((trend, idx) => (
                <View key={`${trend.title}-${idx}`} style={styles.oddsCard}>
                  <Text style={styles.predictionTitle}>{trend.title}</Text>
                  {trend.cards?.map((card, cardIdx) => (
                    <OddsCard key={`${card.title}-${cardIdx}`} title={card.title} rows={card.rows} />
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {upcoming.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yaklaşan Maçlar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {upcoming.map((team, idx) => (
                  <View key={`${team.team}-${idx}`} style={styles.upcomingCard}>
                    <Text style={styles.predictionTitle}>
                      {team.team} • {team.role}
                    </Text>
                    {team.matches?.map((match, matchIdx) => (
                      <View key={`${match?.opponent}-${matchIdx}`} style={styles.upcomingRow}>
                        <Text style={styles.upcomingOpponent}>{match?.opponent}</Text>
                        <Text style={styles.upcomingMeta}>{match?.competition}</Text>
                        <Text style={styles.upcomingMeta}>{match?.dateText}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yerel Bilgi</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Son Güncelleme</Text>
              <Text style={styles.metaValue}>{detail.lastUpdatedAt || '—'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Veri Kaynağı</Text>
              <Text style={styles.metaValue}>GoalBlip Scout</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>Maç verisi alınamadı.</Text>
      )}
      </ScrollView>
    </AppShell>
  )
}

function TeamBlock({ team, align }: { team?: TeamInfo; align: 'left' | 'right' }) {
  const [failed, setFailed] = useState(false)
  const name = team?.name || 'Bilinmiyor'
  const score = team?.score ?? '-'
  const showLogo = team?.logo && !failed
  return (
    <View style={[styles.teamBlock, align === 'right' && { alignItems: 'flex-end' }]}>
      {showLogo ? (
        <Image source={{ uri: team?.logo }} style={styles.teamLogo} onError={() => setFailed(true)} />
      ) : (
        <View style={styles.teamLogoFallback}>
          <Text style={styles.teamLogoText}>{name.slice(0, 1)}</Text>
        </View>
      )}
      <Text style={styles.teamName}>{name}</Text>
      <Text style={styles.teamScore}>{score}</Text>
    </View>
  )
}
function PredictionDetail({ title, confidence, outcomes }: { title?: string | null; confidence?: number | null; outcomes?: Outcome[] }) {
  return (
    <View style={styles.detailedPrediction}>
      <View style={styles.detailedHeader}>
        <Text style={styles.predictionTitle}>{title || 'Tahmin'}</Text>
        {confidence ? <Text style={styles.predictionConfidence}>%{confidence}</Text> : null}
      </View>
      {outcomes?.map((outcome, idx) => (
        <View key={`${outcome?.label}-${idx}`} style={styles.outcomeRow}>
          <Text style={styles.outcomeLabel}>{outcome?.label}</Text>
          <View style={styles.outcomeBar}>
            <View style={[styles.outcomeFill, { width: `${outcome?.valuePercent ?? 0}%` }]} />
          </View>
          <Text style={styles.outcomeValue}>{outcome?.valuePercent ?? 0}%</Text>
        </View>
      ))}
    </View>
  )
}

function OddsCard({ title, rows }: { title?: string | null; rows?: OddsRow[] }) {
  if (!rows?.length) return null
  return (
    <View style={styles.oddsInnerCard}>
      <Text style={styles.oddsTitle}>{title}</Text>
      {rows.map((row, idx) => (
        <View key={`${row.label}-${idx}`} style={styles.oddsRow}>
          <Text style={styles.oddsLabel}>{row.label}</Text>
          <Text style={styles.oddsValue}>{row.values?.join(' • ')}</Text>
        </View>
      ))}
    </View>
  )
}

const isWeb = Platform.OS === 'web'

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: '#cbe043',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryText: {
    color: '#cbe043',
  },
  scoreboard: {
    backgroundColor: '#111b2f',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
  },
  league: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#cbe04322',
    color: '#cbe043',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    marginHorizontal: 3,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kickoff: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 12,
  },
  teamBlock: {
    flex: 1,
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e293b',
  },
  teamLogoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  teamName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  teamScore: {
    color: '#cbe043',
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  predictionCard: {
    backgroundColor: '#111b2f',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionTitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  predictionValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  predictionStat: {
    color: '#cbe043',
    fontSize: 20,
    fontWeight: '700',
  },
  empty: {
    color: '#94a3b8',
  },
  detailedPrediction: {
    backgroundColor: '#111b2f',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionConfidence: {
    color: '#cbe043',
    fontSize: 14,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  outcomeLabel: {
    color: '#cbd5f5',
    flex: 1,
    fontSize: 12,
  },
  outcomeBar: {
    flex: 2,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  outcomeFill: {
    height: '100%',
    backgroundColor: '#cbe043',
  },
  outcomeValue: {
    color: '#cbe043',
    width: 40,
    textAlign: 'right',
    fontSize: 12,
  },
  oddsCard: {
    marginBottom: 10,
  },
  oddsInnerCard: {
    backgroundColor: '#0b1324',
    borderRadius: 14,
    padding: 12,
  },
  oddsTitle: {
    color: '#f8fafc',
    fontWeight: '600',
    marginBottom: 6,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  oddsLabel: {
    color: '#94a3b8',
    flex: 1,
    fontSize: 12,
  },
  oddsValue: {
    color: '#f8fafc',
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
  },
  upcomingCard: {
    width: 220,
    backgroundColor: '#111b2f',
    borderRadius: 18,
    padding: 14,
    marginRight: 12,
  },
  upcomingRow: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 6,
    marginTop: 6,
  },
  upcomingOpponent: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  upcomingMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
})
