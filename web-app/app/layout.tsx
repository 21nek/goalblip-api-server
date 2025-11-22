'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LocaleProvider, useLocale } from '@/providers/locale-provider';
import { MatchesProvider } from '@/providers/matches-provider';
import { FavoritesProvider } from '@/providers/favorites-provider';
import './globals.css';

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

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { initialSetupCompleted } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!initialSetupCompleted && !isNavigating && pathname !== '/initial-setup') {
      setIsNavigating(true);
      router.replace('/initial-setup');
    }
  }, [initialSetupCompleted, pathname, router, isNavigating]);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#181818' }}>
        <LocaleProvider>
          <FavoritesProvider>
            <MatchesProvider>
              <RootLayoutContent>{children}</RootLayoutContent>
            </MatchesProvider>
          </FavoritesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

