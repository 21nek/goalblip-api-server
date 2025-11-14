import { usePathname, useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const NAV_LINKS = [
  { label: 'Ana Sayfa', path: '/' },
  { label: 'Fikstür', path: '/matches' },
]

type AppShellProps = {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  rightSlot?: React.ReactNode
  contentStyle?: object
}

export function AppShell({ children, title, showBackButton = false, rightSlot, contentStyle }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Geri dön">
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/')} accessibilityRole="button" accessibilityLabel="Ana sayfa">
            <Text style={styles.logoIcon}>⚽</Text>
          </TouchableOpacity>
        )}
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>GoalBlip</Text>
          {title ? <Text style={styles.subtitle}>{title}</Text> : null}
        </View>
        {rightSlot || (
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/matches')} accessibilityRole="button" accessibilityLabel="Fikstür">
            <Text style={styles.actionButtonText}>Maçlar</Text>
          </TouchableOpacity>
        )}
      </View>
      {!showBackButton && (
        <View style={styles.navRow}>
          {NAV_LINKS.map((link, index) => {
            const active = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path))
            return (
              <TouchableOpacity
                key={link.path}
                style={[styles.navChip, active && styles.navChipActive, index < NAV_LINKS.length - 1 && styles.navChipSpacing]}
                onPress={() => router.push(link.path)}
              >
                <Text style={[styles.navChipText, active && styles.navChipTextActive]}>{link.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050814',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  logoIcon: {
    fontSize: 22,
    color: '#cbe043',
  },
  backText: {
    color: '#cbe043',
    fontSize: 18,
    fontWeight: '600',
  },
  brandBlock: {
    alignItems: 'center',
  },
  brand: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  actionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  actionButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navChip: {
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navChipSpacing: {
    marginRight: 12,
  },
  navChipActive: {
    borderColor: '#cbe043',
    backgroundColor: '#cbe04322',
  },
  navChipText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 12,
  },
  navChipTextActive: {
    color: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
})
