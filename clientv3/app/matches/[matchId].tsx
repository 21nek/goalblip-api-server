import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { extractHighlightPredictions } from '@/lib/match-helpers';
import { useMatches } from '@/hooks/useMatches';
import { AppShell } from '@/components/layout/app-shell';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { RecentFormCard } from '@/components/match/recent-form-card';
import { HeadToHeadCard } from '@/components/match/head-to-head-card';
import { QuickSummaryCard } from '@/components/match/quick-summary-card';
import { FormStatsCard } from '@/components/match/form-stats-card';
import { KeyInsightsCard } from '@/components/match/key-insights-card';
import { TeamComparisonCard } from '@/components/match/team-comparison-card';
import { GoalAnalysisCard } from '@/components/match/goal-analysis-card';
import { PredictionSummaryCard } from '@/components/match/prediction-summary-card';
import { RiskAnalysisCard } from '@/components/match/risk-analysis-card';
import { OddsTrendCard } from '@/components/match/odds-trend-card';
import { VisualComparisonCard } from '@/components/match/visual-comparison-card';
import { StrengthsWeaknessesCard } from '@/components/match/strengths-weaknesses-card';
import {
  calculateFormStats,
  compareTeams,
  extractKeyInsights,
  getQuickSummary,
} from '@/lib/match-analysis';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { getContainerPadding, getCardPadding, screenDimensions } from '@/lib/responsive';
import type { MatchDetail } from '@/types/match';

