import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';

type HeadToHeadMatch = {
  date?: string | null;
  competition?: string | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  score?: string | null;
};

type HeadToHeadCardProps = {
  matches: HeadToHeadMatch[];
  currentHomeTeam?: string | null;
  currentAwayTeam?: string | null;
};

export function HeadToHeadCard({ matches, currentHomeTeam, currentAwayTeam }: HeadToHeadCardProps) {
  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geçmiş Karşılaşmalar</Text>
      <View style={styles.matchesContainer}>
        {matches.map((match, index) => {
          // Parse score to determine winner
          const scoreParts = match.score?.split('-') || [];
          const homeScore = scoreParts[0] ? parseInt(scoreParts[0].trim(), 10) : null;
          const awayScore = scoreParts[1] ? parseInt(scoreParts[1].trim(), 10) : null;
          
          let winner: 'home' | 'away' | 'draw' = 'draw';
          if (homeScore !== null && awayScore !== null) {
            if (homeScore > awayScore) winner = 'home';
            else if (awayScore > homeScore) winner = 'away';
            else winner = 'draw';
          }

          // Check if current teams won
          const isCurrentHomeWinner = winner === 'home' && match.homeTeam === currentHomeTeam;
          const isCurrentAwayWinner = winner === 'away' && match.awayTeam === currentAwayTeam;

          return (
            <View key={index} style={styles.matchRow}>
              <View style={styles.dateColumn}>
                <Text style={styles.date}>{match.date || '—'}</Text>
                {match.competition && (
                  <Text style={styles.competition}>{match.competition}</Text>
                )}
              </View>
              <View style={styles.teamsColumn}>
                <View style={styles.teamRow}>
                  <Text
                    style={[
                      styles.teamName,
                      isCurrentHomeWinner && styles.winner,
                    ]}
                  >
                    {match.homeTeam || '—'}
                  </Text>
                  <Text style={styles.score}>{match.score || '—'}</Text>
                  <Text
                    style={[
                      styles.teamName,
                      isCurrentAwayWinner && styles.winner,
                    ]}
                  >
                    {match.awayTeam || '—'}
                  </Text>
                </View>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateColumn: {
    width: 80,
    marginRight: spacing.md,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  competition: {
    ...typography.caption,
    color: colors.textTertiary,
    fontSize: 10,
  },
  teamsColumn: {
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  winner: {
    color: colors.success,
    fontWeight: '700',
  },
  score: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
    marginHorizontal: spacing.sm,
    minWidth: 40,
    textAlign: 'center',
  },
});

