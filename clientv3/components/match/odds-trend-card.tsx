import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { SimpleCircularChart } from '@/components/ui/simple-chart';
import { Icon } from '@/components/ui/icon';
import { getCardPadding, screenDimensions } from '@/lib/responsive';

type OddsRow = {
  label?: string | null;
  values?: string[] | null;
};

type OddsCard = {
  title?: string | null;
  rows?: OddsRow[] | null;
};

type OddsTrendCardProps = {
  title: string;
  cards: OddsCard[];
};

export function OddsTrendCard({ title, cards }: OddsTrendCardProps) {
  const parseValue = (value: string): number | null => {
    // Extract number from strings like "1.85 ↑" or "2.10 ↓"
    const match = value.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  const getTrendDirection = (value: string): 'up' | 'down' | 'neutral' => {
    if (value.includes('↑') || value.includes('▲')) return 'up';
    if (value.includes('↓') || value.includes('▼')) return 'down';
    return 'neutral';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {cards.map((card, cardIdx) => (
        <View key={cardIdx} style={styles.card}>
          {card.title && <Text style={styles.cardTitle}>{card.title}</Text>}
          {card.rows && card.rows.length > 0 ? (
            <View style={styles.rowsContainer}>
              {card.rows.map((row, rowIdx) => {
                const values = row.values || [];
                const numericValues = values.map(parseValue).filter((v): v is number => v !== null);
                
                // If we have numeric values, show as circular chart (2-3 items) or compact list
                if (numericValues.length > 0 && numericValues.length <= 5) {
                  const chartData = values.map((val, idx) => {
                    const numVal = parseValue(val);
                    const trend = getTrendDirection(val);
                    const cleanValue = val.replace(/[↑↓▲▼]/g, '').trim();
                    return {
                      label: cleanValue,
                      value: numVal || 0,
                      color: trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.accent,
                    };
                  });

                  return (
                    <View key={rowIdx} style={styles.rowWithChart}>
                      <Text style={styles.rowLabel}>{row.label || 'Oran'}</Text>
                      <SimpleCircularChart
                        data={chartData}
                        size={numericValues.length <= 3 ? 100 : 80}
                        showLabels={true}
                      />
                    </View>
                  );
                }

                // Otherwise show as compact chips with trend indicators
                return (
                  <View key={rowIdx} style={styles.row}>
                    <Text style={styles.rowLabelText}>{row.label || '—'}</Text>
                    <View style={styles.valuesContainer}>
                      {values.map((val, valIdx) => {
                        const trend = getTrendDirection(val);
                        const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.textSecondary;
                        return (
                          <View key={valIdx} style={[styles.valueChip, { borderColor: trendColor + '40' }]}>
                            <Text style={[styles.valueText, { color: trendColor }]}>
                              {val}
                            </Text>
                            {trend !== 'neutral' && (
                              <Icon
                                name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
                                size={14}
                                color={trendColor}
                                style={{ marginLeft: spacing.xs / 2 }}
                              />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const getStyles = () => {
  const cardPadding = getCardPadding();
  const isSmall = screenDimensions.isSmall;
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.bgCard,
      borderRadius: borderRadius.lg,
      padding: cardPadding,
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
      fontSize: isSmall ? 18 : typography.h3.fontSize,
    },
    card: {
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cardTitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: spacing.sm,
      fontSize: isSmall ? 14 : typography.body.fontSize,
    },
    rowsContainer: {
      // gap handled by individual margins
    },
    row: {
      flexDirection: 'column',
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      padding: cardPadding,
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    valuesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    rowLabelText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.xs,
      fontSize: isSmall ? 14 : typography.body.fontSize,
    },
    valueChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgTertiary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginHorizontal: spacing.xs / 2,
      marginBottom: spacing.xs,
      borderWidth: 1,
    },
    valueText: {
      ...typography.bodySmall,
      fontWeight: '600',
      fontSize: isSmall ? 12 : typography.bodySmall.fontSize,
    },
    rowWithChart: {
      marginBottom: spacing.lg,
      padding: cardPadding,
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    rowLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.md,
      textAlign: 'center',
      fontSize: isSmall ? 14 : typography.body.fontSize,
    },
  });
};

const styles = getStyles();

