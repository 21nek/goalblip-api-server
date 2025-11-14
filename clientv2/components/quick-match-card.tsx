import { StyleSheet, Text, View } from 'react-native'

type QuickMatchCardProps = {
  title: string
  value: string
  stat: string
}

export function QuickMatchCard({ title, value, stat }: QuickMatchCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.stat}>{stat}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#94a3b8',
    fontSize: 12,
  },
  value: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  stat: {
    color: '#cbe043',
    fontSize: 18,
    fontWeight: '700',
  },
})
