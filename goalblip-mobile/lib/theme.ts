import { Platform } from 'react-native';

// Tema renkleri ve sabitler
export const colors = {
  // Backgrounds - Kademeli koyu tonlar (#181818 ve #212121)
  bgPrimary: '#181818', // Ana arkaplan (daha koyu)
  bgSecondary: '#212121', // Kartlar, header (daha açık)
  bgTertiary: 'rgba(255, 255, 255, 0.03)',
  bgCard: '#212121', // Kart arkaplanı
  bgCardHover: 'rgba(255, 255, 255, 0.05)',
  
  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5f5',
  textTertiary: '#94a3b8',
  textMuted: '#64748b',
  
  // Accent
  accent: '#cbe043',
  accentDark: '#a8c030',
  accentLight: '#d4e85a',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Borders - HTML'deki beyaz opacity'leri
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  
  // Overlays - Kademeli koyu tonlar
  overlay: 'rgba(24, 24, 24, 0.8)', // #181818
  overlayLight: 'rgba(24, 24, 24, 0.6)', // #181818
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
};

// Shadow/Elevation sistemi - Platform-specific
const createShadow = (offset: { width: number; height: number }, radius: number, opacity: number, elevation: number) => {
  if (Platform.OS === 'web') {
    // Web için boxShadow kullan
    const { width, height } = offset;
    return {
      boxShadow: `${width}px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  // React Native için shadow props kullan
  return {
    shadowColor: '#000',
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const shadows = {
  // Card shadow (default)
  card: createShadow({ width: 0, height: 2 }, 4, 0.1, 3),
  // Elevated card shadow (daha yüksek)
  elevated: createShadow({ width: 0, height: 4 }, 8, 0.15, 6),
  // Subtle shadow (hafif)
  subtle: createShadow({ width: 0, height: 1 }, 2, 0.05, 1),
};