type TeamInfo = { name?: string | null; logo?: string | null; score?: number | null };
type Outcome = { label?: string | null; valuePercent?: number | null };
type OddsRow = { label?: string | null; values?: string[] | null };

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { getMatchDetail, getOrFetchMatchDetail } = useMatches();
  const numericId = matchId ? Number(matchId) : null;
  const cachedDetail = numericId ? getMatchDetail(numericId) ?? null : null;
  const [detail, setDetail] = useState<MatchDetail | null>(cachedDetail);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDetail = useCallback(async (showLoading = true, retryCount = 0) => {
    if (!numericId) {
      setError('Geçersiz maç ID');
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      console.log('[MatchDetail] Fetching detail for:', numericId, retryCount > 0 ? `(retry ${retryCount})` : '');
      const response = await getOrFetchMatchDetail(numericId);
      if (response) {
          console.log('[MatchDetail] Detail loaded successfully:', numericId);
          setDetail(response);
          setError(null);
          if (!showLoading) {
            setLastRefreshTime(new Date());
          }
      } else {
        console.warn('[MatchDetail] Detail is null for:', numericId);
        // Cache'de varsa onu kullan, yoksa retry dene veya hata göster
        if (cachedDetail) {
          setDetail(cachedDetail);
          // İlk denemede timeout olduysa, bir kez daha dene
          if (retryCount === 0) {
            console.log('[MatchDetail] Retrying after timeout...');
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = setTimeout(() => fetchDetail(false, 1), 2000);
            return;
          }
        } else if (retryCount < 1) {
          // Bir kez daha dene
          console.log('[MatchDetail] Retrying fetch...');
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => fetchDetail(showLoading, retryCount + 1), 2000);
          return;
        } else {
          setError('Maç detayı bulunamadı. API\'den veri alınamadı.');
        }
      }
    } catch (err) {
      console.error('[MatchDetail] Fetch failed:', numericId, err);
      const errorMessage = err instanceof Error ? err.message : 'Maç detayı alınamadı.';
      const isTimeout = errorMessage.includes('zaman aşımı');
      
      // Cache'de varsa onu göster
      if (cachedDetail) {
        setDetail(cachedDetail);
        if (isTimeout && retryCount < 1) {
          // Timeout olduysa bir kez daha dene
          console.log('[MatchDetail] Retrying after timeout...');
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => fetchDetail(false, retryCount + 1), 2000);
          return;
        } else {
          setError('Güncel veri alınamadı, önbellekten gösteriliyor.');
        }
      } else if (isTimeout && retryCount < 1) {
        // Timeout olduysa bir kez daha dene
        console.log('[MatchDetail] Retrying after timeout...');
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => fetchDetail(showLoading, retryCount + 1), 2000);
        return;
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [numericId, getOrFetchMatchDetail, cachedDetail]);

  useEffect(() => {
    let mounted = true;
    
    // İlk yüklemede cache'i göster, ama arka planda fresh data çek
    if (cachedDetail) {
      setDetail(cachedDetail);
      setLoading(false);
      // Arka planda fresh data çek (sadece bir kez)
      if (mounted) {
        fetchDetail(false);
      }
    } else {
      // Cache yoksa direkt fetch et
      if (mounted) {
        fetchDetail(true);
      }
    }
    
    return () => {
      mounted = false;
      // Cleanup: retry timeout'u temizle
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId]); // Sadece matchId değiştiğinde yeniden fetch et

  const predictions = extractHighlightPredictions(detail, 5);
  const scoreboard = detail?.scoreboard;
  const detailPredictions = detail?.detailPredictions ?? [];
  const oddsTrends = detail?.oddsTrends ?? [];
  const upcoming = detail?.upcomingMatches ?? [];

  return (
    <AppShell
      showBackButton
      showBottomNav={false}
    >
      <ScrollView
        contentContainerStyle={getStyles().container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDetail(false)}
            tintColor={colors.accent}
            colors={[colors.accent]}
            title="Yenileniyor..."
            titleColor={colors.textTertiary}
          />
        }
      >
        {loading ? (
          <View style={getStyles().loading}>
            <Skeleton width="100%" height={220} borderRadius={borderRadius.xxl} style={getStyles().marginBottom} />
            <Skeleton width="100%" height={24} borderRadius={borderRadius.sm} style={getStyles().marginBottom} />
            <Skeleton width="100%" height={120} borderRadius={borderRadius.lg} style={getStyles().marginBottom} />
            <Skeleton width="80%" height={24} borderRadius={borderRadius.sm} style={getStyles().marginBottom} />
            <Skeleton width="100%" height={100} borderRadius={borderRadius.lg} />
          </View>
        ) : error ? (
          <View style={getStyles().errorBox}>
            <EmptyState
              icon="error"
              title="Maç Detayı Yüklenemedi"
              message={`${error}\n\nLütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`}
              action={
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    style={getStyles().retryButton}
                    onPress={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        const response = await getOrFetchMatchDetail(numericId!);
                        if (response) {
                          setDetail(response);
                        } else {
                          setError('Maç detayı bulunamadı.');
                        }
                      } catch (err) {
                        setError((err as Error).message || 'Yeniden yükleme başarısız.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={getStyles().retryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[getStyles().retryButton, getStyles().backButton]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                  >
                    <Text style={getStyles().backButtonText}>Geri Dön</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        ) : detail ? (
          <>
            <View style={getStyles().scoreboard}>
              <Text style={getStyles().league} numberOfLines={1} ellipsizeMode="tail">{scoreboard?.leagueLabel || 'Lig Bilgisi'}</Text>
              {scoreboard?.statusBadges?.length ? (
                <View style={getStyles().badgeRow}>
                  {scoreboard.statusBadges.map((badge) => (
                    <Text key={badge} style={getStyles().statusBadge} numberOfLines={1}>
                      {badge}
                    </Text>
                  ))}
                </View>
              ) : null}
              <View style={getStyles().teamsRow}>
                <TeamBlock team={scoreboard?.homeTeam} align="left" />
                <View style={getStyles().vsContainer}>
                  <View style={getStyles().vsBadge}>
                    <Text style={getStyles().vsText}>VS</Text>
                  </View>
                  {scoreboard?.halftimeScore ? (
                    <Text style={getStyles().halftimeScore}>{scoreboard.halftimeScore}</Text>
                  ) : null}
                </View>
                <TeamBlock team={scoreboard?.awayTeam} align="right" />
              </View>
              {scoreboard?.info?.length ? (
                <View style={getStyles().infoRow}>
                  {scoreboard.info.map((info, idx) => (
                    <Text key={idx} style={[getStyles().infoText, idx > 0 && { marginLeft: spacing.xs }]} numberOfLines={1}>
                      {info}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={getStyles().kickoff} numberOfLines={2} ellipsizeMode="tail">
                  {scoreboard?.kickoff || detail.lastUpdatedAt || 'Kickoff yakında'}
                  {scoreboard?.kickoffTimezone ? ` • ${scoreboard.kickoffTimezone}` : ''}
                </Text>
              )}
            </View>

            {/* Quick Summary */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              const comparison = compareTeams(
                homeForm,
                awayForm,
                scoreboard?.homeTeam?.name,
                scoreboard?.awayTeam?.name
              );
              const quickSummary = getQuickSummary(detail.detailPredictions, comparison);
              
              return quickSummary ? (
                <View style={getStyles().section}>
                  <QuickSummaryCard 
                    {...quickSummary}
                    outcomes={quickSummary.outcomes}
                  />
                </View>
              ) : null;
            })()}

            {/* Key Insights */}
            {(() => {
              const insights = extractKeyInsights(
                detail.recentForm,
                detail.headToHead,
                detail.detailPredictions,
                scoreboard?.homeTeam?.name,
                scoreboard?.awayTeam?.name
              );
              return insights.length > 0 ? (
                <View style={getStyles().section}>
                  <KeyInsightsCard insights={insights} />
                </View>
              ) : null;
            })()}

            {/* Team Comparison */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              const comparison = compareTeams(
                homeForm,
                awayForm,
                scoreboard?.homeTeam?.name,
                scoreboard?.awayTeam?.name
              );
              return comparison ? (
                <View style={getStyles().section}>
                  <TeamComparisonCard comparison={comparison} />
                </View>
              ) : null;
            })()}

            {/* Visual Comparison */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || 'Ev Sahibi';
              const awayTeamName = scoreboard?.awayTeam?.name || 'Deplasman';

              return (
                <View style={getStyles().section}>
                  <VisualComparisonCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                  />
                </View>
              );
            })()}

            {/* Strengths & Weaknesses */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || 'Ev Sahibi';
              const awayTeamName = scoreboard?.awayTeam?.name || 'Deplasman';

              return (
                <View style={getStyles().section}>
                  <StrengthsWeaknessesCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                  />
                </View>
              );
            })()}

            {/* Prediction Summary */}
            {detailPredictions.length > 0 && (
              <View style={getStyles().section}>
                <PredictionSummaryCard predictions={detailPredictions} />
              </View>
            )}

            {/* Goal Analysis */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || 'Ev Sahibi';
              const awayTeamName = scoreboard?.awayTeam?.name || 'Deplasman';

              // Find Over/Under prediction
              const overUnderPrediction = detailPredictions.find(
                (p) => p.title?.toLowerCase().includes('alt') || p.title?.toLowerCase().includes('üst')
              )?.outcomes?.[0] || null;

              return (
                <View style={getStyles().section}>
                  <GoalAnalysisCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                    overUnderPrediction={overUnderPrediction}
                  />
                </View>
              );
            })()}

            {/* Risk Analysis */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || 'Ev Sahibi';
              const awayTeamName = scoreboard?.awayTeam?.name || 'Deplasman';

              return (
                <View style={getStyles().section}>
                  <RiskAnalysisCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                  />
                </View>
              );
            })()}

            <View style={getStyles().section}>
              <Text style={getStyles().sectionTitle}>Detaylı Tahminler</Text>
              {detailPredictions.length ? (
                detailPredictions.map((prediction) => (
                  <PredictionDetail
                    key={prediction.position}
                    title={prediction.title}
                    confidence={prediction.confidence}
                    outcomes={prediction.outcomes}
                  />
                ))
              ) : (
                <EmptyState icon="empty" title="Detaylı Analiz Yok" message="Bu maç için detaylı tahmin analizi henüz hazır değil." />
              )}
            </View>

            {detail.recentForm && detail.recentForm.length > 0 && (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>Form İstatistikleri</Text>
                {detail.recentForm.map((form, index) => {
                  const stats = calculateFormStats(form.matches || []);
                  const teamName = form.title?.replace(/📈\s*/, '').replace(/\s*-\s*Son Form/, '').trim() || `Takım ${index + 1}`;
                  return (
                    <FormStatsCard
                      key={index}
                      teamName={teamName}
                      stats={stats}
                      isHome={index === 0}
                    />
                  );
                })}
              </View>
            )}

            {detail.recentForm && detail.recentForm.length > 0 && (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>Son Form Detayları</Text>
                {detail.recentForm.map((form, index) => (
                  <RecentFormCard
                    key={index}
                    title={form.title || 'Son Form'}
                    matches={form.matches || []}
                  />
                ))}
              </View>
            )}

            {detail.headToHead && detail.headToHead.length > 0 && (
              <View style={getStyles().section}>
                <HeadToHeadCard
                  matches={detail.headToHead}
                  currentHomeTeam={scoreboard?.homeTeam?.name}
                  currentAwayTeam={scoreboard?.awayTeam?.name}
                />
              </View>
            )}

            {oddsTrends.length ? (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>Oran Trend Analizi</Text>
                {oddsTrends.map((trend, idx) => (
                  <OddsTrendCard
                    key={`${trend.title}-${idx}`}
                    title={trend.title || 'Oran Trendleri'}
                    cards={trend.cards || []}
                  />
                ))}
              </View>
            ) : null}

            {upcoming.length ? (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>Yaklaşan Maçlar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {upcoming.map((team, idx) => (
                    <View key={`${team.team}-${idx}`} style={getStyles().upcomingCard}>
                      <Text style={getStyles().predictionTitle} numberOfLines={1} ellipsizeMode="tail">
                        {team.team} • {team.role}
                      </Text>
                      {team.matches?.map((match, matchIdx) => (
                        <View key={`${match?.opponent}-${matchIdx}`} style={getStyles().upcomingRow}>
                          <Text style={getStyles().upcomingOpponent} numberOfLines={1}>{match?.opponent}</Text>
                          <Text style={getStyles().upcomingMeta} numberOfLines={1}>{match?.competition}</Text>
                          <Text style={getStyles().upcomingMeta} numberOfLines={1}>{match?.dateText}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={getStyles().section}>
              <Text style={getStyles().sectionTitle}>Yerel Bilgi</Text>
              <View style={getStyles().metaRow}>
                <Text style={getStyles().metaLabel}>Son Güncelleme</Text>
                <Text style={getStyles().metaValue} numberOfLines={1}>{detail.lastUpdatedAt || '—'}</Text>
              </View>
              <View style={getStyles().metaRow}>
                <Text style={getStyles().metaLabel}>Veri Kaynağı</Text>
                <Text style={getStyles().metaValue}>GoalBlip Scout</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={getStyles().empty}>Maç verisi alınamadı.</Text>
        )}
      </ScrollView>
    </AppShell>
  );
}

function TeamBlock({ team, align }: { team?: TeamInfo; align: 'left' | 'right' }) {
  const name = team?.name || 'Bilinmiyor';
  const score = team?.score ?? null;
  const styles = getStyles();
  const isSmall = screenDimensions.isSmall;
  return (
    <View style={[styles.teamBlock, align === 'right' && { alignItems: 'flex-end' }]}>
      <Avatar name={name} logo={team?.logo} size={isSmall ? 56 : 72} />
      <Text style={styles.teamName} numberOfLines={2} ellipsizeMode="tail">
        {name}
      </Text>
      <Text style={styles.teamScore}>{score !== null ? score : '—'}</Text>
    </View>
  );
}

function PredictionDetail({
  title,
  confidence,
  outcomes,
}: {
  title?: string | null;
  confidence?: number | null;
  outcomes?: Outcome[];
}) {
  const styles = getStyles();
  return (
    <View style={styles.detailedPrediction}>
      <View style={styles.detailedHeader}>
        <Text style={styles.predictionTitle} numberOfLines={1} ellipsizeMode="tail">{title || 'Tahmin'}</Text>
        {confidence ? (
          <View style={styles.confidenceBadge}>
            <Text style={styles.predictionConfidence}>%{confidence}</Text>
          </View>
        ) : null}
      </View>
      {outcomes?.map((outcome, idx) => (
        <ProgressBar
          key={`${outcome?.label}-${idx}`}
          label={outcome?.label || 'Bilinmiyor'}
          value={outcome?.valuePercent ?? 0}
          max={100}
          showValue={true}
          color={
            (outcome?.valuePercent ?? 0) >= 60
              ? colors.success
              : (outcome?.valuePercent ?? 0) >= 40
              ? colors.warning
              : colors.error
          }
        />
      ))}
    </View>
  );
}

function OddsCard({ title, rows }: { title?: string | null; rows?: OddsRow[] }) {
  if (!rows?.length) return null;
  
  const parseTrend = (value: string) => {
    if (value.includes('↑')) return { direction: 'up', color: colors.success };
    if (value.includes('↓')) return { direction: 'down', color: colors.error };
    return { direction: 'neutral', color: colors.textSecondary };
  };

  return (
    <View style={styles.oddsInnerCard}>
      <Text style={styles.oddsTitle}>{title}</Text>
      {rows.map((row, idx) => {
        const values = row.values || [];
        return (
          <View key={`${row.label}-${idx}`} style={styles.oddsRow}>
            <Text style={styles.oddsLabel}>{row.label}</Text>
            <View style={styles.oddsValues}>
              {values.map((val, valIdx) => {
                const trend = parseTrend(val);
                return (
                  <Text
                    key={valIdx}
                    style={[
                      styles.oddsValue,
                      trend.direction !== 'neutral' && { color: trend.color },
                    ]}
                  >
                    {valIdx > 0 && ' • '}
                    {val}
                  </Text>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const getStyles = () => {
  const containerPadding = getContainerPadding();
  const cardPadding = getCardPadding();
  const isSmall = screenDimensions.isSmall;
  
  return StyleSheet.create({
    container: {
      paddingBottom: spacing.xxxl * 2.5,
      paddingHorizontal: containerPadding,
    },
  loading: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  marginBottom: {
    marginBottom: spacing.md,
  },
  predictionLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    marginTop: 4,
  },
  errorBox: {
    flex: 1,
    paddingTop: 40,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    color: colors.bgPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  headerLink: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
    scoreboard: {
      backgroundColor: colors.bgTertiary,
      borderRadius: borderRadius.xxl,
      padding: cardPadding,
      marginBottom: spacing.lg,
      ...shadows.elevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
  league: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    backgroundColor: colors.accent + '22',
    color: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    ...typography.caption,
    marginHorizontal: 3,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
    vsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: isSmall ? spacing.sm : spacing.lg,
    },
  vsBadge: {
    backgroundColor: colors.accent + '22',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  vsText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  halftimeScore: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  kickoff: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  teamLogoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamLogoText: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
    teamName: {
      ...typography.h3,
      color: colors.textPrimary,
      fontSize: isSmall ? 16 : 18,
      fontWeight: '600',
      marginBottom: 6,
    },
    teamScore: {
      ...typography.h1,
      color: colors.accent,
      fontSize: isSmall ? 28 : 36,
      fontWeight: '700',
      marginTop: spacing.xs,
    },
    section: {
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.xl,
      padding: cardPadding,
      marginBottom: spacing.md,
      ...shadows.card,
    },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
    sectionTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: isSmall ? 18 : typography.h2.fontSize,
    },
  lockedBadge: {
    backgroundColor: colors.warning + '22',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  lockedText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  predictionCard: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  predictionCardLocked: {
    opacity: 0.6,
    borderColor: colors.warning + '44',
    backgroundColor: colors.bgTertiary + '88',
  },
  predictionContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lockIcon: {
    marginLeft: spacing.xs,
  },
  lockIconText: {
    fontSize: 12,
  },
  predictionStatContainer: {
    alignItems: 'center',
  },
  predictionTitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  predictionValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 6,
  },
  predictionValueLocked: {
    color: colors.textMuted,
    fontSize: 16,
  },
  lockedMessage: {
    color: colors.textTertiary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  lockedInfoCard: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedInfoIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  lockedInfoTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lockedInfoMessage: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  predictionStat: {
    ...typography.h3,
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  detailedPrediction: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm + 2,
    ...shadows.subtle,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  predictionConfidence: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
  },
  confidenceBadge: {
    backgroundColor: colors.accent + '22',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  oddsCard: {
    marginBottom: spacing.sm + 2,
  },
  oddsInnerCard: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md + 2,
    padding: spacing.md,
    marginTop: spacing.sm + 2,
    ...shadows.subtle,
  },
  oddsTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  oddsLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
  oddsValues: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  oddsValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
    upcomingCard: {
      width: isSmall ? 180 : 220,
      backgroundColor: colors.bgTertiary,
      borderRadius: borderRadius.xl,
      padding: cardPadding,
      marginRight: spacing.md,
      ...shadows.card,
    },
  upcomingRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    marginTop: 6,
  },
  upcomingOpponent: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  upcomingMeta: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
    metaValue: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
};

const styles = getStyles();

