import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { SimpleCircularChart } from '@/components/ui/simple-chart';
import { Icon } from '@/components/ui/icon';
import { getCardPadding, screenDimensions } from '@/lib/responsive';
import { useTranslation } from '@/hooks/useTranslation';
import {
  localizeOddsRowLabel,
  localizeOddsTitle,
  localizeOutcomeLabel,
} from '@/lib/i18n/localize-match-data';

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
  const t = useTranslation();
  const parseValue = (value: string): number | null => {
    const match = value.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  };

  const getTrendDirection = (value: string): 'up' | 'down' | 'neutral' => {
    if (/[↑↗]/.test(value)) return 'up';
    if (/[↓↘]/.test(value)) return 'down';
    return 'neutral';
  };

  const cleanValueText = (value: string) => value.replace(/[↑↓↗↘→]/g, '').trim();

  const localizedTitle = localizeOddsTitle(title, t);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{localizedTitle}</Text>
      {cards.map((card, cardIdx) => (
        <View key={cardIdx} style={styles.card}>
          {card.title && <Text style={styles.cardTitle}>{localizeOddsTitle(card.title, t)}</Text>}
          {card.rows && card.rows.length > 0 ? (
            <View style={styles.rowsContainer}>
              {card.rows.map((row, rowIdx) => {
                const values = row.values || [];
                const rowLabel =
                  localizeOddsRowLabel(row.label, t) || row.label || t('matchDetail.oddsTrendCard.rowLabel');
                const numericValues = values.map(parseValue).filter((v): v is number => v !== null);

                const renderTrendBadge = (value: string | null | undefined) => {
                  if (!value) return null;
                  const direction = getTrendDirection(value);
                  const text = cleanValueText(value) || value.trim();
                  const color =
                    direction === 'up'
                      ? colors.success
                      : direction === 'down'
                      ? colors.error
                      : colors.textSecondary;
                  return (
                    <View style={[styles.trendBadge, { borderColor: color + '55', backgroundColor: color + '10' }]}>
                      {direction !== 'neutral' ? (
                        <Icon name={direction === 'up' ? 'arrow-up' : 'arrow-down'} size={12} color={color} />
                      ) : (
                        <Icon name="information-circle" size={12} color={color} />
                      )}
                      <Text style={[styles.trendBadgeText, { color }]} numberOfLines={1}>
                        {text}
                      </Text>
                    </View>
                  );
                };

                const renderValueColumns = (first?: string, second?: string, change?: string) => (
                  <View style={styles.valueComparison}>
                    <View style={styles.valueColumn}>
                      <Text style={styles.valueColumnLabel}>
                        {t('matchDetail.oddsTrendCard.openingLine')}
                      </Text>
                      <Text style={styles.valueColumnValue}>{first ? cleanValueText(first) : '--'}</Text>
                    </View>
                    <Icon name="chevron-right" size={14} color={colors.textTertiary} style={{ marginHorizontal: spacing.xs }} />
                    <View style={styles.valueColumn}>
                      <Text style={styles.valueColumnLabel}>
                        {t('matchDetail.oddsTrendCard.closingLine')}
                      </Text>
                      <Text style={styles.valueColumnValue}>{second ? cleanValueText(second) : '--'}</Text>
                    </View>
                    {renderTrendBadge(change)}
                  </View>
                );

                if (numericValues.length >= 3) {
                  const chartData = values.map((val) => {
                    const numVal = parseValue(val);
                    const trend = getTrendDirection(val);
                    const cleanValue = cleanValueText(val);
                    return {
                      label: cleanValue,
                      value: numVal || 0,
                      color: trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.accent,
                    };
                  });

                  return (
                    <View key={rowIdx} style={styles.rowWithChart}>
                      <Text style={styles.rowLabel}>{rowLabel}</Text>
                      <SimpleCircularChart
                        data={chartData}
                        size={numericValues.length <= 3 ? 100 : 80}
                        showLabels={true}
                      />
                      {renderValueColumns(values[0], values[1], values[2])}
                    </View>
                  );
                }

                if (!values.length) {
                  return null;
                }

                const baseValue = values[0] ?? '';
                const trendValue = values.length > 1 ? values[1] : null;

                return (
                  <View key={rowIdx} style={styles.lineRow}>
                    <Text style={styles.rowLabelText}>{rowLabel}</Text>
                    <View style={styles.lineRowValues}>
                      <Text style={styles.lineValue}>{cleanValueText(baseValue) || baseValue || '--'}</Text>
                      {renderTrendBadge(trendValue)}
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
      marginBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lineRow: {
      paddingVertical: spacing.sm,
      marginBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    valuesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    lineRowValues: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    lineValue: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: '700',
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
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginHorizontal: spacing.xs / 2,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    valueText: {
      ...typography.bodySmall,
      fontWeight: '600',
      fontSize: isSmall ? 12 : typography.bodySmall.fontSize,
    },
    rowWithChart: {
      marginBottom: spacing.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.md,
      textAlign: 'center',
      fontSize: isSmall ? 14 : typography.body.fontSize,
    },
    valueComparison: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    valueColumn: {
      flex: 1,
      padding: spacing.sm,
    },
    valueColumnLabel: {
      ...typography.caption,
      color: colors.textTertiary,
      marginBottom: spacing.xs / 2,
    },
    valueColumnValue: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginLeft: spacing.sm,
      borderWidth: 1,
    },
    trendBadgeText: {
      ...typography.caption,
      fontWeight: '600',
      marginLeft: spacing.xs / 2,
    },
  });
};

const styles = getStyles();



