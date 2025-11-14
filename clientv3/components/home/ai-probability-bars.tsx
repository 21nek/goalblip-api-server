import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import type { MatchDetail } from '@/types/match';

type AIProbabilityBarsProps = {
  outcomes?: Array<{ label?: string | null; valuePercent?: number | null }> | null;
};

export const AIProbabilityBars = memo(function AIProbabilityBars({ outcomes }: AIProbabilityBarsProps) {
  if (!outcomes || outcomes.length === 0) return null;

  // Find the highest probability
  const maxPercent = Math.max(...outcomes.map((o) => o.valuePercent || 0));

  return (
    <View style={styles.container}>
      {outcomes.map((outcome, index) => {
        const percent = outcome.valuePercent || 0;
        const isHighest = percent === maxPercent && percent > 0;
        const label = outcome.label || '—';

        return (
          <View key={index} style={styles.barContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  isHighest ? styles.barFillPrimary : styles.barFillSecondary,
                  { width: `${Math.max(percent, 2)}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  barBackground: {
    width: '100%',
    height: 6,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  barFillPrimary: {
    backgroundColor: colors.accent,
  },
  barFillSecondary: {
    backgroundColor: colors.accent + '80',
  },
});

