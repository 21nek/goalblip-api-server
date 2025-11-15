import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { MatchesProvider } from '@/providers/matches-provider';

// Global error handler
const errorUtils = (globalThis as {
  ErrorUtils?: {
    getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | undefined;
    setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void;
  };
}).ErrorUtils;

const previousHandler = errorUtils?.getGlobalHandler?.();

errorUtils?.setGlobalHandler?.((error, isFatal) => {
  console.error('[GlobalError]', isFatal ? 'FATAL' : 'NON_FATAL', error.message, error.stack);
  previousHandler?.(error, isFatal);
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [fontsLoaded, fontError]);

  // Font yüklenene kadar veya hata olursa bile render et (web'de font yoksa da çalışsın)
  // if (!fontsLoaded && !fontError) {
  //   return null;
  // }

  return (
    <MatchesProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#050814' },
          // No animations - instant transitions
          animation: 'none',
          // Disable gestures for instant feel
          gestureEnabled: false,
          // Optimize performance
          freezeOnBlur: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="matches/[matchId]" />
      </Stack>
    </MatchesProvider>
  );
}

