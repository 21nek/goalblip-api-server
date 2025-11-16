import { usePathname, useRouter } from 'expo-router';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/hooks/useTranslation';
import logoSquare from '@/assets/logo_square.png';

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  rightSlot?: React.ReactNode;
  showBottomNav?: boolean;
};

export function AppShell({ children, title, showBackButton = false, rightSlot, showBottomNav = true }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslation();

  const SafeAreaWrapper = Platform.OS === 'web' ? View : SafeAreaView;
  const safeAreaProps = Platform.OS === 'web' 
    ? {} 
    : { edges: showBottomNav ? (['top', 'bottom'] as const) : (['top'] as const) };
  
  return (
    <SafeAreaWrapper style={styles.safeArea} {...safeAreaProps}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Icon name="arrow-back" size={20} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.logoButton}
            onPress={() => {
              if (pathname !== '/') {
                router.push('/');
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t('common.home')}
          >
            <Image source={logoSquare} style={styles.logoImage} resizeMode="contain" />
          </TouchableOpacity>
        )}
        
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>GoalBlip</Text>
          {title ? <Text style={styles.subtitle}>{title}</Text> : null}
        </View>
        
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
      
      {children}
      
      {showBottomNav && (
        <BottomNavigation pathname={pathname} router={router} />
      )}
    </SafeAreaWrapper>
  );
}

function BottomNavigation({ pathname, router }: { pathname: string; router: any }) {
  const t = useTranslation();
  const tabs = [
    { path: '/', label: t('common.home'), icon: 'football' as const },
    { path: '/favorites', label: t('common.favorites'), icon: 'star' as const },
    { path: '/profile', label: t('common.profile'), icon: 'information-circle' as const },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        // Active state: exact match for home, startsWith for others
        const isActive = tab.path === '/' 
          ? pathname === '/' 
          : pathname.startsWith(tab.path);
        
        return (
          <TouchableOpacity
            key={tab.path}
            style={styles.bottomNavItem}
            onPress={() => {
              // Prevent unnecessary navigation if already on that tab
              if (!isActive) {
                router.push(tab.path);
              }
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={isActive ? colors.accent : colors.textTertiary}
            />
            <Text style={[styles.bottomNavLabel, isActive && styles.bottomNavLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    // Not sticky - scrolls with content
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    ...shadows.subtle,
  },
  logoButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
  },
  brand: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  rightSlot: {
    marginLeft: spacing.sm,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    minHeight: 48, // iOS/Android touch target
  },
  bottomNavLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  bottomNavLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
