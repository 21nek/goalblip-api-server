import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { useTranslation } from '@/hooks/useTranslation';

type RecentFormMatch = {
  result?: string | null;
  opponent?: string | null;
  competition?: string | null;
  date?: string | null;
  score?: string | null;
};

type RecentFormCardProps = {
  title: string;
  matches: RecentFormMatch[];
};

export function RecentFormCard({ title, matches }: RecentFormCardProps) {
  const t = useTranslation();
  if (!matches || matches.length === 0) {
    return null;
  }

  const getResultColor = (result: string | null | undefined) => {
    if (result === 'W') return colors.success;
    if (result === 'L') return colors.error;
    if (result === 'D') return colors.warning;
    return colors.textTertiary;
  };

  const getResultLabel = (result: string | null | undefined) => {
    if (result === 'W') return t('matchDetail.recentFormCard.resultLabels.win');
    if (result === 'L') return t('matchDetail.recentFormCard.resultLabels.loss');
    if (result === 'D') return t('matchDetail.recentFormCard.resultLabels.draw');
    return t('matchDetail.recentFormCard.resultLabels.unknown');
  };

  const cleanTitle = getLocalizedTitle(title, t);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{cleanTitle}</Text>
      <View style={styles.matchesContainer}>
        {matches.map((match, index) => {
          const result = match.result || null;
          const resultColor = getResultColor(result);
          const resultLabel = getResultLabel(result);

          return (
            <View key={index} style={styles.matchRow}>
              <View style={[styles.resultBadge, { backgroundColor: resultColor }]}>
                <Text style={styles.resultText}>{resultLabel}</Text>
              </View>
              <View style={styles.matchInfo}>
                <Text style={styles.opponent}>{match.opponent || '—'}</Text>
                {match.score && (
                  <Text style={styles.score}>{match.score}</Text>
                )}
              </View>
            </View>
          );
        })}
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
  },
  matchesContainer: {
    gap: spacing.sm,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  resultText: {
    ...typography.caption,
    color: colors.bgPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  matchInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opponent: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  score: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

function getLocalizedTitle(rawTitle: string, t: ReturnType<typeof useTranslation>): string {
  if (!rawTitle) return t('matchDetail.recentFormCard.titleFallback');
  const cleaned = rawTitle.replace(/📈/g, '').trim();
  if (!cleaned) return t('matchDetail.recentFormCard.titleFallback');
  const normalized = cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (normalized.includes('ev') && normalized.includes('sahibi')) {
    return t('matchDetail.recentFormCard.homeTitle');
  }
  if (normalized.includes('deplasman')) {
    return t('matchDetail.recentFormCard.awayTitle');
  }
  if (normalized.includes('home')) {
    return t('matchDetail.recentFormCard.homeTitle');
  }
  if (normalized.includes('away') || normalized.includes('visitante') || normalized.includes('visitor')) {
    return t('matchDetail.recentFormCard.awayTitle');
  }
  return cleaned;
}
