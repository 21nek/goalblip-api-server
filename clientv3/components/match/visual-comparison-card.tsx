import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { SimpleCircularChart } from '@/components/ui/simple-chart';
import { getCardPadding, screenDimensions } from '@/lib/responsive';
import { Icon } from '@/components/ui/icon';
import type { FormStats } from '@/lib/match-analysis';

type VisualComparisonCardProps = {
  homeTeam: {
    name: string;
    stats: FormStats;
  };
  awayTeam: {
    name: string;
    stats: FormStats;
  };
};

export function VisualComparisonCard({ homeTeam, awayTeam }: VisualComparisonCardProps) {
  const metrics = [
    {
      label: 'Form Skoru',
      homeValue: homeTeam.stats.formScore,
      awayValue: awayTeam.stats.formScore,
      maxValue: 100,
      unit: '/100',
    },
    {
      label: 'Kazanma %',
      homeValue: homeTeam.stats.winRate,
      awayValue: awayTeam.stats.winRate,
      maxValue: 100,
      unit: '%',
    },
    {
      label: 'Gol Ortalaması',
      homeValue: homeTeam.stats.avgGoalsFor,
      awayValue: awayTeam.stats.avgGoalsFor,
      maxValue: Math.max(homeTeam.stats.avgGoalsFor, awayTeam.stats.avgGoalsFor, 3),
      unit: ' gol/maç',
    },
    {
      label: 'Savunma',
      homeValue: 100 - (homeTeam.stats.avgGoalsAgainst * 20), // Invert: less goals = higher score
      awayValue: 100 - (awayTeam.stats.avgGoalsAgainst * 20),
      maxValue: 100,
      unit: ' (az gol = iyi)',
      showOriginal: true,
      homeOriginal: homeTeam.stats.avgGoalsAgainst,
      awayOriginal: awayTeam.stats.avgGoalsAgainst,
    },
  ];

  const getAdvantage = (home: number, away: number) => {
    const diff = home - away;
    if (Math.abs(diff) < 5) return { team: null, color: colors.info };
    return diff > 0
      ? { team: homeTeam.name, color: colors.success }
      : { team: awayTeam.name, color: colors.success };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performans Karşılaştırması</Text>
      <Text style={styles.subtitle}>İki takımın metriklerini görsel olarak karşılaştırın</Text>

      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => {
          const advantage = getAdvantage(metric.homeValue, metric.awayValue);
          
          // For circular chart, we normalize each value to 0-100 range based on maxValue
          // Then use these normalized values as the "total" for percentage calculation
          const homeNormalized = metric.maxValue > 0 ? Math.max(0, Math.min(100, (metric.homeValue / metric.maxValue) * 100)) : 0;
          const awayNormalized = metric.maxValue > 0 ? Math.max(0, Math.min(100, (metric.awayValue / metric.maxValue) * 100)) : 0;
          
          // Use normalized values directly - they represent percentage of maxValue
          const chartData = [
            {
              label: homeTeam.name.substring(0, 12),
              value: homeNormalized,
              color: colors.accent,
            },
            {
              label: awayTeam.name.substring(0, 12),
              value: awayNormalized,
              color: colors.info,
            },
          ];

          // Get display values
          const homeDisplay = metric.showOriginal && metric.homeOriginal !== undefined
            ? `${metric.homeOriginal.toFixed(1)}${metric.unit}`
            : `${metric.homeValue.toFixed(1)}${metric.unit}`;
          const awayDisplay = metric.showOriginal && metric.awayOriginal !== undefined
            ? `${metric.awayOriginal.toFixed(1)}${metric.unit}`
            : `${metric.awayValue.toFixed(1)}${metric.unit}`;

          return (
            <View key={index} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                {advantage.team && (
                  <View style={[styles.advantageBadge, { backgroundColor: advantage.color + '20' }]}>
                    <Icon name="checkmark-circle" size={12} color={advantage.color} style={{ marginRight: spacing.xs / 2 }} />
                    <Text style={[styles.advantageText, { color: advantage.color }]}>
                      {advantage.team.substring(0, 10)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.chartContainer}>
                <SimpleCircularChart
                  data={chartData}
                  size={screenDimensions.isSmall ? 100 : 110}
                  showLabels={false}
                  useDirectValues={true}
                />
                <View style={styles.teamLabelsRow}>
                  <View style={styles.teamLabelItem}>
                    <Text style={[styles.teamLabel, { color: colors.accent }]} numberOfLines={1} ellipsizeMode="tail">
                      {homeTeam.name}
                    </Text>
                  </View>
                  <View style={styles.teamLabelItem}>
                    <Text style={[styles.teamLabel, { color: colors.info }]} numberOfLines={1} ellipsizeMode="tail">
                      {awayTeam.name}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.valuesRow}>
                <View style={styles.valueItem}>
                  <Text style={[styles.valueText, { color: colors.accent }]}>• {homeDisplay}</Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={[styles.valueText, { color: colors.info }]}>• {awayDisplay}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
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
      marginBottom: spacing.xs,
      fontSize: isSmall ? 18 : typography.h3.fontSize,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textTertiary,
      marginBottom: spacing.md,
    },
    metricsContainer: {
      // gap handled by individual margins
    },
    metricCard: {
      padding: cardPadding,
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    metricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      flexWrap: 'wrap',
    },
    metricLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      flex: 1,
      fontSize: isSmall ? 14 : typography.body.fontSize,
    },
    advantageBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.xs,
    },
    advantageText: {
      ...typography.caption,
      fontWeight: '700',
      fontSize: 10,
    },
    chartContainer: {
      alignItems: 'center',
      marginBottom: spacing.md,
      maxWidth: '100%',
      overflow: 'hidden',
    },
    teamLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: spacing.sm,
    },
    teamLabelItem: {
      flex: 1,
      alignItems: 'center',
    },
    teamLabel: {
      ...typography.caption,
      fontWeight: '600',
      fontSize: isSmall ? 9 : 10,
      textAlign: 'center',
      maxWidth: '100%',
    },
    valuesRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    valueItem: {
      flex: 1,
      alignItems: 'center',
    },
    valueText: {
      ...typography.bodySmall,
      fontWeight: '600',
      fontSize: isSmall ? 11 : 12,
    },
  });
};

const styles = getStyles();

