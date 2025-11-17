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
import { getContainerPadding, getCardPadding, screenDimensions } from '@/lib/responsive';
import { getStatusKey, STATUS_TRANSLATION_KEYS } from '@/lib/status-labels';
import type { MatchDetail } from '@/types/match';
import {
  formatUpcomingDateText,
  localizeOutcomeLabel,
  localizePredictionTitle,
} from '@/lib/i18n/localize-match-data';
import { formatDateTime } from '@/lib/datetime';
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
                    <Text style={getStyles().teamName} numberOfLines={2}>
                      {scoreboard?.homeTeam?.name || t('common.unknown')}
                    </Text>
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
                  {scoreboard?.homeTeam?.score !== null && scoreboard?.awayTeam?.score !== null ? (
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
                    <Text style={getStyles().teamName} numberOfLines={2}>
                      {scoreboard?.awayTeam?.name || t('common.unknown')}
                    </Text>
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

            {/* Goal Analysis */}
            {(() => {
              const homeForm = detail.recentForm?.[0] || null;
              const awayForm = detail.recentForm?.[1] || null;
              if (!homeForm?.matches || !awayForm?.matches) return null;

              const homeStats = calculateFormStats(homeForm.matches);
              const awayStats = calculateFormStats(awayForm.matches);
              const homeTeamName = scoreboard?.homeTeam?.name || t('matchDetail.teams.homeFallback');
              const awayTeamName = scoreboard?.awayTeam?.name || t('matchDetail.teams.awayFallback');

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
      marginBottom: spacing.lg,
      ...shadows.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreboardHeader: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    league: {
      fontSize: isSmall ? 15 : 17,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      fontWeight: '700',
      lineHeight: isSmall ? 21 : 23,
      letterSpacing: 0.8,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.bgTertiary,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.md,
      alignSelf: 'center',
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
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      marginHorizontal: spacing.xs / 2,
      position: 'relative',
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
      fontSize: 11,
    },
    statusBadgeTextLive: {
      color: colors.accent,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    teamsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginVertical: spacing.xl,
      gap: spacing.md,
    },
    teamSection: {
      flex: 1,
      alignItems: 'center',
      minWidth: 0,
      flexBasis: 0,
    },
    teamSectionRight: {
      alignItems: 'center',
    },
    teamColumn: {
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: spacing.xs,
    },
    teamName: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: isSmall ? 13 : 15,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      lineHeight: isSmall ? 17 : 19,
      textAlign: 'center',
      width: '100%',
      minHeight: isSmall ? 34 : 38,
    },
    teamFormContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs / 2,
      marginTop: spacing.xs / 2,
    },
    teamFormChar: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      color: colors.textTertiary,
      minWidth: 16,
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
      minWidth: isSmall ? 90 : 110,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      flexShrink: 0,
    },
    score: {
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: isSmall ? 30 : 38,
      lineHeight: isSmall ? 38 : 46,
      marginBottom: spacing.xs / 2,
      letterSpacing: -0.5,
    },
    vsText: {
      fontSize: isSmall ? 24 : 30,
      color: colors.accent,
      fontWeight: '900',
      letterSpacing: 4,
      textTransform: 'uppercase',
    },
    halftimeScore: {
      ...typography.caption,
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '500',
      marginTop: spacing.xs / 2,
    },
  metaBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  metaBadgeIcon: {
    marginRight: spacing.xs / 2,
  },
  metaBadgeText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
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
    marginTop: spacing.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  infoChipText: {
    ...typography.caption,
    color: colors.textTertiary,
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
  reanalyzeCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
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
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  });
};

const styles = getStyles();






