import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoalBlip Demo Client',
  description: 'Gol Sinyali tahmin verilerini önizlemek için mini Next.js istemcisi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
