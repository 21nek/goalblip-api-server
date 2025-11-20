import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const supportsNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: supportsNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: supportsNativeDriver,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.bgTertiary,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width={60} height={16} style={styles.marginBottom} />
      <Skeleton width="80%" height={24} style={styles.marginBottom} />
      <Skeleton width="60%" height={16} />
    </View>
  );
}

export function SkeletonMatchCard() {
  return (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Skeleton width={80} height={12} />
        <Skeleton width={50} height={16} />
      </View>
      <View style={styles.matchTeams}>
        <Skeleton width={100} height={18} />
        <Skeleton width={30} height={18} />
        <Skeleton width={100} height={18} />
      </View>
      <Skeleton width={60} height={12} style={styles.marginTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  marginBottom: {
    marginBottom: spacing.sm,
  },
  marginTop: {
    marginTop: spacing.sm,
  },
  matchCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leagueContent: {
    flex: 1,
  },
  marginRight: {
    marginRight: 10,
  },
});

