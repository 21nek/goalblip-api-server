import { Platform, StyleSheet, Text, View } from 'react-native'

type StatCardProps = {
  label: string
  value: string
  caption?: string
}

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  )
}

const isWeb = Platform.OS === 'web'

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 110,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 14,
    marginRight: 12,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  value: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '600',
    marginTop: isWeb ? 6 : 0,
  },
  caption: {
    color: '#64748b',
    fontSize: 12,
    marginTop: isWeb ? 6 : 0,
  },
})
