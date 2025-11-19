import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { extractHighlightPredictions } from '@/lib/match-helpers';
import { useMatches } from '@/hooks/useMatches';
import { TIMEZONE_PRESETS, useLocale, type TimeFormatPreference } from '@/providers/locale-provider';
import { useTranslation } from '@/hooks/useTranslation';
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
import { getContainerPadding, getCardPadding, getMaxContentWidth, getResponsiveSpacing, screenDimensions, isMediumScreen } from '@/lib/responsive';
import { getStatusKey, STATUS_TRANSLATION_KEYS } from '@/lib/status-labels';
import type { MatchDetail } from '@/types/match';
import {
  formatUpcomingDateText,
  localizeOutcomeLabel,
  localizePredictionTitle,
} from '@/lib/i18n/localize-match-data';
import { formatDateTime } from '@/lib/datetime';
import {
  buildAdvancedMetrics,
  generateInsightSentences,
} from '@/lib/advanced-insights';
import { requestMatchReanalysis } from '@/lib/api';

const UPCOMING_ROLE_KEY_MAP: Record<string, string> = {
  home: 'matchDetail.upcomingMatchTags.home',
  ev: 'matchDetail.upcomingMatchTags.home',
  evsahibi: 'matchDetail.upcomingMatchTags.home',
  evsahibitakim: 'matchDetail.upcomingMatchTags.home',
  hometeam: 'matchDetail.upcomingMatchTags.home',
  local: 'matchDetail.upcomingMatchTags.home',
  casa: 'matchDetail.upcomingMatchTags.home',
  host: 'matchDetail.upcomingMatchTags.home',
  away: 'matchDetail.upcomingMatchTags.away',
  dep: 'matchDetail.upcomingMatchTags.away',
  deplasman: 'matchDetail.upcomingMatchTags.away',
  deplasmantakimi: 'matchDetail.upcomingMatchTags.away',
  awayteam: 'matchDetail.upcomingMatchTags.away',
  visitante: 'matchDetail.upcomingMatchTags.away',
  visitor: 'matchDetail.upcomingMatchTags.away',
  neutral: 'matchDetail.upcomingMatchTags.neutral',
  neutr: 'matchDetail.upcomingMatchTags.neutral',
  neutralteam: 'matchDetail.upcomingMatchTags.neutral',
  neutraltakim: 'matchDetail.upcomingMatchTags.neutral',
  form: 'matchDetail.upcomingMatchTags.form',
  formda: 'matchDetail.upcomingMatchTags.form',
};

const DEFAULT_UPCOMING_ROLE_KEY = 'matchDetail.upcomingMatchTags.neutral';

function getUpcomingRoleLabel(role: string | null | undefined, t: (key: string, params?: Record<string, string | number>) => string) {
  if (!role) return t(DEFAULT_UPCOMING_ROLE_KEY);
  const normalized = role
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
  if (!normalized) return t(DEFAULT_UPCOMING_ROLE_KEY);
  const key = UPCOMING_ROLE_KEY_MAP[normalized];
  return key ? t(key) : t(DEFAULT_UPCOMING_ROLE_KEY);
}

function localizeScoreboardInfo(
  entry: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  options?: {
    locale: string;
    timezone?: string;
    kickoffIsoUtc?: string | null;
    fallbackKickoff?: string | null;
    timeFormat: TimeFormatPreference;
  },
) {
  if (!entry) return '';
  const normalized = entry
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (normalized.includes('guncel') || normalized.includes('update')) {
    const parts = entry.split(/[:\-]/);
    const suffix = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
    const label = t('match.lastUpdate');
    return suffix ? `${label}: ${suffix}` : label;
  }
  if (options?.kickoffIsoUtc && /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(normalized)) {
    const formatted = formatDateTime(options.kickoffIsoUtc, options.locale, options.timezone, options.timeFormat);
    if (formatted) {
      return formatted;
    }
  }
  if (options?.fallbackKickoff && /\d{1,2}[./-]\d{1,2}/.test(normalized)) {
    return options.fallbackKickoff;
  }
  return entry;
}
type TeamInfo = { name?: string | null; logo?: string | null; score?: number | null };
type Outcome = { label?: string | null; valuePercent?: number | null };
type OddsRow = { label?: string | null; values?: string[] | null };

