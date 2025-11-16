import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/hooks/useTranslation';
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
  const t = useTranslation();
  const analyzeRisk = (team: { name: string; stats: FormStats }, isHome: boolean): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Form düşüşü
    if (team.stats.lossRate >= 60) {
      factors.push({
        type: 'high',
        message: t('matchDetail.riskAnalysisCard.factors.highLossRate', {
          team: team.name,
          lossRate: team.stats.lossRate.toFixed(0),
        }),
      });
    } else if (team.stats.lossRate >= 40) {
      factors.push({
        type: 'medium',
        message: t('matchDetail.riskAnalysisCard.factors.mediumLossRate', { team: team.name }),
      });
    }

    // Kazanma serisi yok
    if (team.stats.currentStreak === 'loss' && team.stats.streakCount >= 3) {
      factors.push({
        type: 'high',
        message: t('matchDetail.riskAnalysisCard.factors.lossStreak', {
          team: team.name,
          streak: team.stats.streakCount,
        }),
      });
    }

    // Gol atma sorunu
    if (team.stats.avgGoalsFor < 0.8) {
      factors.push({
        type: 'high',
        message: t('matchDetail.riskAnalysisCard.factors.lowScoring', {
          team: team.name,
          goalsFor: team.stats.avgGoalsFor.toFixed(1),
        }),
      });
    }

    // Gol yeme sorunu
    if (team.stats.avgGoalsAgainst > 2) {
      factors.push({
        type: 'medium',
        message: t('matchDetail.riskAnalysisCard.factors.highConceding', {
          team: team.name,
          goalsAgainst: team.stats.avgGoalsAgainst.toFixed(1),
        }),
      });
    }

    // Form skoru düşük
    if (team.stats.formScore < 30) {
      factors.push({
        type: 'high',
        message: t('matchDetail.riskAnalysisCard.factors.lowFormScore', {
          team: team.name,
          formScore: team.stats.formScore.toFixed(0),
        }),
      });
    } else if (team.stats.formScore < 50) {
      factors.push({
        type: 'medium',
        message: t('matchDetail.riskAnalysisCard.factors.mediumFormScore', { team: team.name }),
      });
    }

    // Deplasman zayıflığı (sadece deplasman takımı için)
    if (!isHome && team.stats.formScore < 40) {
      factors.push({
        type: 'medium',
        message: t('matchDetail.riskAnalysisCard.factors.weakAway', { team: team.name }),
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
    if (level === 'high') return t('matchDetail.riskAnalysisCard.riskLevel.high');
    if (level === 'medium') return t('matchDetail.riskAnalysisCard.riskLevel.medium');
    return t('matchDetail.riskAnalysisCard.riskLevel.low');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('matchDetail.riskAnalysisCard.title')}</Text>

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
            <Text style={styles.noRiskText}>{t('matchDetail.riskAnalysisCard.noRisk')}</Text>
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
            <Text style={styles.noRiskText}>{t('matchDetail.riskAnalysisCard.noRisk')}</Text>
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
