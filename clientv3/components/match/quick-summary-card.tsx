import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Icon } from '@/components/ui/icon';

type Outcome = {
  label?: string | null;
  valuePercent?: number | null;
};

type QuickSummaryCardProps = {
  mainPrediction: string;
  confidence: number;
  recommendedPick: string;
  summary: string;
  outcomes?: Outcome[];
};

export function QuickSummaryCard({ mainPrediction, confidence, recommendedPick, summary, outcomes }: QuickSummaryCardProps) {
  const getConfidenceColor = () => {
    if (confidence >= 75) return colors.success;
    if (confidence >= 60) return colors.info;
    if (confidence >= 50) return colors.warning;
    return colors.error;
  };

  // Sort outcomes by percentage (highest first)
  const sortedOutcomes = outcomes
    ? [...outcomes].sort((a, b) => (b.valuePercent || 0) - (a.valuePercent || 0))
    : [];

  const getConfidenceLevel = () => {
    if (confidence >= 85) return { label: 'Çok Yüksek Güven', color: colors.success, icon: 'checkmark-circle' };
    if (confidence >= 75) return { label: 'Yüksek Güven', color: colors.success, icon: 'checkmark-circle' };
    if (confidence >= 65) return { label: 'İyi Güven', color: colors.info, icon: 'information-circle' };
    if (confidence >= 55) return { label: 'Orta Güven', color: colors.warning, icon: 'warning' };
    return { label: 'Düşük Güven', color: colors.error, icon: 'warning' };
  };

  const confidenceLevel = getConfidenceLevel();
  const topOutcome = sortedOutcomes[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="robot" size={24} color={colors.accent} style={{ marginRight: spacing.sm }} />
          <Text style={styles.title}>AI Tahmin Analizi</Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceLevel.color + '20', borderColor: confidenceLevel.color + '40' }]}>
          <Icon name={confidenceLevel.icon as 'checkmark-circle' | 'information-circle' | 'warning'} size={16} color={confidenceLevel.color} style={{ marginRight: spacing.xs / 2 }} />
          <Text style={[styles.confidenceLabel, { color: confidenceLevel.color }]}>
            {confidenceLevel.label}
          </Text>
          <Text style={[styles.confidenceValue, { color: confidenceLevel.color }]}>
            %{confidence.toFixed(0)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainPredictionBox}>
          <Text style={styles.mainPredictionLabel}>Ana Tahmin</Text>
          <Text style={styles.mainPredictionValue}>{mainPrediction}</Text>
        </View>

        {topOutcome && (
          <View style={styles.recommendedBox}>
            <View style={styles.recommendedHeader}>
              <Icon name="star" size={18} color={colors.warning} style={{ marginRight: spacing.xs }} />
              <Text style={styles.recommendedLabel}>Önerilen Seçim</Text>
            </View>
            <View style={styles.recommendedContent}>
              <View style={[styles.recommendedBadge, { backgroundColor: confidenceLevel.color }]}>
                <Text style={styles.recommendedBadgeText}>{topOutcome.label || recommendedPick}</Text>
              </View>
              <View style={styles.recommendedStats}>
                <Text style={styles.recommendedPercent}>%{topOutcome.valuePercent?.toFixed(1) || '0'}</Text>
                <Text style={styles.recommendedSubtext}>olasılık</Text>
              </View>
            </View>
          </View>
        )}

        {sortedOutcomes.length > 1 && (
          <View style={styles.outcomesContainer}>
            <Text style={styles.outcomesLabel}>Tüm Olasılıklar</Text>
            {sortedOutcomes.map((outcome, index) => {
              const percentage = outcome.valuePercent || 0;
              const isHighest = index === 0;
              const outcomeColor = percentage >= 50 ? colors.success : percentage >= 30 ? colors.warning : colors.textSecondary;
              
              return (
                <View key={index} style={[styles.outcomeRow, isHighest && styles.outcomeRowHighlighted]}>
                  <View style={styles.outcomeInfo}>
                    <Text style={[styles.outcomeLabel, isHighest && styles.outcomeLabelHighlighted]}>
                      {outcome.label || '—'}
                    </Text>
                    {isHighest && (
                      <View style={[styles.highestBadge, { backgroundColor: outcomeColor + '20' }]}>
                        <Icon name="checkmark-circle" size={14} color={outcomeColor} style={{ marginRight: spacing.xs / 2 }} />
                        <Text style={[styles.highestText, { color: outcomeColor }]}>En Yüksek</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.outcomeBarContainer}>
                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                      <ProgressBar
                        value={percentage}
                        max={100}
                        height={isHighest ? 10 : 8}
                        color={outcomeColor}
                      />
                    </View>
                    <Text style={[styles.outcomePercent, { color: outcomeColor }]}>
                      %{percentage.toFixed(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {summary && (
          <View style={styles.summaryBox}>
            <Icon name="information-circle" size={16} color={colors.info} style={{ marginRight: spacing.sm }} />
            <Text style={styles.summary}>{summary}</Text>
          </View>
        )}
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
    borderWidth: 2,
    borderColor: colors.accent + '30',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  confidenceLabel: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  confidenceValue: {
    ...typography.h3,
    fontWeight: '700',
    fontSize: 20,
    marginLeft: spacing.xs,
  },
  content: {
    // gap handled by individual margins
  },
  mainPredictionBox: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
    alignItems: 'center',
  },
  mainPredictionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  mainPredictionValue: {
    ...typography.h1,
    color: colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 28,
  },
  recommendedBox: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    marginTop: spacing.lg,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recommendedLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  recommendedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendedBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    flex: 1,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recommendedBadgeText: {
    ...typography.h3,
    color: colors.bgPrimary,
    fontWeight: '700',
  },
  recommendedStats: {
    alignItems: 'flex-end',
  },
  recommendedPercent: {
    ...typography.h2,
    color: colors.warning,
    fontWeight: '700',
  },
  recommendedSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 10,
  },
  outcomesContainer: {
    marginTop: spacing.lg,
  },
  outcomesLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  outcomeRow: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  outcomeRowHighlighted: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  outcomeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  outcomeLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  outcomeLabelHighlighted: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  highestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  highestText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  outcomeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outcomePercent: {
    ...typography.body,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
    marginTop: spacing.lg,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