export default function MatchDetailScreen() {
  const { matchId, date, view } = useLocalSearchParams<{ matchId: string; date?: string; view?: string }>();
  const router = useRouter();
  const { locale, timezone, timeFormat, getTimezonePreset } = useLocale();
  const t = useTranslation();
  const { getMatchDetail, getOrFetchMatchDetail, getPendingMatch } = useMatches();
  const numericId = matchId ? Number(matchId) : null;
  const dateParam = date || undefined;
  const viewParam = (view as 'today' | 'tomorrow' | 'manual' | undefined) || undefined;
  
  // Get cached detail for specific date if provided
  const cachedDetail = numericId ? (dateParam ? getMatchDetail(numericId, dateParam) : getMatchDetail(numericId)) ?? null : null;
  const pendingInfo = numericId ? (dateParam ? getPendingMatch(numericId, dateParam) : getPendingMatch(numericId)) : undefined;
  const [detail, setDetail] = useState<MatchDetail | null>(cachedDetail);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reanalyzeLoading, setReanalyzeLoading] = useState(false);
  const [reanalyzeFeedback, setReanalyzeFeedback] = useState<string | null>(null);
  const [reanalyzeError, setReanalyzeError] = useState<string | null>(null);
  const [reanalyzeNextAllowedAt, setReanalyzeNextAllowedAt] = useState<string | null>(null);

  const fetchDetail = useCallback(async (showLoading = true, retryCount = 0) => {
    if (!numericId) {
      setError(t('matchDetail.invalidMatchId'));
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
      const options = dateParam || viewParam ? { date: dateParam, view: viewParam } : undefined;
      console.log('[MatchDetail] Fetching detail for:', numericId, options, retryCount > 0 ? `(retry ${retryCount})` : '');
      const response = await getOrFetchMatchDetail(numericId, options);
      if (response) {
          console.log('[MatchDetail] Detail loaded successfully:', numericId, 'date:', response.dataDate);
          setDetail(response);
          setError(null);
          if (!showLoading) {
            setLastRefreshTime(new Date());
          }
      } else {
        // Response null ise pending olabilir - pending state provider'dan kontrol edilecek
        // Cache'de varsa onu göster
        if (cachedDetail) {
          setDetail(cachedDetail);
        }
        // Pending durumu UI'da gösterilecek, burada hata gösterme
        setLoading(false);
        setRefreshing(false);
        return;
      }
    } catch (err) {
      console.error('[MatchDetail] Fetch failed:', numericId, err);
      const errorMessage = err instanceof Error ? err.message : t('match.detailError');
      
      // Cache'de varsa onu göster
      if (cachedDetail) {
        setDetail(cachedDetail);
        setError(t('matchDetail.cacheMessage'));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [numericId, dateParam, viewParam, getOrFetchMatchDetail, cachedDetail, t]);

  // No neighbor prefetching - queue handles requests when user actually navigates to them

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
  }, [numericId, dateParam, viewParam]); // matchId, date veya view değiştiğinde yeniden fetch et

const predictions = extractHighlightPredictions(detail, 5, t);
  const scoreboard = detail?.scoreboard;
  const timezonePreset = getTimezonePreset();
  const fallbackTimezoneLabel = timezonePreset
    ? t(timezonePreset.labelKey)
    : timezone;
  const kickoffTimezoneLabel = (() => {
    if (!scoreboard) return null;
    if (scoreboard.kickoffTimezoneId) {
      const preset = TIMEZONE_PRESETS.find((item) => item.id === scoreboard.kickoffTimezoneId);
      if (preset) {
        return t(preset.labelKey);
      }
    }
    if (scoreboard.kickoffTimezone && !/^\s*tr\s*$/i.test(scoreboard.kickoffTimezone.trim())) {
      return scoreboard.kickoffTimezone;
    }
    return fallbackTimezoneLabel;
  })();
const kickoffDisplay = (() => {
  if (!scoreboard) return null;
  if (scoreboard.kickoffIsoUtc) {
    const formatted = formatDateTime(scoreboard.kickoffIsoUtc, locale, timezone, timeFormat);
    if (formatted) {
      return formatted;
    }
  }
  if (scoreboard.kickoffTimeDisplay) {
    return scoreboard.kickoffTimeDisplay;
  }
  if (scoreboard.kickoff) {
    return scoreboard.kickoff;
  }
  return null;
})();
const scoreboardInfoTexts =
  scoreboard?.info
    ?.map((info) =>
      localizeScoreboardInfo(info ?? '', t, {
        locale,
        timezone,
        kickoffIsoUtc: scoreboard.kickoffIsoUtc ?? null,
        fallbackKickoff: kickoffDisplay,
        timeFormat,
      }),
    )
    ?.filter((info) => Boolean(info && info.trim())) ?? [];
const detailPredictions = detail?.detailPredictions ?? [];
const oddsTrends = detail?.oddsTrends ?? [];
const upcoming = detail?.upcomingMatches ?? [];
const formattedLastUpdatedAt = detail?.lastUpdatedAt
  ? formatDateTime(detail.lastUpdatedAt, locale, timezone, timeFormat)
  : null;
const advancedMetrics = useMemo(() => (detail ? buildAdvancedMetrics(detail) : null), [detail]);
const weightedScoreInsights = advancedMetrics?.weightedScore;
const momentumInsights = advancedMetrics?.momentum;
const confidenceBlend = advancedMetrics?.confidenceBlend;
const poissonEstimates = advancedMetrics?.poisson;
const goalTrends = advancedMetrics?.goalTrends;
const confidenceLadder = advancedMetrics?.confidenceLadder ?? [];
const overUnderLadder = advancedMetrics?.overUnderLadder ?? [];
const handicapInsight = advancedMetrics?.handicapInsight ?? null;
const halfComparison = advancedMetrics?.halfComparison ?? null;
const insightSentences = useMemo(
  () => (detail && advancedMetrics ? generateInsightSentences(detail, advancedMetrics) : []),
  [detail, advancedMetrics],
);
const homeTeamLabel = scoreboard?.homeTeam?.name || t('matchDetail.teams.homeFallback');
const awayTeamLabel = scoreboard?.awayTeam?.name || t('matchDetail.teams.awayFallback');
const reanalyzeNextAllowedLabel = useMemo(() => {
  if (!reanalyzeNextAllowedAt) return null;
  const formatted = formatDateTime(reanalyzeNextAllowedAt, locale, timezone, timeFormat);
  if (!formatted) return null;
  return t('matchDetail.reanalyze.nextAllowed', { time: formatted });
}, [reanalyzeNextAllowedAt, locale, timezone, timeFormat, t]);
const isReanalyzeDisabled =
  reanalyzeLoading ||
  (reanalyzeNextAllowedAt ? new Date(reanalyzeNextAllowedAt).getTime() > Date.now() : false);

const handleReanalyzeRequest = useCallback(async () => {
  if (!numericId || reanalyzeLoading) {
    return;
  }
  setReanalyzeLoading(true);
  setReanalyzeError(null);
  try {
    const response = await requestMatchReanalysis(numericId, {
      locale,
      date: detail?.dataDate ?? dateParam,
      view: detail?.viewContext ?? viewParam,
    });
    const messageKey = response.alreadyQueued
      ? 'matchDetail.reanalyze.alreadyQueued'
      : 'matchDetail.reanalyze.queued';
    setReanalyzeFeedback(
      t(messageKey, {
        position: response.queuePosition ?? 0,
      }),
    );
    if (response.nextAllowedAt) {
      setReanalyzeNextAllowedAt(response.nextAllowedAt);
    }
  } catch (err) {
    const apiError = err as Error & { status?: number; body?: any };
    const body = apiError.body;
    if (body?.nextAllowedAt) {
      setReanalyzeNextAllowedAt(body.nextAllowedAt);
    }
    if (apiError.status === 429) {
      setReanalyzeError(t('matchDetail.reanalyze.rateLimited'));
    } else {
      setReanalyzeError(t('matchDetail.reanalyze.error'));
    }
    setReanalyzeFeedback(null);
  } finally {
    setReanalyzeLoading(false);
  }
}, [numericId, reanalyzeLoading, locale, detail?.dataDate, dateParam, detail?.viewContext, viewParam, t]);
const scoreboardBadges: Array<{ icon: 'time' | 'information-circle' | 'refresh'; label: string }> = [];
if (kickoffDisplay) {
  scoreboardBadges.push({
    icon: 'time',
    label: kickoffDisplay,
  });
}
if (kickoffTimezoneLabel) {
  scoreboardBadges.push({
    icon: 'information-circle',
    label: t('matchDetail.scoreboard.timezoneLabel', { timezone: kickoffTimezoneLabel }),
  });
}
if (formattedLastUpdatedAt) {
  scoreboardBadges.push({
    icon: 'refresh',
    label: `${t('match.lastUpdate')}: ${formattedLastUpdatedAt}`,
  });
}

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={getStyles().container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDetail(false)}
            tintColor={colors.accent}
            colors={[colors.accent]}
            title={t('home.refreshing')}
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
        ) : pendingInfo && !detail ? (
          <View style={getStyles().pendingContainer}>
            <EmptyState
              icon="robot"
              title={t('match.pendingAnalysis')}
              message={t('match.pendingMessage', { position: pendingInfo.queuePosition })}
              action={
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    style={getStyles().retryButton}
                    onPress={() => fetchDetail(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={getStyles().retryText}>{t('match.refresh')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[getStyles().retryButton, getStyles().backButton]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                  >
                    <Text style={getStyles().backButtonText}>{t('common.back')}</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        ) : error ? (
          <View style={getStyles().errorBox}>
            <EmptyState
              icon="error"
              title={t('match.detailError')}
              message={`${error}\n\n${t('match.detailErrorMessage')}`}
              action={
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    style={getStyles().retryButton}
                    onPress={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        const options = dateParam || viewParam ? { date: dateParam, view: viewParam } : undefined;
                        const response = await getOrFetchMatchDetail(numericId!, options);
                        if (response) {
                          setDetail(response);
                        } else {
                          setError(t('matchDetail.detailNotFound'));
                        }
                      } catch (err) {
                        setError((err as Error).message || t('matchDetail.reloadFailed'));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={getStyles().retryText}>{t('common.retry')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[getStyles().retryButton, getStyles().backButton]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                  >
                    <Text style={getStyles().backButtonText}>{t('common.back')}</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        ) : detail ? (
          <>
            <View style={getStyles().scoreboard}>
              {/* League & Status */}
              <View style={getStyles().scoreboardHeader}>
                <Text style={getStyles().league} numberOfLines={1} ellipsizeMode="tail">
                  {scoreboard?.leagueLabel || t('matchDetail.leagueInfo')}
                </Text>
                {scoreboard?.statusBadges?.length ? (
                  <View style={getStyles().badgeRow}>
                    {scoreboard.statusBadges.map((badge, idx) => {
                      const badgeKey = getStatusKey(badge);
                      const badgeText = badgeKey ? t(STATUS_TRANSLATION_KEYS[badgeKey]) : badge;
                      const isLive = badgeKey === 'live';
                      return (
                        <LiveBadge
                          key={`${badge}-${idx}`}
                          text={badgeText}
                          isLive={isLive}
                        />
                      );
                    })}
                  </View>
                ) : null}
              </View>

              {/* Teams & Score */}
              <View style={getStyles().teamsRow}>
                {/* Home Team */}
                <View style={getStyles().teamSection}>
                  <View style={getStyles().teamColumn}>
                    <Avatar
                      name={scoreboard?.homeTeam?.name || ''}
                      logo={scoreboard?.homeTeam?.logo}
                      size={screenDimensions.isSmall ? 40 : 48}
                    />
                    <View style={getStyles().teamNameContainer}>
                      <Text 
                        style={getStyles().teamName} 
                        numberOfLines={2} 
                        ellipsizeMode="tail"
                        allowFontScaling={false}
                      >
                        {scoreboard?.homeTeam?.name || t('common.unknown')}
                      </Text>
                    </View>
                    {(() => {
                      const homeForm = detail.recentForm?.[0];
                      const formResults = homeForm?.matches?.slice(0, 5).map((m) => m.result) || [];
                      return formResults.length > 0 ? (
                        <View style={getStyles().teamFormContainer}>
                          {formResults.map((result, idx) => {
                            const isWin = result === 'W';
                            const isDraw = result === 'D';
                            const isLoss = result === 'L';
                            return (
                              <Text
                                key={idx}
                                style={[
                                  getStyles().teamFormChar,
                                  isWin && getStyles().teamFormWin,
                                  isDraw && getStyles().teamFormDraw,
                                  isLoss && getStyles().teamFormLoss,
                                ]}
                              >
                                {result || '?'}
                              </Text>
                            );
                          })}
                        </View>
                      ) : null;
                    })()}
                  </View>
                </View>

                {/* Score */}
                <View style={getStyles().scoreSection}>
                  {typeof scoreboard?.homeTeam?.score === 'number' &&
                  typeof scoreboard?.awayTeam?.score === 'number' ? (
                    <>
                      <Text style={getStyles().score}>
                        {scoreboard.homeTeam.score} - {scoreboard.awayTeam.score}
                      </Text>
                      {scoreboard?.halftimeScore ? (
                        <Text style={getStyles().halftimeScore}>{scoreboard.halftimeScore}</Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={getStyles().vsText}>{t('match.vs')}</Text>
                  )}
                </View>

                {/* Away Team */}
                <View style={[getStyles().teamSection, getStyles().teamSectionRight]}>
                  <View style={getStyles().teamColumn}>
                    <Avatar
                      name={scoreboard?.awayTeam?.name || ''}
                      logo={scoreboard?.awayTeam?.logo}
                      size={screenDimensions.isSmall ? 40 : 48}
                    />
                    <View style={getStyles().teamNameContainer}>
                      <Text 
                        style={getStyles().teamName} 
                        numberOfLines={2} 
                        ellipsizeMode="tail"
                        allowFontScaling={false}
                      >
                        {scoreboard?.awayTeam?.name || t('common.unknown')}
                      </Text>
                    </View>
                    {(() => {
                      const awayForm = detail.recentForm?.[1];
                      const formResults = awayForm?.matches?.slice(0, 5).map((m) => m.result) || [];
                      return formResults.length > 0 ? (
                        <View style={getStyles().teamFormContainer}>
                          {formResults.map((result, idx) => {
                            const isWin = result === 'W';
                            const isDraw = result === 'D';
                            const isLoss = result === 'L';
                            return (
                              <Text
                                key={idx}
                                style={[
                                  getStyles().teamFormChar,
                                  isWin && getStyles().teamFormWin,
                                  isDraw && getStyles().teamFormDraw,
                                  isLoss && getStyles().teamFormLoss,
                                ]}
                              >
                                {result || '?'}
                              </Text>
                            );
                          })}
                        </View>
                      ) : null;
                    })()}
                  </View>
                </View>
              </View>

              {/* Meta Info */}
              {scoreboardBadges.length ? (
                <View style={getStyles().metaBadgeRow}>
                  {scoreboardBadges.map((item, idx) => (
                    <View key={`${item.label}-${idx}`} style={getStyles().metaBadge}>
                      <Icon
                        name={item.icon}
                        size={14}
                        color={colors.accent}
                        style={getStyles().metaBadgeIcon}
                      />
                      <Text style={getStyles().metaBadgeText} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={getStyles().kickoff} numberOfLines={2} ellipsizeMode="tail">
                  {kickoffDisplay || formattedLastUpdatedAt || t('matchDetail.scoreboard.kickoffFallback')}
                </Text>
              )}
              {scoreboardInfoTexts.length ? (
                <View style={getStyles().infoChips}>
                  {scoreboardInfoTexts.map((info, idx) => (
                    <View key={`${info}-${idx}`} style={getStyles().infoChip}>
                      <Icon
                        name="information-circle"
                        size={12}
                        color={colors.textSecondary}
                        style={{ marginRight: spacing.xs / 2 }}
                      />
                      <Text style={getStyles().infoChipText} numberOfLines={1}>
                        {info}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Quick Summary */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              const comparison = compareTeams(
                homeForm,
                awayForm,
                scoreboard?.homeTeam?.name,
                scoreboard?.awayTeam?.name,
                t,
              );
              const quickSummary = getQuickSummary(detail.detailPredictions, comparison, t);
              
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
                scoreboard?.awayTeam?.name,
                t
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
                scoreboard?.awayTeam?.name,
                t,
              );
              return comparison ? (
                <View style={getStyles().section}>
                  <TeamComparisonCard comparison={comparison} />
                </View>
              ) : null;
            })()}

            {insightSentences && insightSentences.length ? (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>{t('matchDetail.insightSentences.title')}</Text>
                <View style={getStyles().insightList}>
                  {insightSentences.map((insight, idx) => {
                    const toneStyle =
                      insight.tone === 'positive'
                        ? getStyles().insightPositive
                        : insight.tone === 'warning'
                        ? getStyles().insightWarning
                        : getStyles().insightInfo;
                    const iconName =
                      insight.tone === 'positive'
                        ? 'trending-up'
                        : insight.tone === 'warning'
                        ? 'warning'
                        : 'information-circle';
                    const iconColor =
                      insight.tone === 'positive'
                        ? colors.success
                        : insight.tone === 'warning'
                        ? colors.warning
                        : colors.textSecondary;
                    const params = { ...(insight.params || {}) };
                    if (params.pick) {
                      params.pick = localizePredictionTitle(String(params.pick), t);
                    }
                    return (
                      <View key={`${insight.translationKey}-${idx}`} style={[getStyles().insightItem, toneStyle]}>
                        <Icon name={iconName} size={16} color={iconColor} style={getStyles().insightIcon} />
                        <Text style={getStyles().insightText}>
                          {t(insight.translationKey, params as Record<string, string | number>)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Risk Analysis */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || t('matchDetail.teams.homeFallback');
              const awayTeamName = scoreboard?.awayTeam?.name || t('matchDetail.teams.awayFallback');

              return (
                <View style={getStyles().section}>
                  <RiskAnalysisCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                  />
                </View>
              );
            })()}

            {(() => {
              const showWeighted =
                Boolean(weightedScoreInsights?.home !== null || weightedScoreInsights?.away !== null);
              const showMomentum =
                Boolean(momentumInsights?.home !== null || momentumInsights?.away !== null);
              const showConfidence = Boolean(confidenceBlend);
              const showPoisson = Boolean(poissonEstimates);
              if (!showWeighted && !showMomentum && !showConfidence && !showPoisson) {
                return null;
              }
              const renderMetricBar = (score: number | null | undefined) => (
                <View style={getStyles().metricBarTrack}>
                  <View
                    style={[
                      getStyles().metricBarFill,
                      { width: `${Math.max(0, Math.min(100, score || 0))}%` },
                    ]}
                  />
                </View>
              );
              const formatMomentumLabel = (value: number | null | undefined) => {
                const descriptor = getMomentumDescriptor(value);
                if (!descriptor) return null;
                return t(`matchDetail.advancedMetrics.momentum.${descriptor}`);
              };
              const formatGoalBucket = (bucket: string) =>
                bucket === '3+'
                  ? t('matchDetail.advancedMetrics.poisson.goalLabelPlus')
                  : t('matchDetail.advancedMetrics.poisson.goalLabel', { value: bucket });
              const sampleLabel =
                weightedScoreInsights?.sampleSize && weightedScoreInsights.sampleSize > 0
                  ? t('matchDetail.advancedMetrics.sampleLabel', {
                      matches: weightedScoreInsights.sampleSize,
                    })
                  : null;

              return (
                <View style={getStyles().section}>
                  <Text style={getStyles().sectionTitle}>{t('matchDetail.advancedMetrics.title')}</Text>

                  {showWeighted ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.weightedScore.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.weightedScore.description')}
                        </Text>
                      </View>
                      <View style={getStyles().metricRow}>
                        <View style={getStyles().metricLabelBlock}>
                          <Text style={getStyles().metricLabel}>
                            {t('matchDetail.advancedMetrics.weightedScore.homeLabel')}
                          </Text>
                          <Text style={getStyles().metricSubLabel}>{homeTeamLabel}</Text>
                        </View>
                        <View style={getStyles().metricValueBlock}>
                          {renderMetricBar(weightedScoreInsights?.home)}
                          <Text style={getStyles().metricValue}>
                            {typeof weightedScoreInsights?.home === 'number'
                              ? `${weightedScoreInsights.home}%`
                              : '--'}
                          </Text>
                        </View>
                      </View>
                      <View style={getStyles().metricRow}>
                        <View style={getStyles().metricLabelBlock}>
                          <Text style={getStyles().metricLabel}>
                            {t('matchDetail.advancedMetrics.weightedScore.awayLabel')}
                          </Text>
                          <Text style={getStyles().metricSubLabel}>{awayTeamLabel}</Text>
                        </View>
                        <View style={getStyles().metricValueBlock}>
                          {renderMetricBar(weightedScoreInsights?.away)}
                          <Text style={getStyles().metricValue}>
                            {typeof weightedScoreInsights?.away === 'number'
                              ? `${weightedScoreInsights.away}%`
                              : '--'}
                          </Text>
                        </View>
                      </View>
                      {sampleLabel ? <Text style={getStyles().metricHint}>{sampleLabel}</Text> : null}
                    </View>
                  ) : null}

                  {showMomentum ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.momentum.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.momentum.description')}
                        </Text>
                      </View>
                      <View style={getStyles().momentumRow}>
                        <View>
                          <Text style={getStyles().metricLabel}>{homeTeamLabel}</Text>
                          <Text style={getStyles().momentumValue}>
                            {typeof momentumInsights?.home === 'number'
                              ? `${momentumInsights.home > 0 ? '+' : ''}${momentumInsights.home}`
                              : '--'}
                          </Text>
                        </View>
                        <View style={getStyles().momentumBadge}>
                          <Text style={getStyles().momentumBadgeText}>
                            {formatMomentumLabel(momentumInsights?.home) || '--'}
                          </Text>
                        </View>
                      </View>
                      <View style={getStyles().momentumRow}>
                        <View>
                          <Text style={getStyles().metricLabel}>{awayTeamLabel}</Text>
                          <Text style={getStyles().momentumValue}>
                            {typeof momentumInsights?.away === 'number'
                              ? `${momentumInsights.away > 0 ? '+' : ''}${momentumInsights.away}`
                              : '--'}
                          </Text>
                        </View>
                        <View style={getStyles().momentumBadge}>
                          <Text style={getStyles().momentumBadgeText}>
                            {formatMomentumLabel(momentumInsights?.away) || '--'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {showConfidence ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.confidence.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.confidence.description')}
                        </Text>
                      </View>
                      <View style={getStyles().confidenceRow}>
                        <View style={getStyles().confidenceValueBlock}>
                          <Text style={getStyles().metricLabel}>
                            {t('matchDetail.advancedMetrics.confidence.scoreLabel')}
                          </Text>
                          <Text style={getStyles().confidenceValue}>
                            {confidenceBlend?.score ? `${confidenceBlend.score}%` : '--'}
                          </Text>
                        </View>
                        <View style={getStyles().confidenceValueBlock}>
                          <Text style={getStyles().metricLabel}>
                            {t('matchDetail.advancedMetrics.confidence.topPickLabel')}
                          </Text>
                          <Text style={getStyles().metricValue}>
                            {confidenceBlend?.topPick?.label
                              ? localizePredictionTitle(confidenceBlend.topPick.label, t)
                              : t('matchDetail.advancedMetrics.confidence.noPick')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {showPoisson && poissonEstimates ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.poisson.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.poisson.description')}
                        </Text>
                      </View>
                      <View style={getStyles().poissonRow}>
                        <Text style={getStyles().metricLabel}>
                          {t('matchDetail.advancedMetrics.poisson.expectedHeader')}
                        </Text>
                        <View style={getStyles().poissonExpected}>
                          <Text style={getStyles().poissonExpectedValue}>
                            {homeTeamLabel}: {poissonEstimates.home.lambda.toFixed(2)} xG
                          </Text>
                          <Text style={getStyles().poissonExpectedValue}>
                            {awayTeamLabel}: {poissonEstimates.away.lambda.toFixed(2)} xG
                          </Text>
                        </View>
                      </View>
                      <View style={getStyles().poissonTable}>
                        <View style={getStyles().poissonTableHeader}>
                          <Text style={getStyles().poissonColumnLabelGoal}>
                            {t('matchDetail.advancedMetrics.poisson.goalColumn')}
                          </Text>
                          <Text style={getStyles().poissonColumnLabelValue}>{homeTeamLabel}</Text>
                          <Text style={getStyles().poissonColumnLabelValue}>{awayTeamLabel}</Text>
                        </View>
                        {poissonEstimates.home.probabilities.map((entry, idx) => {
                          const awayEntry = poissonEstimates.away.probabilities[idx];
                          return (
                            <View key={entry.bucket} style={getStyles().poissonTableRow}>
                              <Text style={getStyles().poissonRowLabel}>
                                {formatGoalBucket(entry.bucket)}
                              </Text>
                              <Text style={getStyles().poissonRowValue}>{entry.percent}%</Text>
                              <Text style={getStyles().poissonRowValue}>
                                {awayEntry ? `${awayEntry.percent}%` : '--'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}

                  {goalTrends && (goalTrends.home || goalTrends.away) ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.goalTrend.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.goalTrend.description')}
                        </Text>
                      </View>
                      <View style={getStyles().trendTable}>
                        <View style={getStyles().trendHeader}>
                          <Text style={getStyles().trendTeam}>{t('matchDetail.advancedMetrics.goalTrend.team')}</Text>
                          <Text style={getStyles().trendValue}>
                            {t('matchDetail.advancedMetrics.goalTrend.forLabel')}
                          </Text>
                          <Text style={getStyles().trendValue}>
                            {t('matchDetail.advancedMetrics.goalTrend.againstLabel')}
                          </Text>
                          <Text style={getStyles().trendValue}>
                            {t('matchDetail.advancedMetrics.goalTrend.deltaLabel')}
                          </Text>
                        </View>
                        {[{ label: homeTeamLabel, data: goalTrends.home }, { label: awayTeamLabel, data: goalTrends.away }].map(
                          (row) =>
                            row.data && (
                              <View key={row.label} style={getStyles().trendRow}>
                                <Text style={getStyles().trendTeam}>{row.label}</Text>
                                <Text style={getStyles().trendValue}>{row.data.goalsFor}</Text>
                                <Text style={getStyles().trendValue}>{row.data.goalsAgainst}</Text>
                                <Text
                                  style={[
                                    getStyles().trendValue,
                                    row.data.delta >= 0 ? getStyles().positiveText : getStyles().negativeText,
                                  ]}
                                >
                                  {row.data.delta >= 0 ? `+${row.data.delta}` : row.data.delta}
                                </Text>
                              </View>
                            ),
                        )}
                      </View>
                    </View>
                  ) : null}

                  {confidenceLadder.length ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.confidenceLadder.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.confidenceLadder.description')}
                        </Text>
                      </View>
                      <View style={getStyles().ladderList}>
                        {confidenceLadder.map((entry, idx) => {
                          const tone = entry.confidence >= 75 ? colors.success : entry.confidence >= 50 ? colors.warning : colors.error;
                          return (
                            <View key={`${entry.title}-${idx}`} style={getStyles().ladderItem}>
                              <View style={getStyles().ladderInfo}>
                                <Text style={getStyles().ladderTitle}>
                                  {localizePredictionTitle(entry.title, t)}
                                </Text>
                                <Text style={[getStyles().ladderPercent, { color: tone }]}>
                                  %{entry.confidence}
                                </Text>
                              </View>
                              <View style={getStyles().metricBarTrack}>
                                <View style={[getStyles().metricBarFill, { width: `${entry.confidence}%`, backgroundColor: tone }]} />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}

                  {overUnderLadder.length ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.overUnder.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.overUnder.description')}
                        </Text>
                      </View>
                      <View style={getStyles().overTable}>
                        {overUnderLadder.map((entry, idx) => (
                          <View key={`${entry.label}-${idx}`} style={getStyles().overRow}>
                            <Text style={getStyles().overLabel}>{localizeOutcomeLabel(entry.label, t)}</Text>
                            <Text
                              style={[
                                getStyles().overValue,
                                entry.isOver ? getStyles().positiveText : getStyles().negativeText,
                              ]}
                            >
                              %{entry.percent}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}

                  {handicapInsight ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.handicap.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.handicap.description')}
                        </Text>
                      </View>
                      <Text style={getStyles().handicapLabel}>{handicapInsight.label}</Text>
                      <Text style={getStyles().handicapValue}>{handicapInsight.value}</Text>
                    </View>
                  ) : null}

                  {halfComparison?.firstHalf?.length && halfComparison?.fullTime?.length ? (
                    <View style={getStyles().metricCard}>
                      <View style={getStyles().metricHeader}>
                        <Text style={getStyles().metricTitle}>
                          {t('matchDetail.advancedMetrics.halfComparison.title')}
                        </Text>
                        <Text style={getStyles().metricDescription}>
                          {t('matchDetail.advancedMetrics.halfComparison.description')}
                        </Text>
                      </View>
                      {halfComparison.firstHalf.slice(0, 3).map((entry, idx) => {
                        const full = halfComparison.fullTime[idx];
                        return (
                          <View key={`${entry.label}-${idx}`} style={getStyles().overRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={getStyles().ladderTitle}>
                                {localizePredictionTitle(entry.label, t)}
                              </Text>
                              <Text style={getStyles().ladderPercent}>
                                {t('matchDetail.advancedMetrics.halfComparison.halfLabel', { value: entry.percent })}
                              </Text>
                            </View>
                            {full ? (
                              <Text style={getStyles().ladderPercent}>
                                {t('matchDetail.advancedMetrics.halfComparison.fullLabel', { value: full.percent })}
                              </Text>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
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
              const homeTeamName = scoreboard?.homeTeam?.name || t('matchDetail.teams.homeFallback');
              const awayTeamName = scoreboard?.awayTeam?.name || t('matchDetail.teams.awayFallback');

              return (
                <View style={getStyles().section}>
                  <StrengthsWeaknessesCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                  />
                </View>
              );
            })()}

            {/* Goal Analysis */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || t('matchDetail.teams.homeFallback');
              const awayTeamName = scoreboard?.awayTeam?.name || t('matchDetail.teams.awayFallback');

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

            <View style={getStyles().section}>
              <Text style={getStyles().sectionTitle}>{t('matchDetail.detailedPredictions')}</Text>
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
                <EmptyState icon="empty" title={t('matchDetail.noDetailedAnalysis')} message={t('matchDetail.noDetailedAnalysisMessage')} />
              )}
            </View>

            {/* Prediction Summary */}
            {detailPredictions.length > 0 ? (
              <View style={getStyles().section}>
                <PredictionSummaryCard predictions={detailPredictions} />
              </View>
            ) : locale !== 'tr' ? (
              <View style={getStyles().section}>
                <EmptyState 
                  icon="information-circle" 
                  title={t('matchDetail.predictionsNotAvailable')} 
                  message={t('matchDetail.predictionsNotAvailableMessage')} 
                />
              </View>
            ) : null}

            {/* Visual Comparison */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || t('matchDetail.teams.homeFallback');
              const awayTeamName = scoreboard?.awayTeam?.name || t('matchDetail.teams.awayFallback');

              return (
                <View style={getStyles().section}>
                  <VisualComparisonCard
                    homeTeam={{ name: homeTeamName, stats: homeStats }}
                    awayTeam={{ name: awayTeamName, stats: awayStats }}
                  />
                </View>
              );
            })()}

            {detail.recentForm && detail.recentForm.length > 0 && (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>{t('matchDetail.formStatsTitle')}</Text>
                {detail.recentForm.map((form, index) => {
                  const stats = calculateFormStats(form.matches || []);
                  const teamName =
                    form.title
                      ?.replace(/^[^A-Za-z0-9]+/, '')
                      .replace(/\s*-\s*Son Form/, '')
                      .trim() || t('matchDetail.teams.formFallback', { index: index + 1 });
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
                <Text style={getStyles().sectionTitle}>{t('matchDetail.recentForm')}</Text>
                {detail.recentForm.map((form, index) => (
                  <RecentFormCard
                    key={index}
                    title={form.title || t('matchDetail.recentFormCard.titleFallback')}
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
                <Text style={getStyles().sectionTitle}>{t('matchDetail.oddsTrends')}</Text>
                {oddsTrends.map((trend, idx) => (
                  <OddsTrendCard
                    key={`${trend.title}-${idx}`}
                    title={trend.title || t('matchDetail.oddsTrends')}
                    cards={trend.cards || []}
                  />
                ))}
              </View>
            ) : null}

            {upcoming.length ? (
              <View style={getStyles().section}>
                <Text style={getStyles().sectionTitle}>{t('matchDetail.upcomingMatches')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {upcoming.map((team, idx) => (
                    <View key={`${team.team}-${idx}`} style={getStyles().upcomingCard}>
                      <Text style={getStyles().predictionTitle} numberOfLines={1} ellipsizeMode="tail">
                        {(team.team || t('common.unknown')) + ' • ' + getUpcomingRoleLabel(team.role, t)}
                      </Text>
                      {team.matches?.length ? (
                        team.matches.map((match, matchIdx) => (
                          <View key={`${match?.opponent}-${matchIdx}`} style={getStyles().upcomingRow}>
                            <Text style={getStyles().upcomingOpponent} numberOfLines={1}>
                              {match?.opponent || t('common.unknown')}
                            </Text>
                            <Text style={getStyles().upcomingMeta} numberOfLines={1}>
                              {match?.competition || ''}
                            </Text>
                            <Text style={getStyles().upcomingMeta} numberOfLines={1}>
                              {formatUpcomingDateText(match?.dateText, locale, detail?.dataDate, timezone, timeFormat) || ''}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={getStyles().upcomingMeta}>
                          {t('matchDetail.upcomingMatchesEmpty')}
                        </Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={getStyles().section}>
                <EmptyState
                  icon="information-circle"
                  title={t('matchDetail.upcomingMatches')}
                  message={t('matchDetail.upcomingMatchesEmpty')}
                />
              </View>
            )}

            <View style={getStyles().section}>
              <Text style={getStyles().sectionTitle}>{t('matchDetail.localInfo')}</Text>
              <View style={getStyles().metaRow}>
                <Text style={getStyles().metaLabel}>{t('match.lastUpdate')}</Text>
                <Text style={getStyles().metaValue} numberOfLines={1}>{formattedLastUpdatedAt || '?'}</Text>
              </View>
              <View style={getStyles().metaRow}>
                <Text style={getStyles().metaLabel}>{t('match.dataSource')}</Text>
                <Text style={getStyles().metaValue}>{t('match.dataSourceValue')}</Text>
              </View>
              <View style={getStyles().reanalyzeCard}>
                <Text style={getStyles().reanalyzeTitle}>{t('matchDetail.reanalyze.title')}</Text>
                <Text style={getStyles().reanalyzeDescription}>
                  {t('matchDetail.reanalyze.description')}
                </Text>
                <TouchableOpacity
                  style={[
                    getStyles().reanalyzeButton,
                    (isReanalyzeDisabled || reanalyzeLoading) && getStyles().reanalyzeButtonDisabled,
                  ]}
                  onPress={handleReanalyzeRequest}
                  disabled={isReanalyzeDisabled}
                  activeOpacity={0.8}
                >
                  <Text style={getStyles().reanalyzeButtonText}>
                    {reanalyzeLoading
                      ? t('matchDetail.reanalyze.buttonLoading')
                      : t('matchDetail.reanalyze.button')}
                  </Text>
                </TouchableOpacity>
                {reanalyzeFeedback ? (
                  <Text style={getStyles().reanalyzeSuccess}>{reanalyzeFeedback}</Text>
                ) : null}
                {reanalyzeError ? (
                  <Text style={getStyles().reanalyzeError}>{reanalyzeError}</Text>
                ) : null}
                {reanalyzeNextAllowedLabel ? (
                  <Text style={getStyles().reanalyzeCooldown}>{reanalyzeNextAllowedLabel}</Text>
                ) : null}
              </View>
            </View>
          </>
        ) : (
          <Text style={getStyles().empty}>{t('match.detailNotFound')}</Text>
        )}
      </ScrollView>
    </AppShell>
  );
}

function LiveBadge({ text, isLive }: { text: string; isLive: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const styles = getStyles();

  useEffect(() => {
    if (isLive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLive, pulseAnim]);

  return (
    <View style={[styles.statusBadge, isLive && styles.statusBadgeLive]}>
      {isLive && (
        <View style={styles.livePulseContainer}>
          <Animated.View
            style={[
              styles.livePulse,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.5],
                  outputRange: [0.75, 0],
                }),
              },
            ]}
          />
          <View style={[styles.livePulse, styles.livePulseInner]} />
        </View>
      )}
      <Text style={[styles.statusBadgeText, isLive && styles.statusBadgeTextLive]} numberOfLines={1}>
        {text}
      </Text>
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
  const t = useTranslation();
  const localizedTitle = localizePredictionTitle(title, t) || t('common.prediction');
  return (
    <View style={styles.detailedPrediction}>
      <View style={styles.detailedHeader}>
        <Text style={styles.predictionTitle} numberOfLines={1} ellipsizeMode="tail">
          {localizedTitle}
        </Text>
        {confidence ? (
          <View style={styles.confidenceBadge}>
            <Text style={styles.predictionConfidence}>%{confidence}</Text>
          </View>
        ) : null}
      </View>
      {outcomes?.map((outcome, idx) => (
        <ProgressBar
          key={`${outcome?.label}-${idx}`}
          label={localizeOutcomeLabel(outcome?.label, t) || t('common.unknown')}
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
    if (value.includes('^')) return { direction: 'up', color: colors.success };
    if (value.includes('v')) return { direction: 'down', color: colors.error };
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
  const responsiveMd = getResponsiveSpacing(spacing.md);
  const responsiveSm = getResponsiveSpacing(spacing.sm);
  const responsiveLg = getResponsiveSpacing(spacing.lg);
  const responsiveXs = getResponsiveSpacing(spacing.xs);
  
  return StyleSheet.create({
    container: {
      paddingBottom: spacing.xxxl * 2.5,
      paddingHorizontal: containerPadding,
      maxWidth: getMaxContentWidth(),
      alignSelf: 'center',
      width: '100%',
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
  pendingContainer: {
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
      backgroundColor: colors.bgCard,
      borderRadius: borderRadius.xl,
      padding: cardPadding,
      marginBottom: getResponsiveSpacing(spacing.lg),
      ...shadows.card,
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
      alignSelf: 'stretch',
    },
    scoreboardHeader: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    league: {
      fontSize: isSmall ? 13 : 15,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      fontWeight: '700',
      lineHeight: isSmall ? 18 : 20,
      letterSpacing: 0.5,
      paddingHorizontal: isSmall ? spacing.sm : spacing.md,
      backgroundColor: colors.bgTertiary,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.md,
      alignSelf: 'center',
      maxWidth: '95%',
      flexShrink: 1,
    },
    badgeRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: isSmall ? spacing.sm : spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      marginHorizontal: spacing.xs / 2,
      position: 'relative',
      flexShrink: 1,
      minWidth: 0,
    },
    statusBadgeLive: {
      backgroundColor: colors.accent + '20',
    },
    livePulseContainer: {
      position: 'relative',
      width: 8,
      height: 8,
      marginRight: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    livePulse: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    livePulseInner: {
      opacity: 1,
    },
    statusBadgeText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: isSmall ? 10 : 11,
      flexShrink: 1,
    },
    statusBadgeTextLive: {
      color: colors.accent,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    teamsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.xl,
      gap: isSmall ? spacing.xs : spacing.sm,
    },
    teamSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      minWidth: 0,
      flexBasis: 0,
      maxWidth: '40%',
    },
    teamSectionRight: {
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    teamColumn: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      paddingHorizontal: isSmall ? spacing.xs / 2 : spacing.xs,
    },
    teamName: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: isSmall ? 12 : 14,
      lineHeight: isSmall ? 18 : 20,
      textAlign: 'center',
      width: '100%',
      includeFontPadding: false,
      paddingVertical: 0,
    },
    teamNameContainer: {
      width: '100%',
      minHeight: isSmall ? 38 : 42,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      paddingVertical: 2,
    },
    teamFormContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs / 2,
      marginTop: spacing.xs / 2,
    },
    teamFormChar: {
      fontSize: isSmall ? 11 : 13,
      fontWeight: '700',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      color: colors.textTertiary,
      minWidth: isSmall ? 14 : 16,
      textAlign: 'center',
    },
    teamFormWin: {
      color: colors.success,
    },
    teamFormDraw: {
      color: colors.warning,
    },
    teamFormLoss: {
      color: colors.error,
    },
    scoreSection: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isSmall ? 70 : 90,
      maxWidth: isSmall ? 80 : 100,
      paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
      paddingTop: spacing.xs,
      flexShrink: 0,
    },
    score: {
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: isSmall ? 26 : 34,
      lineHeight: isSmall ? 32 : 40,
      marginBottom: spacing.xs / 2,
      letterSpacing: -0.5,
    },
    vsText: {
      fontSize: isSmall ? 16 : 20,
      color: colors.accent,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    halftimeScore: {
      ...typography.caption,
      color: colors.textTertiary,
      fontSize: isSmall ? 10 : 11,
      fontWeight: '500',
      marginTop: spacing.xs / 2,
    },
  metaBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
      marginTop: responsiveMd,
    gap: spacing.xs / 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: isSmall ? spacing.sm : spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
    flexShrink: 1,
    minWidth: 0,
  },
  metaBadgeIcon: {
    marginRight: spacing.xs / 2,
  },
  metaBadgeText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    fontSize: isSmall ? 10 : 11,
    flexShrink: 1,
  },
  kickoff: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  infoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
      marginTop: responsiveSm,
    gap: spacing.xs / 2,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
    flexShrink: 1,
    minWidth: 0,
  },
  infoChipText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: isSmall ? 10 : 11,
    flexShrink: 1,
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
      marginBottom: responsiveMd,
      ...shadows.card,
      width: '100%',
      alignSelf: 'stretch',
    },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(spacing.md),
    gap: spacing.sm,
  },
    sectionTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: isSmall ? 16 : isMediumScreen ? 18 : typography.h2.fontSize,
      lineHeight: isSmall ? 22 : 26,
      marginBottom: responsiveMd,
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
      padding: responsiveLg,
    marginBottom: getResponsiveSpacing(spacing.md),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    gap: spacing.sm,
  },
  predictionCardLocked: {
    opacity: 0.6,
    borderColor: colors.warning + '44',
    backgroundColor: colors.bgTertiary + '88',
  },
  predictionContent: {
    flex: 1,
      marginRight: responsiveMd,
    minWidth: 0,
    flexShrink: 1,
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
    fontSize: isSmall ? 18 : 20,
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
      padding: responsiveMd + 2,
      marginBottom: responsiveSm + 2,
    ...shadows.subtle,
    width: '100%',
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
      marginBottom: responsiveSm + 2,
    gap: spacing.sm,
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
    padding: getResponsiveSpacing(spacing.md),
    marginTop: getResponsiveSpacing(spacing.sm + 2),
    ...shadows.subtle,
    width: '100%',
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
    alignItems: 'center',
      marginBottom: responsiveXs,
    gap: spacing.xs,
  },
  oddsLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
    fontSize: isSmall ? 11 : 12,
    flexShrink: 1,
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
    fontSize: isSmall ? 11 : 12,
    flexShrink: 0,
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
    alignItems: 'center',
      marginTop: responsiveSm,
    gap: spacing.sm,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: isSmall ? 11 : 12,
    flexShrink: 0,
  },
    metaValue: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: isSmall ? 11 : 12,
      flexShrink: 1,
      textAlign: 'right',
      flex: 1,
    },
  reanalyzeCard: {
      marginTop: responsiveLg,
    padding: getResponsiveSpacing(spacing.md),
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    width: '100%',
  },
  reanalyzeTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  reanalyzeDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  reanalyzeButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
      paddingVertical: responsiveSm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  reanalyzeButtonDisabled: {
    opacity: 0.6,
  },
  reanalyzeButtonText: {
    ...typography.bodySmall,
    color: colors.bgPrimary,
    fontWeight: '700',
  },
  reanalyzeSuccess: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  reanalyzeError: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  reanalyzeCooldown: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  ladderList: {
    gap: spacing.sm,
  },
  ladderItem: {
    marginBottom: spacing.sm,
  },
  ladderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ladderTitle: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  ladderPercent: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  trendTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  trendHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trendTeam: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1.5,
  },
  trendValue: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  overTable: {
    gap: spacing.xs,
  },
  overRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  overLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  overValue: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  handicapLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  handicapValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  metricCard: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  metricHeader: {
    marginBottom: spacing.md,
  },
  metricTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  metricLabelBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metricSubLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricValueBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  metricBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  metricValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metricHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  momentumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  momentumValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  momentumBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.bgSecondary,
  },
  momentumBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  confidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  confidenceValueBlock: {
    flex: 1,
    minWidth: 140,
  },
  confidenceValue: {
    ...typography.h2,
    color: colors.accent,
    fontWeight: '700',
  },
  poissonRow: {
    marginBottom: spacing.md,
  },
  poissonExpected: {
    marginTop: spacing.xs,
  },
  poissonExpectedValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  poissonTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  poissonTableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  poissonColumnLabelGoal: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1.5,
    textAlign: 'left',
  },
  poissonColumnLabelValue: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  poissonTableRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  poissonRowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1.5,
    textAlign: 'left',
  },
  poissonRowValue: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  insightList: {
    gap: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: colors.bgSecondary,
    gap: spacing.sm,
  },
  insightIcon: {
    marginRight: spacing.xs,
  },
  insightText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  insightPositive: {
    borderColor: colors.success + '44',
    backgroundColor: colors.success + '11',
  },
  insightWarning: {
    borderColor: colors.warning + '44',
    backgroundColor: colors.warning + '11',
  },
  insightInfo: {
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
  },
  });
};

const styles = getStyles();

function getMomentumDescriptor(value: number | null | undefined) {
  if (typeof value !== 'number') return null;
  if (value > 25) return 'bullish';
  if (value < -25) return 'bearish';
  return 'neutral';
}
