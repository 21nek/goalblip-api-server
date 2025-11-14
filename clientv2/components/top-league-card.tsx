import { Platform, StyleSheet, Text, View } from 'react-native'

type TopLeagueCardProps = {
  league: string
  total: number
  kickoff?: string | null
}

export function TopLeagueCard({ league, total, kickoff }: TopLeagueCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.league}>{league}</Text>
      <Text style={styles.total}>{total} maç</Text>
      <Text style={styles.kickoff}>{kickoff ? `İlk maç ${kickoff}` : 'Kickoff bekleniyor'}</Text>
    </View>
  )
}

const isWeb = Platform.OS === 'web'

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: '#111b2f',
    padding: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  league: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  total: {
    color: '#cbe043',
    fontSize: 24,
    fontWeight: '700',
    marginTop: isWeb ? 6 : 0,
  },
  kickoff: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: isWeb ? 6 : 0,
  },
})
