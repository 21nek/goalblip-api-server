import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import type { FormStats } from '@/lib/match-analysis';

type RiskFactor = {
  type: 'high' | 'medium' | 'low';
  message: string;
};

type RiskAnalysisCardProps = {
  homeTeam: {
    name: string;
    stats: FormStats;
  };
  awayTeam: {
    name: string;
    stats: FormStats;
  };
};

export function RiskAnalysisCard({ homeTeam, awayTeam }: RiskAnalysisCardProps) {
  const analyzeRisk = (team: { name: string; stats: FormStats }, isHome: boolean): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Form düşüşü
    if (team.stats.lossRate >= 60) {
      factors.push({
        type: 'high',
        message: `${team.name} son 5 maçta %${team.stats.lossRate.toFixed(0)} mağlubiyet oranıyla zorlanıyor.`,
      });
    } else if (team.stats.lossRate >= 40) {
      factors.push({
        type: 'medium',
        message: `${team.name} son maçlarda form düşüşü yaşıyor.`,
      });
    }

    // Kazanma serisi yok
    if (team.stats.currentStreak === 'loss' && team.stats.streakCount >= 3) {
      factors.push({
        type: 'high',
        message: `${team.name} ${team.stats.streakCount} maçtır kaybediyor.`,
      });
    }

    // Gol atma sorunu
    if (team.stats.avgGoalsFor < 0.8) {
      factors.push({
        type: 'high',
        message: `${team.name} son maçlarda gol atma konusunda zorlanıyor (maç başına ${team.stats.avgGoalsFor.toFixed(1)} gol).`,
      });
    }

    // Gol yeme sorunu
    if (team.stats.avgGoalsAgainst > 2) {
      factors.push({
        type: 'medium',
        message: `${team.name} son maçlarda çok gol yiyor (maç başına ${team.stats.avgGoalsAgainst.toFixed(1)} gol).`,
      });
    }

    // Form skoru düşük
    if (team.stats.formScore < 30) {
      factors.push({
        type: 'high',
        message: `${team.name} düşük form skoruna sahip (${team.stats.formScore.toFixed(0)}/100).`,
      });
    } else if (team.stats.formScore < 50) {
      factors.push({
        type: 'medium',
        message: `${team.name} orta seviye form skoruna sahip.`,
      });
    }

    // Deplasman zayıflığı (sadece deplasman takımı için)
    if (!isHome && team.stats.formScore < 40) {
      factors.push({
        type: 'medium',
        message: `${team.name} deplasman performansı zayıf.`,
      });
    }

    return factors;
  };

  const homeRisks = analyzeRisk(homeTeam, true);
  const awayRisks = analyzeRisk(awayTeam, false);

  const getRiskLevel = (factors: RiskFactor[]): 'high' | 'medium' | 'low' => {
    const highCount = factors.filter((f) => f.type === 'high').length;
    if (highCount >= 2) return 'high';
    if (highCount >= 1 || factors.filter((f) => f.type === 'medium').length >= 2) return 'medium';
    return 'low';
  };

  const homeRiskLevel = getRiskLevel(homeRisks);
  const awayRiskLevel = getRiskLevel(awayRisks);

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return colors.error;
    if (level === 'medium') return colors.warning;
    return colors.success;
  };

  const getRiskLabel = (level: 'high' | 'medium' | 'low') => {
    if (level === 'high') return 'Yüksek Risk';
    if (level === 'medium') return 'Orta Risk';
    return 'Düşük Risk';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Risk Analizi</Text>

      <View style={styles.teamsRow}>
        <View style={styles.teamRisk}>
          <View style={styles.riskHeader}>
            <Text style={styles.teamName}>{homeTeam.name}</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(homeRiskLevel) + '20' }]}>
              <Text style={[styles.riskBadgeText, { color: getRiskColor(homeRiskLevel) }]}>
                {getRiskLabel(homeRiskLevel)}
              </Text>
            </View>
          </View>
          {homeRisks.length > 0 ? (
            <View style={styles.factorsList}>
              {homeRisks.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <Icon
                    name={factor.type === 'high' ? 'warning' : 'information-circle'}
                    size={16}
                    color={getRiskColor(factor.type)}
                  />
                  <Text style={styles.factorText}>{factor.message}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noRiskText}>Belirgin risk faktörü yok</Text>
          )}
        </View>

        <View style={styles.teamRisk}>
          <View style={styles.riskHeader}>
            <Text style={styles.teamName}>{awayTeam.name}</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(awayRiskLevel) + '20' }]}>
              <Text style={[styles.riskBadgeText, { color: getRiskColor(awayRiskLevel) }]}>
                {getRiskLabel(awayRiskLevel)}
              </Text>
            </View>
          </View>
          {awayRisks.length > 0 ? (
            <View style={styles.factorsList}>
              {awayRisks.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <Icon
                    name={factor.type === 'high' ? 'warning' : 'information-circle'}
                    size={16}
                    color={getRiskColor(factor.type)}
                  />
                  <Text style={styles.factorText}>{factor.message}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noRiskText}>Belirgin risk faktörü yok</Text>
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  teamsRow: {
    gap: spacing.md,
  },
  teamRisk: {
    padding: spacing.md,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  teamName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  riskBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  factorsList: {
    gap: spacing.xs,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  factorText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  noRiskText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});

