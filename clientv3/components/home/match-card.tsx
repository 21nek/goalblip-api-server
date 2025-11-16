import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { useTeamAssets } from '@/hooks/useTeamAssets';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { formatRecentForm } from '@/lib/match-helpers';
import { getCardPadding, screenDimensions } from '@/lib/responsive';
import { getStatusKey, STATUS_TRANSLATION_KEYS, isLiveStatus } from '@/lib/status-labels';
import type { MatchSummary, MatchDetail } from '@/types/match';
import { AIProbabilityBars } from './ai-probability-bars';

type MatchCardProps = {
  match: MatchSummary;
  detail?: MatchDetail | null;
  onPress: () => void;
};

export const MatchCard = memo(function MatchCard({ match, detail, onPress }: MatchCardProps) {
  const t = useTranslation();
  const assets = useTeamAssets(match.matchId);
  const statusKey = getStatusKey(match.statusLabel);
  const statusText = statusKey
    ? t(STATUS_TRANSLATION_KEYS[statusKey])
    : match.statusLabel || t('match.statusLabels.live');
  const isLive = isLiveStatus(match.statusLabel);
  const hasScore = detail?.scoreboard?.homeTeam?.score !== null && detail?.scoreboard?.awayTeam?.score !== null;
  
  // Get recent form
  const homeForm = formatRecentForm(detail?.recentForm, match.homeTeam);
  const awayForm = formatRecentForm(detail?.recentForm, match.awayTeam);
  
  // Get AI predictions
  const aiPredictions = detail?.detailPredictions?.[0]?.outcomes || null;

  const styles = getStyles();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Status Badge and Bookmark */}
      <View style={styles.headerRow}>
        {isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.pulseContainer}>
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.liveText}>{statusText}</Text>
          </View>
        ) : (
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{match.kickoffTimeDisplay || match.kickoffTime || '--:--'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
          <Icon name="star" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Teams Row */}
      <View style={styles.teamsRow}>
        {/* Home Team */}
        <View style={styles.teamBlock}>
          <Avatar 
            name={match.homeTeam} 
            logo={detail?.scoreboard?.homeTeam?.logo || assets?.homeLogo} 
            size={32} 
          />
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam}</Text>
            {homeForm && (
              <Text style={styles.teamForm}>{homeForm}</Text>
            )}
          </View>
        </View>

        {/* Score or VS */}
        <View style={styles.scoreContainer}>
          {isLive && hasScore ? (
            <Text style={styles.score}>
              {detail?.scoreboard?.homeTeam?.score ?? 0} - {detail?.scoreboard?.awayTeam?.score ?? 0}
            </Text>
          ) : (
            <Text style={styles.vs}>{t('match.vs')}</Text>
          )}
        </View>

        {/* Away Team */}
        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <View style={styles.teamInfo}>
            <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{match.awayTeam}</Text>
            {awayForm && (
              <Text style={[styles.teamForm, styles.teamFormRight]}>{awayForm}</Text>
            )}
          </View>
          <Avatar 
            name={match.awayTeam} 
            logo={detail?.scoreboard?.awayTeam?.logo || assets?.awayLogo} 
            size={32} 
          />
        </View>
      </View>

      {/* AI Probability Bars */}
      {aiPredictions && aiPredictions.length > 0 && (
        <AIProbabilityBars outcomes={aiPredictions} />
      )}
    </TouchableOpacity>
  );
});

const getStyles = () => {
  const cardPadding = getCardPadding();
  const isSmall = screenDimensions.isSmall;
  
  return StyleSheet.create({
    card: {
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: cardPadding,
      marginBottom: spacing.md,
      ...shadows.card,
    },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '33',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  pulseContainer: {
    width: 8,
    height: 8,
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  liveText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  timeBadge: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: spacing.xs,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  teamBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamBlockRight: {
    justifyContent: 'flex-end',
  },
  teamInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  teamName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: screenDimensions.isSmall ? 14 : typography.body.fontSize,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  teamForm: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
    teamFormRight: {
      textAlign: 'right',
    },
    scoreContainer: {
      marginHorizontal: isSmall ? spacing.sm : spacing.md,
      minWidth: isSmall ? 50 : 60,
      alignItems: 'center',
    },
    score: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    vs: {
      ...typography.body,
      color: colors.textTertiary,
      fontWeight: '600',
    },
  });
};
