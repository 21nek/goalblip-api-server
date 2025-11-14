import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import type { KeyInsight } from '@/lib/match-analysis';

type KeyInsightsCardProps = {
  insights: KeyInsight[];
};

export function KeyInsightsCard({ insights }: KeyInsightsCardProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getIconName = (type: KeyInsight['type']) => {
    if (type === 'positive') return 'checkmark-circle';
    if (type === 'warning') return 'warning';
    return 'information-circle';
  };

  const getIconColor = (type: KeyInsight['type']) => {
    if (type === 'positive') return colors.success;
    if (type === 'warning') return colors.warning;
    return colors.info;
  };

  const getBackgroundColor = (type: KeyInsight['type']) => {
    if (type === 'positive') return colors.success + '15';
    if (type === 'warning') return colors.warning + '15';
    return colors.info + '15';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Önemli Notlar</Text>
      <View style={styles.insightsList}>
        {insights.map((insight, index) => (
          <View
            key={index}
            style={[
              styles.insightItem,
              { backgroundColor: getBackgroundColor(insight.type) },
            ]}
          >
            <Icon
              name={getIconName(insight.type) as any}
              size={20}
              color={getIconColor(insight.type)}
            />
            <Text style={styles.insightText}>{insight.message}</Text>
          </View>
        ))}
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
  insightsList: {
    gap: spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
});

