import { StyleSheet, Text, View, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { screenDimensions } from '@/lib/responsive';

type SimpleBarChartProps = {
  data: Array<{ label: string; value: number; color?: string; displayValue?: string }>;
  maxValue?: number;
  showValues?: boolean;
  height?: number;
};

export function SimpleBarChart({ data, maxValue, showValues = true, height = 120 }: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Veri yok</Text>
      </View>
    );
  }

  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const barHeight = height - 40; // Space for labels

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const percentage = max > 0 ? (item.value / max) * 100 : 0;
          const barHeightValue = (percentage / 100) * barHeight;
          const barColor = item.color || colors.accent;

          return (
            <View key={`${item.label}-${index}`} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                {showValues && (
                  <View style={styles.valueContainer}>
                    <Text style={[styles.valueText, { color: barColor }]} numberOfLines={1}>
                      {item.displayValue || item.value.toFixed(1)}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeightValue, 8), // Min 8px height for better visibility
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.labelText} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type TrendLineProps = {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
  showLabels?: boolean;
};

type HorizontalBarChartProps = {
  data: Array<{ label: string; value: number; color?: string; displayValue?: string }>;
  maxValue?: number;
  showValues?: boolean;
};

export function HorizontalBarChart({ data, maxValue, showValues = true }: HorizontalBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Veri yok</Text>
      </View>
    );
  }

  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.horizontalContainer}>
      {/* Bars row with values above */}
      <View style={styles.horizontalBarsRow}>
        {data.map((item, index) => {
          const percentage = max > 0 ? (item.value / max) * 100 : 0;
          const barColor = item.color || colors.accent;

          return (
            <View key={`bar-${index}`} style={styles.horizontalBarItem}>
              {showValues && (
                <Text style={[styles.horizontalValueText, { color: barColor }]} numberOfLines={1}>
                  {item.displayValue || item.value.toFixed(1)}
                </Text>
              )}
              <View style={styles.horizontalBarContainer}>
                <View
                  style={[
                    styles.horizontalBarFill,
                    {
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.horizontalLabelText} numberOfLines={1} ellipsizeMode="tail">
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type CircularChartProps = {
  data: Array<{ label: string; value: number; color?: string }>;
  size?: number;
  showLabels?: boolean;
  showValues?: boolean;
  useDirectValues?: boolean; // If true, values are already percentages (0-100), don't calculate from total
};

export function CircularChart({ data, size = 120, showLabels = true, showValues = true }: CircularChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Veri yok</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Veri yok</Text>
      </View>
    );
  }

  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={[styles.circularChart, { width: size, height: size }]}>
        <View style={[styles.circularInner, { width: size - 16, height: size - 16 }]}>
          {showValues && (
            <View style={styles.circularCenter}>
              <Text style={styles.circularTotal}>{total.toFixed(1)}</Text>
              <Text style={styles.circularTotalLabel}>Toplam</Text>
            </View>
          )}
        </View>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          currentOffset += (percentage / 100) * circumference;
          const barColor = item.color || colors.accent;

          return (
            <View
              key={index}
              style={[
                styles.circularSegment,
                {
                  width: size,
                  height: size,
                  transform: [{ rotate: '-90deg' }],
                },
              ]}
            >
              <View
                style={[
                  styles.circularArc,
                  {
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                    borderWidth: 8,
                    borderColor: barColor,
                    borderTopColor: 'transparent',
                    borderRightColor: index === 0 ? barColor : 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: index === data.length - 1 ? barColor : 'transparent',
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      {showLabels && (
        <View style={styles.circularLabels}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const barColor = item.color || colors.accent;
            return (
              <View key={index} style={styles.circularLabelItem}>
                <View style={[styles.circularLabelDot, { backgroundColor: barColor }]} />
                <Text style={styles.circularLabelText} numberOfLines={1} ellipsizeMode="tail">
                  {item.label}
                </Text>
                <Text style={[styles.circularLabelValue, { color: barColor }]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// Simplified circular chart using progress rings
export function SimpleCircularChart({ 
  data, 
  size = 100, 
  showLabels = true,
  useDirectValues = false
}: CircularChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Veri yok</Text>
      </View>
    );
  }

  // For 2-3 items, show as side-by-side rings
  if (data.length <= 3) {
    return (
      <View style={styles.circularRingsContainer}>
        {data.map((item, index) => {
          let percentage: number;
          if (useDirectValues) {
            // Values are already percentages (0-100), use directly
            percentage = Math.max(0, Math.min(100, item.value));
          } else {
            // Calculate percentage from total
            const total = data.reduce((sum, i) => sum + i.value, 0);
            if (total === 0) {
              percentage = 0;
            } else {
              percentage = item.value > 0 ? (item.value / total) * 100 : 0;
            }
          }
          
          const barColor = item.color || colors.accent;
          // Responsive ring size - smaller on small screens and web
          const isSmall = screenDimensions.isSmall;
          const isWeb = Platform.OS === 'web';
          const baseRingSize = size / (data.length === 2 ? 1.5 : 1.2);
          const ringSize = isWeb ? Math.min(baseRingSize, 90) : (isSmall ? Math.min(baseRingSize, 80) : baseRingSize);
          const strokeWidth = isSmall || isWeb ? 6 : 8;
          
          // If percentage is 0, show empty ring
          const showProgress = percentage > 0;
          
          return (
            <View key={index} style={styles.circularRingWrapper}>
              <View style={[styles.circularRing, { width: ringSize, height: ringSize }]}>
                <View style={[styles.circularRingInner, { width: ringSize - strokeWidth * 2, height: ringSize - strokeWidth * 2 }]}>
                  <Text style={[styles.circularRingValue, { color: barColor }]}>
                    {percentage.toFixed(0)}%
                  </Text>
                  {showLabels && (
                    <Text style={styles.circularRingLabel} numberOfLines={1} ellipsizeMode="tail">
                      {item.label}
                    </Text>
                  )}
                </View>
                {/* Progress ring using border trick */}
                {showProgress ? (
                  <View
                    style={[
                      styles.circularRingProgress,
                      {
                        width: ringSize,
                        height: ringSize,
                        borderRadius: ringSize / 2,
                        borderWidth: strokeWidth,
                        borderColor: colors.bgTertiary,
                        borderTopColor: barColor,
                        borderRightColor: percentage > 25 ? barColor : colors.bgTertiary,
                        borderBottomColor: percentage > 50 ? barColor : colors.bgTertiary,
                        borderLeftColor: percentage > 75 ? barColor : colors.bgTertiary,
                        transform: [{ rotate: '-90deg' }],
                      },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.circularRingProgress,
                      {
                        width: ringSize,
                        height: ringSize,
                        borderRadius: ringSize / 2,
                        borderWidth: strokeWidth,
                        borderColor: colors.bgTertiary,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // For more items, show as list with progress bars
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0 && !useDirectValues) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Veri yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.circularListContainer}>
      {data.map((item, index) => {
        let percentage: number;
        if (useDirectValues) {
          // Values are already percentages (0-100), use directly
          percentage = Math.max(0, Math.min(100, item.value));
        } else {
          // Calculate percentage from total
          percentage = total > 0 ? (item.value / total) * 100 : 0;
        }
        const barColor = item.color || colors.accent;
        return (
          <View key={index} style={styles.circularListItem}>
            <View style={[styles.circularListDot, { backgroundColor: barColor }]} />
            <Text style={styles.circularListLabel} numberOfLines={1} ellipsizeMode="tail">
              {item.label}
            </Text>
            <View style={styles.circularListBar}>
              <View
                style={[
                  styles.circularListBarFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.circularListValue, { color: barColor }]}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function TrendLine({ data, color = colors.accent, height = 100, showLabels = true }: TrendLineProps) {
  if (!data || data.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Yeterli veri yok</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Normalize values to 0-1 range
  const normalized = values.map((v) => (v - minValue) / range);

  const points = normalized.map((norm, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - norm * 100;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <View style={[styles.trendContainer, { height }]}>
      <View style={styles.trendInner}>
        {showLabels && (
          <View style={styles.trendLabels}>
            <Text style={styles.trendLabel}>{minValue.toFixed(1)}</Text>
            <Text style={styles.trendLabel}>{maxValue.toFixed(1)}</Text>
          </View>
        )}
        <View style={styles.trendChart}>
          {/* Simple line representation using View */}
          <View style={styles.trendLineContainer}>
            {normalized.map((norm, index) => {
              if (index === 0) return null;
              const prevNorm = normalized[index - 1];
              const x1 = ((index - 1) / (data.length - 1)) * 100;
              const y1 = 100 - prevNorm * 100;
              const x2 = (index / (data.length - 1)) * 100;
              const y2 = 100 - norm * 100;

              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

              return (
                <View
                  key={index}
                  style={[
                    styles.trendLineSegment,
                    {
                      left: `${x1}%`,
                      top: `${y1}%`,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: color,
                    },
                  ]}
                />
              );
            })}
            {normalized.map((norm, index) => (
              <View
                key={`point-${index}`}
                style={[
                  styles.trendPoint,
                  {
                    left: `${(index / (data.length - 1)) * 100}%`,
                    top: `${100 - norm * 100}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      {showLabels && (
        <View style={styles.trendXLabels}>
          {data.map((item, index) => (
            <Text key={index} style={styles.trendXLabel} numberOfLines={1}>
              {item.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  valueText: {
    ...typography.body,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
  },
  barContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 35, // Space for labels
    position: 'relative',
  },
  valueContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.sm,
    minHeight: 8,
    ...shadows.subtle,
  },
  labelText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  trendContainer: {
    paddingVertical: spacing.md,
  },
  trendInner: {
    flex: 1,
    position: 'relative',
  },
  trendLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  trendLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 10,
  },
  trendChart: {
    flex: 1,
    marginLeft: 30,
    position: 'relative',
  },
  trendLineContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  trendLineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  trendPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
  },
  trendXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
    paddingHorizontal: 30,
  },
  trendXLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 9,
    flex: 1,
    textAlign: 'center',
  },
  // Horizontal bar chart styles
  horizontalContainer: {
    paddingVertical: spacing.sm,
  },
  horizontalBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  horizontalBarItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  horizontalBarContainer: {
    width: '100%',
    height: 32,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: spacing.xs,
  },
  horizontalBarFill: {
    height: '100%',
    borderRadius: borderRadius.md,
    minWidth: 4,
    ...shadows.subtle,
  },
  horizontalValueText: {
    ...typography.bodySmall,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  horizontalLabelText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Circular chart styles
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularInner: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  circularCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTotal: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
  },
  circularTotalLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 10,
  },
  circularSegment: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularArc: {
    position: 'absolute',
  },
  circularLabels: {
    marginTop: spacing.md,
    width: '100%',
  },
  circularLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  circularLabelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  circularLabelText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontSize: 11,
  },
  circularLabelValue: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  circularRingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    width: '100%',
    maxWidth: '100%',
    ...Platform.select({
      web: {
        maxWidth: '100%',
        overflow: 'hidden',
      },
    }),
  },
  circularRingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: '50%',
    ...Platform.select({
      web: {
        maxWidth: '48%',
        minWidth: 0,
      },
    }),
  },
  circularRing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    ...Platform.select({
      web: {
        maxWidth: '100%',
        overflow: 'hidden',
      },
    }),
  },
  circularRingInner: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.xs,
    ...Platform.select({
      web: {
        maxWidth: '100%',
        overflow: 'hidden',
      },
    }),
  },
  circularRingValue: {
    ...typography.h3,
    fontWeight: '700',
    fontSize: Platform.OS === 'web' ? 14 : screenDimensions.isSmall ? 14 : 16,
  },
  circularRingLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 9,
    marginTop: spacing.xs / 2,
  },
  circularRingProgress: {
    position: 'absolute',
  },
  circularListContainer: {
    paddingVertical: spacing.sm,
  },
  circularListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  circularListDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  circularListLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontSize: 11,
    marginRight: spacing.sm,
  },
  circularListBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.bgTertiary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  circularListBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  circularListValue: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
    minWidth: 35,
    textAlign: 'right',
  },
});

