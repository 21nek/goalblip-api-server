import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import type { MatchDetail, MatchSummary } from '@/types/match';

interface Props {
  match: MatchSummary;
  detail?: MatchDetail | null;
  loading?: boolean;
  onPress: () => void;
}

export function AIShortlistCard({ match, detail, loading, onPress }: Props) {
  const highlight =
    detail?.highlightPredictions?.find((item) => !item.locked) ??
    detail?.highlightPredictions?.[0];
  const detailConfidence = detail?.detailPredictions?.[0]?.confidence ?? null;
  const successValue = highlight?.successRate ?? detailConfidence ?? null;
  const successText = successValue ? `~%${successValue}` : null;
  const locked = highlight?.locked;
  const hasPrediction = Boolean(highlight?.pickCode || highlight?.title || detailConfidence);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={loading}>
      <View style={styles.rowBetween}>
        <Text style={styles.league}>{match.league || 'Lig'}</Text>
        {locked ? <Text style={styles.locked}>🔒</Text> : null}
      </View>
      <Text style={styles.teams}>{match.homeTeam}</Text>
      <Text style={styles.vs}>vs</Text>
      <Text style={styles.teams}>{match.awayTeam}</Text>
      <View style={styles.predictionBox}>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : hasPrediction ? (
          <>
            <Text style={styles.predictionLabel}>
              {highlight?.title || 'Tahmin bekleniyor'}
            </Text>
            <Text style={styles.predictionValue}>{highlight?.pickCode || 'N/A'}</Text>
            {successText ? <Text style={styles.predictionMeta}>{successText}</Text> : null}
          </>
        ) : (
          <>
            <Text style={styles.predictionLabel}>AI tahmini yok</Text>
            <Text style={styles.predictionMeta}>Bu maç için analiz henüz hazır değil.</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
      card: {
        width: 240,
        backgroundColor: colors.bgSecondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginRight: spacing.md,
        ...shadows.card,
      },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  league: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  locked: {
    color: colors.accent,
  },
  teams: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  vs: {
    ...typography.caption,
    color: colors.textTertiary,
    marginVertical: spacing.xs,
  },
  predictionBox: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm + 2,
    minHeight: 90,
    justifyContent: 'center',
  },
  predictionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  predictionValue: {
    ...typography.h2,
    color: colors.accent,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  predictionMeta: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});

