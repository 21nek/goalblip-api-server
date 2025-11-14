import { Stack } from 'expo-router'
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_400Regular } from '@expo-google-fonts/inter'
import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'

import { MatchesProvider } from '@/providers/matches-provider'

const errorUtils = (globalThis as { ErrorUtils?: { getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | undefined; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void } }).ErrorUtils
const previousHandler = errorUtils?.getGlobalHandler?.()
errorUtils?.setGlobalHandler?.((error, isFatal) => {
  console.error('[GlobalError]', isFatal ? 'FATAL' : 'NON_FATAL', error.message, error.stack)
  previousHandler?.(error, isFatal)
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_500Medium, Inter_600SemiBold, Inter_400Regular })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => null)
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <MatchesProvider>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="matches/index" />
        <Stack.Screen name="matches/[matchId]" />
      </Stack>
    </MatchesProvider>
  )
}
