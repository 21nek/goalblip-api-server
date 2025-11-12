import './globals.css';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/src/components/theme-provider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
