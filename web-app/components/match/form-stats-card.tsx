import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SimpleCircularChart } from '@/components/ui/simple-chart';
import { getCardPadding, screenDimensions } from '@/lib/responsive';
import { useTranslation } from '@/hooks/useTranslation';
import type { FormStats } from '@/lib/match-analysis';

type FormStatsCardProps = {
  teamName: string;
  stats: FormStats;
  isHome?: boolean;
};

export function FormStatsCard({ teamName, stats, isHome = false }: FormStatsCardProps) {
  const t = useTranslation();
  const getFormScoreColor = () => {
    if (stats.formScore >= 70) return colors.success;
    if (stats.formScore >= 50) return colors.info;
    if (stats.formScore >= 30) return colors.warning;
    return colors.error;
  };

  const getStreakText = () => {
    if (stats.streakCount === 0) return null;
    const streakType =
      stats.currentStreak === 'win'
        ? t('matchDetail.formStatsCard.streakTypes.win')
        : stats.currentStreak === 'draw'
        ? t('matchDetail.formStatsCard.streakTypes.draw')
        : t('matchDetail.formStatsCard.streakTypes.loss');
    return t('matchDetail.formStatsCard.streakLabel', {
      count: stats.streakCount,
      type: streakType,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamName}>{teamName}</Text>
        {isHome && (
          <View style={styles.homeBadge}>
            <Text style={styles.homeBadgeText}>{t('matchDetail.formStatsCard.homeBadge')}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsChartContainer}>
        <SimpleCircularChart
          data={[
            { label: t('matchDetail.formStats.winRate'), value: stats.winRate, color: colors.success },
            { label: t('matchDetail.formStats.drawRate'), value: stats.drawRate, color: colors.warning },
            { label: t('matchDetail.formStats.lossRate'), value: stats.lossRate, color: colors.error },
          ]}
          size={120}
          showLabels={true}
        />
      </View>

      <View style={styles.formScoreContainer}>
        <View style={styles.formScoreHeader}>
          <Text style={styles.formScoreLabel}>{t('matchDetail.formStatsCard.formScoreLabel')}</Text>
          <Text style={[styles.formScoreValue, { color: getFormScoreColor() }]}>
            {stats.formScore.toFixed(0)}/100
          </Text>
        </View>
        <ProgressBar
          value={stats.formScore}
          max={100}
          height={10}
          color={getFormScoreColor()}
        />
      </View>

      <View style={styles.goalsRow}>
        <View style={styles.goalStat}>
          <Text style={styles.goalLabel}>{t('matchDetail.goalAnalysisCard.teamStats.avgGoals')}</Text>
          <Text style={styles.goalValue}>{stats.avgGoalsFor.toFixed(1)}</Text>
        </View>
        <View style={styles.goalStat}>
          <Text style={styles.goalLabel}>{t('matchDetail.goalAnalysisCard.teamStats.avgConceded')}</Text>
          <Text style={styles.goalValue}>{stats.avgGoalsAgainst.toFixed(1)}</Text>
        </View>
        <View style={styles.goalStat}>
          <Text style={styles.goalLabel}>{t('matchDetail.formStatsCard.goalDifference')}</Text>
          <Text style={[styles.goalValue, { color: stats.goalDifference >= 0 ? colors.success : colors.error }]}>
            {stats.goalDifference >= 0 ? '+' : ''}{stats.goalDifference.toFixed(1)}
          </Text>
        </View>
      </View>

      {getStreakText() && (
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>{getStreakText()}</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = () => {
  const cardPadding = getCardPadding();
  const isSmall = screenDimensions.isSmall;
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.bgCard,
      borderRadius: borderRadius.lg,
      padding: cardPadding,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    teamName: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: '700',
      flex: 1,
      fontSize: isSmall ? 18 : typography.h3.fontSize,
    },
    homeBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    homeBadgeText: {
      ...typography.caption,
      color: colors.bgPrimary,
      fontWeight: '700',
      fontSize: 10,
    },
    statsChartContainer: {
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  formScoreContainer: {
    marginBottom: spacing.md,
  },
  formScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  formScoreLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formScoreValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  goalStat: {
    flex: 1,
    alignItems: 'center',
  },
  goalLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  goalValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  streakContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  streakText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  });
};

const styles = getStyles();
