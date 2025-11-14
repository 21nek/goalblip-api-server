import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
};

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 110,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  label: {
    ...typography.label,
    color: colors.textTertiary,
  },
  value: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '600',
    marginTop: 6,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
  },
});

