import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { LocaleProvider, useLocale } from '@/providers/locale-provider';
import { MatchesProvider } from '@/providers/matches-provider';
import { FavoritesProvider } from '@/providers/favorites-provider';

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

function RootLayoutContent() {
  const { initialSetupCompleted } = useLocale();
  const router = useRouter();
  const segments = useSegments();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Check if we need to show initial setup
    if (!initialSetupCompleted && !isNavigating) {
      const currentRoute = segments[0];
      if (currentRoute !== 'initial-setup') {
        setIsNavigating(true);
        router.replace('/initial-setup');
      }
    }
  }, [initialSetupCompleted, segments, router, isNavigating]);

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#050814' },
        // No animations - instant transitions
        animation: 'none',
        // Enable swipe gesture on both iOS and Android
        // iOS: native behavior, Android: some users prefer it
        gestureEnabled: true,
        // Optimize performance
        freezeOnBlur: false,
      }}
    >
      <Stack.Screen 
        name="initial-setup"
        options={{
          // Disable swipe back on initial setup (user must complete it)
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="index" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="matches/[matchId]" />
    </Stack>
  );
}

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
    <LocaleProvider>
      <FavoritesProvider>
        <MatchesProvider>
          <RootLayoutContent />
        </MatchesProvider>
      </FavoritesProvider>
    </LocaleProvider>
  );
}

