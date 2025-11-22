import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useTranslation } from '@/hooks/useTranslation';
import type { FormStats } from '@/lib/match-analysis';
import { localizeOutcomeLabel } from '@/lib/i18n/localize-match-data';

type GoalAnalysisCardProps = {
  homeTeam: {
    name: string;
    stats: FormStats;
  };
  awayTeam: {
    name: string;
    stats: FormStats;
  };
  overUnderPrediction?: {
    label: string;
    valuePercent: number;
  } | null;
};

export function GoalAnalysisCard({ homeTeam, awayTeam, overUnderPrediction }: GoalAnalysisCardProps) {
  const t = useTranslation();
  const totalAvgGoals = homeTeam.stats.avgGoalsFor + awayTeam.stats.avgGoalsFor;
  const totalAvgConceded = homeTeam.stats.avgGoalsAgainst + awayTeam.stats.avgGoalsAgainst;
  const expectedGoals = (totalAvgGoals + totalAvgConceded) / 2;

  const getExpectedGoalsText = () => {
    if (expectedGoals >= 3) return t('matchDetail.goalAnalysisCard.expectation.high');
    if (expectedGoals >= 2) return t('matchDetail.goalAnalysisCard.expectation.mediumHigh');
    if (expectedGoals >= 1.5) return t('matchDetail.goalAnalysisCard.expectation.medium');
    return t('matchDetail.goalAnalysisCard.expectation.low');
  };

  const getExpectedGoalsColor = () => {
    if (expectedGoals >= 3) return colors.success;
    if (expectedGoals >= 2) return colors.info;
    if (expectedGoals >= 1.5) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('matchDetail.goalAnalysisCard.title')}</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('matchDetail.goalAnalysisCard.summary.expectedGoals')}</Text>
          <Text style={[styles.summaryValue, { color: getExpectedGoalsColor() }]}>
            {expectedGoals.toFixed(1)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('matchDetail.goalAnalysisCard.summary.prediction')}</Text>
          <Text style={[styles.summaryText, { color: getExpectedGoalsColor() }]}>
            {getExpectedGoalsText()}
          </Text>
        </View>
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{homeTeam.name}</Text>
          <View style={styles.goalStats}>
            <View style={styles.goalStat}>
              <Text style={styles.goalLabel}>{t('matchDetail.goalAnalysisCard.teamStats.avgGoals')}</Text>
              <Text style={[styles.goalValue, { color: colors.success }]}>
                {homeTeam.stats.avgGoalsFor.toFixed(1)}
              </Text>
            </View>
            <View style={styles.goalStat}>
              <Text style={styles.goalLabel}>{t('matchDetail.goalAnalysisCard.teamStats.avgConceded')}</Text>
              <Text style={[styles.goalValue, { color: colors.error }]}>
                {homeTeam.stats.avgGoalsAgainst.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>{t('match.vs').toUpperCase()}</Text>
        </View>

        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{awayTeam.name}</Text>
          <View style={styles.goalStats}>
            <View style={styles.goalStat}>
              <Text style={styles.goalLabel}>{t('matchDetail.goalAnalysisCard.teamStats.avgGoals')}</Text>
              <Text style={[styles.goalValue, { color: colors.success }]}>
                {awayTeam.stats.avgGoalsFor.toFixed(1)}
              </Text>
            </View>
            <View style={styles.goalStat}>
              <Text style={styles.goalLabel}>{t('matchDetail.goalAnalysisCard.teamStats.avgConceded')}</Text>
              <Text style={[styles.goalValue, { color: colors.error }]}>
                {awayTeam.stats.avgGoalsAgainst.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {overUnderPrediction && (
        <View style={styles.overUnderContainer}>
          <View style={styles.overUnderHeader}>
            <Text style={styles.overUnderLabel}>{t('matchDetail.goalAnalysisCard.teamStats.overUnderLabel')}</Text>
            <Text style={styles.overUnderValue}>
              {localizeOutcomeLabel(overUnderPrediction.label, t) || overUnderPrediction.label}
            </Text>
          </View>
          <ProgressBar
            value={overUnderPrediction.valuePercent}
            max={100}
            height={10}
            color={getExpectedGoalsColor()}
          />
          <Text style={styles.overUnderConfidence}>
            {t('matchDetail.goalAnalysisCard.teamStats.confidence')}: %{overUnderPrediction.valuePercent.toFixed(0)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h2,
    fontWeight: '700',
  },
  summaryText: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  goalStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  goalStat: {
    alignItems: 'center',
  },
  goalLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  goalValue: {
    ...typography.body,
    fontWeight: '700',
  },
  vsContainer: {
    paddingHorizontal: spacing.md,
  },
  vsText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '700',
  },
  overUnderContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  overUnderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overUnderLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  overUnderValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  overUnderConfidence: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
