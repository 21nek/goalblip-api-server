import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { useTranslation } from '@/hooks/useTranslation';
import type { TeamComparison } from '@/lib/match-analysis';

type TeamComparisonCardProps = {
  comparison: TeamComparison;
};

export function TeamComparisonCard({ comparison }: TeamComparisonCardProps) {
  const t = useTranslation();
  const getAdvantageText = () => {
    if (comparison.homeAdvantage > 15) {
      return t('matchDetail.teamComparisonCard.advantage.home', { team: comparison.homeTeam.name });
    } else if (comparison.homeAdvantage < -15) {
      return t('matchDetail.teamComparisonCard.advantage.away', { team: comparison.awayTeam.name });
    } else {
      return t('matchDetail.teamComparisonCard.advantage.balanced');
    }
  };

  const getAdvantageColor = () => {
    if (Math.abs(comparison.homeAdvantage) > 15) {
      return comparison.homeAdvantage > 0 ? colors.success : colors.error;
    }
    return colors.info;
  };

  const getPredictionText = () => {
    if (comparison.prediction === 'home') return t('matchDetail.teamComparisonCard.predictionValues.home');
    if (comparison.prediction === 'away') return t('matchDetail.teamComparisonCard.predictionValues.away');
    if (comparison.prediction === 'draw') return t('matchDetail.teamComparisonCard.predictionValues.draw');
    return t('matchDetail.teamComparisonCard.predictionValues.balanced');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('matchDetail.teamComparison')}</Text>

      <View style={styles.comparisonRow}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{comparison.homeTeam.name}</Text>
          <Text style={styles.formScore}>
            {t('matchDetail.teamComparisonCard.formScore', {
              score: comparison.homeTeam.stats.formScore.toFixed(0),
            })}
          </Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>{t('match.vs').toUpperCase()}</Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{comparison.awayTeam.name}</Text>
          <Text style={styles.formScore}>
            {t('matchDetail.teamComparisonCard.formScore', {
              score: comparison.awayTeam.stats.formScore.toFixed(0),
            })}
          </Text>
        </View>
      </View>

      <View style={styles.advantageContainer}>
        <View style={[styles.advantageBadge, { backgroundColor: getAdvantageColor() + '20' }]}>
          <Text style={[styles.advantageText, { color: getAdvantageColor() }]}>
            {getAdvantageText()}
          </Text>
        </View>
      </View>

      <View style={styles.predictionContainer}>
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>{t('matchDetail.teamComparisonCard.predictionLabel')}:</Text>
          <Text style={styles.predictionValue}>{getPredictionText()}</Text>
        </View>
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>{t('matchDetail.teamComparisonCard.confidenceLabel')}:</Text>
          <Text style={styles.predictionValue}>%{comparison.confidence.toFixed(0)}</Text>
        </View>
      </View>
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
  comparisonRow: {
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  formScore: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  vsContainer: {
    paddingHorizontal: spacing.md,
  },
  vsText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '700',
  },
  advantageContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  advantageBadge: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  advantageText: {
    ...typography.body,
    fontWeight: '700',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  predictionRow: {
    alignItems: 'center',
  },
  predictionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  predictionValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
