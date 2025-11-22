import { StyleSheet, Text, View } from 'react-native';
import { colors, borderRadius } from '@/lib/theme';

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  height?: number;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = colors.accent,
  height = 8,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {showValue && <Text style={styles.value}>{Math.round(percentage)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 8,
  },
  track: {
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

