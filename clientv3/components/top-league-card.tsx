import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';

type TopLeagueCardProps = {
  league: string;
  total: number;
  kickoff?: string | null;
};

export function TopLeagueCard({ league, total, kickoff }: TopLeagueCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.league}>{league}</Text>
      <Text style={styles.total}>{total} maç</Text>
      <Text style={styles.kickoff}>
        {kickoff ? `İlk maç ${kickoff}` : 'Kickoff bekleniyor'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
      card: {
        width: 200,
        backgroundColor: colors.bgTertiary,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        ...shadows.card,
      },
  league: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  total: {
    ...typography.h2,
    color: colors.accent,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  kickoff: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 6,
  },
});

