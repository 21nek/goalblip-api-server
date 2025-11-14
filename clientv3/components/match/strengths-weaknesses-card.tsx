import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import type { FormStats } from '@/lib/match-analysis';

type StrengthsWeaknessesCardProps = {
  homeTeam: {
    name: string;
    stats: FormStats;
  };
  awayTeam: {
    name: string;
    stats: FormStats;
  };
};

export function StrengthsWeaknessesCard({ homeTeam, awayTeam }: StrengthsWeaknessesCardProps) {
  const analyzeTeam = (team: { name: string; stats: FormStats }) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Form analysis
    if (team.stats.formScore >= 70) {
      strengths.push('Yüksek form skoru');
    } else if (team.stats.formScore < 40) {
      weaknesses.push('Düşük form skoru');
    }

    // Win rate
    if (team.stats.winRate >= 60) {
      strengths.push('Yüksek kazanma oranı');
    } else if (team.stats.winRate < 30) {
      weaknesses.push('Düşük kazanma oranı');
    }

    // Goal scoring
    if (team.stats.avgGoalsFor >= 2) {
      strengths.push('Güçlü hücum (gol atma)');
    } else if (team.stats.avgGoalsFor < 1) {
      weaknesses.push('Zayıf hücum (az gol)');
    }

    // Defense
    if (team.stats.avgGoalsAgainst <= 0.8) {
      strengths.push('Güçlü savunma (az gol yeme)');
    } else if (team.stats.avgGoalsAgainst >= 2) {
      weaknesses.push('Zayıf savunma (çok gol yeme)');
    }

    // Goal difference
    if (team.stats.goalDifference >= 1) {
      strengths.push('Pozitif gol farkı');
    } else if (team.stats.goalDifference <= -1) {
      weaknesses.push('Negatif gol farkı');
    }

    // Streak
    if (team.stats.currentStreak === 'win' && team.stats.streakCount >= 3) {
      strengths.push(`${team.stats.streakCount} maç kazanma serisi`);
    } else if (team.stats.currentStreak === 'loss' && team.stats.streakCount >= 3) {
      weaknesses.push(`${team.stats.streakCount} maç kaybetme serisi`);
    }

    return { strengths, weaknesses };
  };

  const homeAnalysis = analyzeTeam(homeTeam);
  const awayAnalysis = analyzeTeam(awayTeam);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Güçlü ve Zayıf Yönler</Text>
      <Text style={styles.subtitle}>Her takımın performans analizi</Text>

      <View style={styles.teamsContainer}>
        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{homeTeam.name}</Text>
            <View style={styles.homeBadge}>
              <Text style={styles.homeBadgeText}>EV</Text>
            </View>
          </View>

          {homeAnalysis.strengths.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.sectionTitle}>Güçlü Yönler</Text>
              </View>
              {homeAnalysis.strengths.map((strength, index) => (
                <View key={index} style={styles.item}>
                  <View style={[styles.itemDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.itemText}>{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {homeAnalysis.weaknesses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="warning" size={16} color={colors.error} />
                <Text style={[styles.sectionTitle, { color: colors.error }]}>Zayıf Yönler</Text>
              </View>
              {homeAnalysis.weaknesses.map((weakness, index) => (
                <View key={index} style={styles.item}>
                  <View style={[styles.itemDot, { backgroundColor: colors.error }]} />
                  <Text style={styles.itemText}>{weakness}</Text>
                </View>
              ))}
            </View>
          )}

          {homeAnalysis.strengths.length === 0 && homeAnalysis.weaknesses.length === 0 && (
            <Text style={styles.noData}>Yeterli veri yok</Text>
          )}
        </View>

        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{awayTeam.name}</Text>
            <View style={styles.awayBadge}>
              <Text style={styles.awayBadgeText}>DEP</Text>
            </View>
          </View>

          {awayAnalysis.strengths.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.sectionTitle}>Güçlü Yönler</Text>
              </View>
              {awayAnalysis.strengths.map((strength, index) => (
                <View key={index} style={styles.item}>
                  <View style={[styles.itemDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.itemText}>{strength}</Text>
                </View>
              ))}
            </View>
          )}

          {awayAnalysis.weaknesses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="warning" size={16} color={colors.error} />
                <Text style={[styles.sectionTitle, { color: colors.error }]}>Zayıf Yönler</Text>
              </View>
              {awayAnalysis.weaknesses.map((weakness, index) => (
                <View key={index} style={styles.item}>
                  <View style={[styles.itemDot, { backgroundColor: colors.error }]} />
                  <Text style={styles.itemText}>{weakness}</Text>
                </View>
              ))}
            </View>
          )}

          {awayAnalysis.strengths.length === 0 && awayAnalysis.weaknesses.length === 0 && (
            <Text style={styles.noData}>Yeterli veri yok</Text>
          )}
        </View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  teamsContainer: {
    gap: spacing.md,
  },
  teamSection: {
    padding: spacing.md,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  homeBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  homeBadgeText: {
    ...typography.caption,
    color: colors.bgPrimary,
    fontWeight: '700',
    fontSize: 10,
  },
  awayBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  awayBadgeText: {
    ...typography.caption,
    color: colors.bgPrimary,
    fontWeight: '700',
    fontSize: 10,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  itemText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  noData: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});

