import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import type { TeamComparison } from '@/lib/match-analysis';

type TeamComparisonCardProps = {
  comparison: TeamComparison;
};

export function TeamComparisonCard({ comparison }: TeamComparisonCardProps) {
  const getAdvantageText = () => {
    if (comparison.homeAdvantage > 15) {
      return `${comparison.homeTeam.name} belirgin avantajlı`;
    } else if (comparison.homeAdvantage < -15) {
      return `${comparison.awayTeam.name} belirgin avantajlı`;
    } else {
      return 'İki takım da dengeli';
    }
  };

  const getAdvantageColor = () => {
    if (Math.abs(comparison.homeAdvantage) > 15) {
      return comparison.homeAdvantage > 0 ? colors.success : colors.error;
    }
    return colors.info;
  };

  const getPredictionText = () => {
    if (comparison.prediction === 'home') return 'Ev Sahibi';
    if (comparison.prediction === 'away') return 'Deplasman';
    if (comparison.prediction === 'draw') return 'Beraberlik';
    return 'Dengeli';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Takım Karşılaştırması</Text>

      <View style={styles.comparisonRow}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{comparison.homeTeam.name}</Text>
          <Text style={styles.formScore}>
            Form: {comparison.homeTeam.stats.formScore.toFixed(0)}/100
          </Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName}>{comparison.awayTeam.name}</Text>
          <Text style={styles.formScore}>
            Form: {comparison.awayTeam.stats.formScore.toFixed(0)}/100
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
          <Text style={styles.predictionLabel}>Tahmin:</Text>
          <Text style={styles.predictionValue}>{getPredictionText()}</Text>
        </View>
        <View style={styles.predictionRow}>
          <Text style={styles.predictionLabel}>Güven:</Text>
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

