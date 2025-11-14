import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { ProgressBar } from '@/components/ui/progress-bar';

type Prediction = {
  title?: string | null;
  confidence?: number | null;
  outcomes?: Array<{ label?: string | null; valuePercent?: number | null }>;
};

type PredictionSummaryCardProps = {
  predictions: Prediction[];
};

export function PredictionSummaryCard({ predictions }: PredictionSummaryCardProps) {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return colors.success;
    if (confidence >= 60) return colors.info;
    if (confidence >= 50) return colors.warning;
    return colors.error;
  };

  const getTopOutcome = (outcomes?: Array<{ label?: string | null; valuePercent?: number | null }>) => {
    if (!outcomes || outcomes.length === 0) return null;
    return outcomes.reduce((top, current) => {
      const currentPct = current.valuePercent || 0;
      const topPct = top.valuePercent || 0;
      return currentPct > topPct ? current : top;
    }, outcomes[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tahmin Özeti</Text>
      <View style={styles.predictionsList}>
        {predictions.map((prediction, index) => {
          const confidence = prediction.confidence || 0;
          const topOutcome = getTopOutcome(prediction.outcomes);
          const confidenceColor = getConfidenceColor(confidence);

          return (
            <View key={index} style={styles.predictionItem}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionTitle}>{prediction.title || 'Tahmin'}</Text>
                <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20' }]}>
                  <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                    %{confidence.toFixed(0)}
                  </Text>
                </View>
              </View>

              {topOutcome && (
                <View style={styles.outcomeRow}>
                  <Text style={styles.outcomeLabel}>Önerilen:</Text>
                  <View style={[styles.outcomeBadge, { backgroundColor: confidenceColor }]}>
                    <Text style={styles.outcomeText}>{topOutcome.label}</Text>
                  </View>
                  <Text style={styles.outcomePercent}>%{topOutcome.valuePercent?.toFixed(0)}</Text>
                </View>
              )}

              <View style={styles.progressContainer}>
                <ProgressBar
                  value={confidence}
                  max={100}
                  height={6}
                  color={confidenceColor}
                />
              </View>

              {prediction.outcomes && prediction.outcomes.length > 1 && (
                <View style={styles.allOutcomes}>
                  {prediction.outcomes.map((outcome, idx) => (
                    <View key={idx} style={styles.outcomeChip}>
                      <Text style={styles.outcomeChipLabel}>{outcome.label}</Text>
                      <Text style={styles.outcomeChipValue}>%{outcome.valuePercent?.toFixed(0)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
  },
  predictionsList: {
    gap: spacing.md,
  },
  predictionItem: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  predictionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  outcomeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  outcomeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  outcomeText: {
    ...typography.caption,
    color: colors.bgPrimary,
    fontWeight: '700',
  },
  outcomePercent: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  allOutcomes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  outcomeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  outcomeChipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  outcomeChipValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

