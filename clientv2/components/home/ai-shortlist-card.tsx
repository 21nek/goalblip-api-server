import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import type { MatchDetail, MatchSummary } from '@/types/match'

interface Props {
  match: MatchSummary
  detail?: MatchDetail | null
  loading?: boolean
  onPress: () => void
}

export function AIShortlistCard({ match, detail, loading, onPress }: Props) {
  const highlight = detail?.highlightPredictions?.find((item) => !item.locked) ?? detail?.highlightPredictions?.[0]
  const detailConfidence = detail?.detailPredictions?.[0]?.confidence ?? null
  const successValue = highlight?.successRate ?? detailConfidence ?? null
  const successText = successValue ? `~%${successValue}` : null
  const locked = highlight?.locked
  const hasPrediction = Boolean(highlight?.pickCode || highlight?.title || detailConfidence)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={loading}>
      <View style={styles.rowBetween}>
        <Text style={styles.league}>{match.league || 'Lig'}</Text>
        {locked ? <Text style={styles.locked}>🔒</Text> : null}
      </View>
      <Text style={styles.teams}>{match.homeTeam}</Text>
      <Text style={styles.vs}>vs</Text>
      <Text style={styles.teams}>{match.awayTeam}</Text>
      <View style={styles.predictionBox}>
        {loading ? (
          <ActivityIndicator color="#cbe043" />
        ) : hasPrediction ? (
          <>
            <Text style={styles.predictionLabel}>{highlight?.title || 'Tahmin bekleniyor'}</Text>
            <Text style={styles.predictionValue}>{highlight?.pickCode || 'N/A'}</Text>
            {successText ? <Text style={styles.predictionMeta}>{successText}</Text> : null}
          </>
        ) : (
          <>
            <Text style={styles.predictionLabel}>AI tahmini yok</Text>
            <Text style={styles.predictionMeta}>Bu maç için analiz henüz hazır değil.</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

const isWeb = Platform.OS === 'web'

const styles = StyleSheet.create({
  card: {
    width: 240,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginRight: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  league: {
    color: '#94a3b8',
    fontSize: 12,
  },
  locked: {
    color: '#cbe043',
  },
  teams: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginTop: isWeb ? 4 : 0,
  },
  vs: {
    color: '#94a3b8',
    fontSize: 12,
    marginVertical: isWeb ? 4 : 0,
  },
  predictionBox: {
    backgroundColor: '#111b2f',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    minHeight: 90,
    justifyContent: 'center',
  },
  predictionLabel: {
    color: '#cbd5f5',
    fontSize: 12,
  },
  predictionValue: {
    color: '#cbe043',
    fontSize: 24,
    fontWeight: '700',
    marginTop: isWeb ? 6 : 0,
  },
  predictionMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: isWeb ? 4 : 0,
  },
})
