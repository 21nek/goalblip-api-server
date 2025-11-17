import { useRouter } from 'expo-router';
import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { MatchCard } from '@/components/home/match-card';
import { useTranslation } from '@/hooks/useTranslation';
import { useMatches } from '@/hooks/useMatches';
import { useLocale } from '@/providers/locale-provider';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { getContainerPadding } from '@/lib/responsive';
import type { MatchSummary } from '@/types/match';

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const SEARCH_MATCHES_LIMIT = 50;

export const DrawerMenu = memo(function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const t = useTranslation();
  const { locale } = useLocale();
  const { today, tomorrow } = useMatches();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'today' | 'tomorrow'>('today');
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const current = view === 'today' ? today : tomorrow;

  // Get matches - only when search is active
  const matches = useMemo(() => {
    // Don't load matches until user searches
    if (!search.trim()) {
      return [];
    }
    
    if (!current?.matches) return [];
    
    const term = search.trim().toLowerCase();
    const filtered = current.matches.filter((match) =>
      `${match.homeTeam} ${match.awayTeam} ${match.league}`.toLowerCase().includes(term)
    );
    
    // Limit to 50 matches when searching
    return filtered.slice(0, SEARCH_MATCHES_LIMIT);
  }, [current?.matches, search, view]);

  // Animate drawer
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleMatchPress = useCallback((match: MatchSummary) => {
    onClose();
    const params: { matchId: string; date?: string; view?: string } = {
      matchId: String(match.matchId),
    };
    if (current?.dataDate) params.date = current.dataDate;
    if (current?.view) params.view = current.view;
    router.push({ pathname: '/matches/[matchId]', params });
  }, [onClose, router, current?.dataDate, current?.view]);

  const styles = getStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>{t('drawer.title')}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, view === 'today' && styles.tabActive]}
                  onPress={() => setView('today')}
                >
                  <Text style={[styles.tabText, view === 'today' && styles.tabTextActive]}>
                    {t('home.today')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, view === 'tomorrow' && styles.tabActive]}
                  onPress={() => setView('tomorrow')}
                >
                  <Text style={[styles.tabText, view === 'tomorrow' && styles.tabTextActive]}>
                    {t('home.tomorrow')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
                <TextInput
                  placeholder={t('filter.searchPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  clearButtonMode="while-editing"
                />
                {search ? (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    style={styles.searchClear}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Matches List */}
            <FlatList
              data={matches}
              keyExtractor={(item) => String(item.matchId)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <MatchCard
                  match={item}
                  onPress={() => handleMatchPress(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  {search.trim() ? (
                    <>
                      <Icon name="search" size={48} color={colors.textTertiary} />
                      <Text style={styles.emptyText}>{t('home.noMatches')}</Text>
                      <Text style={styles.emptySubtext}>{t('home.noMatchesFiltered')}</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="search" size={48} color={colors.accent} />
                      <Text style={styles.emptyText}>{t('drawer.searchPrompt')}</Text>
                      <Text style={styles.emptySubtext}>{t('drawer.searchPromptDescription')}</Text>
                    </>
                  )}
                </View>
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </Animated.View>
      </View>
    </Modal>
  );
});

const getStyles = () => {
  const containerPadding = getContainerPadding();

  return StyleSheet.create({
    overlay: {
      flex: 1,
      flexDirection: 'row',
    },
    overlayTouchable: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '85%',
      maxWidth: 400,
      backgroundColor: colors.bgPrimary,
      ...shadows.elevated,
    },
    header: {
      backgroundColor: colors.bgSecondary,
      paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
      paddingBottom: spacing.md,
      paddingHorizontal: containerPadding,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.bgPrimary,
      borderRadius: borderRadius.full,
      padding: spacing.xs,
      marginBottom: spacing.md,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.accent,
    },
    tabText: {
      ...typography.bodySmall,
      color: colors.textTertiary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: colors.bgPrimary,
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgPrimary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: typography.body.fontSize,
      padding: 0,
      ...Platform.select({
        ios: {
          paddingVertical: spacing.xs,
        },
      }),
    },
    searchClear: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.bgTertiary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
    listContent: {
      padding: containerPadding,
      paddingBottom: spacing.xl * 2,
    },
    separator: {
      height: spacing.md,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl * 2,
    },
    emptyText: {
      ...typography.h3,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      ...typography.bodySmall,
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });
};

