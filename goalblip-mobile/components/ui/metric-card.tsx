import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from './icon';

type MetricCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'football' | 'trophy' | 'refresh' | 'star' | 'robot';
  color?: string;
};

export function MetricCard({ label, value, subtitle, trend, icon, color }: MetricCardProps) {
  const trendColor =
    trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.textTertiary;

  return (
    <View style={[styles.card, color && { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon && <Icon name={icon} size={20} color={colors.textTertiary} />}
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend && (
        <View style={styles.trend}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend !== 'neutral' && 'Trend'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textTertiary,
  },
  value: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  trend: {
    marginTop: spacing.sm,
  },
  trendText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

