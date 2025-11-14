import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';

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
    if (result === 'W') return 'G';
    if (result === 'L') return 'M';
    if (result === 'D') return 'B';
    return '—';
  };

  // Clean title (remove emoji if present)
  const cleanTitle = title.replace(/📈\s*/, '').trim();

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

