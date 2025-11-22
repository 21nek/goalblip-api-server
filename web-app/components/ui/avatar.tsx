import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import { useState } from 'react';

type AvatarProps = {
  name: string;
  logo?: string | null;
  size?: number;
  fallbackColor?: string;
  style?: any;
};

export function Avatar({ name, logo, size = 36, fallbackColor, style }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(name);
  const showLogo = logo && !failed;
  
  // Fallback rengi belirle (takım adına göre)
  const bgColor = fallbackColor || getColorFromName(name);
  
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {showLogo ? (
        <Image
          source={{ uri: logo }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
          <Text style={[styles.fallbackText, { fontSize: size * 0.35 }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  
  return parts || name.slice(0, 1).toUpperCase() || '?';
}

// Takım adına göre renk üret (tutarlı renkler için)
function getColorFromName(name: string): string {
  if (!name) return colors.bgTertiary;
  
  // Basit hash fonksiyonu
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Renk paleti (koyu tema için uygun)
  const colorPalette = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Green
    '#06b6d4', // Cyan
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];
  
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.bgTertiary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgTertiary,
  },
  fallbackText: {
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

