import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/hooks/useTranslation';
import { DrawerMenu } from '@/components/layout/drawer-menu';
import { BackgroundPattern } from '@/components/ui/background-pattern';
// Logo PNG olarak kullanılıyor (SVG base64 PNG içeriyordu, React Native'de sorun çıkarıyordu)
const Logo = require('@/assets/logo.png');

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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const styles = getStyles(showBackButton);

  const SafeAreaWrapper = Platform.OS === 'web' ? View : SafeAreaView;
  const safeAreaProps = Platform.OS === 'web' 
    ? {} 
    : { edges: showBottomNav ? (['top', 'bottom'] as const) : (['top'] as const) };
  
  return (
    <SafeAreaWrapper style={styles.safeArea} {...safeAreaProps}>
      {/* Background Pattern - HTML'deki noktalı efekt */}
      <BackgroundPattern />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            {showBackButton ? (
              <>
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
                  activeOpacity={0.7}
                >
                  <Icon name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, styles.menuButtonWithBack]}
                  onPress={() => setDrawerVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.menu')}
                  activeOpacity={0.7}
                >
                  <Icon name="menu" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setDrawerVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={t('common.menu')}
                activeOpacity={0.7}
              >
                <Icon name="menu" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
          
          {title ? (
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>
            </View>
          ) : (
            <View style={styles.centerSection}>
              <Image 
                source={Logo} 
                style={[styles.centerLogo, { width: 32, height: 32 }]} 
                resizeMode="contain"
              />
            </View>
          )}
          
          <View style={styles.rightSection}>
            {rightSlot ? rightSlot : <View style={styles.rightPlaceholder} />}
          </View>
        </View>
      </View>
      
      {children}
      
      {showBottomNav && (
        <BottomNavigation pathname={pathname} router={router} styles={styles} />
      )}

      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaWrapper>
  );
}

function BottomNavigation({ pathname, router, styles }: { pathname: string; router: any; styles: ReturnType<typeof getStyles> }) {
  const t = useTranslation();
  const tabs = [
    { path: '/', label: t('common.home'), icon: 'football' as const },
    { path: '/favorites', label: t('common.favorites'), icon: 'star' as const },
    { path: '/settings', label: t('common.settings'), icon: 'settings' as const },
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

const getStyles = (showBackButton: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  headerContainer: {
    backgroundColor: colors.bgSecondary,
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    minHeight: Platform.OS === 'ios' ? 44 : 56,
    backgroundColor: 'transparent',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: showBackButton ? 96 : 48,
    justifyContent: 'flex-start',
  },
  menuButtonWithBack: {
    marginLeft: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  centerLogo: {
    marginBottom: spacing.xs / 2,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: Platform.OS === 'ios' ? 17 : 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: Platform.OS === 'ios' ? -0.4 : 0,
  },
  brand: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 44,
    height: 44,
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

const styles = getStyles(false);
