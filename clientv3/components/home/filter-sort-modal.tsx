import { memo, useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { getContainerPadding, screenDimensions } from '@/lib/responsive';

type LeagueFilter = {
  key: string;
  name: string;
  total: number;
};

export type SortOption = 
  | 'league'      // Group by league (default)
  | 'time'        // Sort by kickoff time
  | 'date'        // Sort by date then time
  | 'team';       // Sort alphabetically by team name

export type ViewOption = 
  | 'grouped'     // Group by league (default)
  | 'flat';       // Flat list without grouping

type FilterSortModalProps = {
  visible: boolean;
  onClose: () => void;
  leagues: LeagueFilter[];
  selectedLeagues: string[];
  onToggleLeague: (league: string) => void;
  onSelectAllLeagues: () => void;
  onClearAllLeagues: () => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  viewOption: ViewOption;
  onViewChange: (option: ViewOption) => void;
};

export const FilterSortModal = memo(function FilterSortModal({
  visible,
  onClose,
  leagues,
  selectedLeagues,
  onToggleLeague,
  onSelectAllLeagues,
  onClearAllLeagues,
  sortOption,
  onSortChange,
  viewOption,
  onViewChange,
}: FilterSortModalProps) {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<'filters' | 'sort' | 'view'>('filters');
  const [leagueSearchQuery, setLeagueSearchQuery] = useState('');
  const styles = getStyles();

  // Filter leagues based on search
  const filteredLeagues = useMemo(() => {
    if (!leagueSearchQuery.trim()) return leagues;
    const query = leagueSearchQuery.trim().toLowerCase();
    return leagues.filter((league) => league.name.toLowerCase().includes(query));
  }, [leagues, leagueSearchQuery]);

  const allLeaguesSelected = selectedLeagues.length === 0;
  const hasLeagueSelections = selectedLeagues.length > 0;

  const sortOptions: Array<{ value: SortOption; labelKey: string; icon: string }> = [
    { value: 'league', labelKey: 'filterSort.sortByLeague', icon: 'trophy' },
    { value: 'time', labelKey: 'filterSort.sortByTime', icon: 'time' },
    { value: 'date', labelKey: 'filterSort.sortByDate', icon: 'time' },
    { value: 'team', labelKey: 'filterSort.sortByTeam', icon: 'football' },
  ];

  const viewOptions: Array<{ value: ViewOption; labelKey: string; icon: string }> = [
    { value: 'grouped', labelKey: 'filterSort.viewGrouped', icon: 'trophy' },
    { value: 'flat', labelKey: 'filterSort.viewFlat', icon: 'football' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('filterSort.title')}</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'filters' && styles.tabActive]}
              onPress={() => setActiveTab('filters')}
            >
              <Icon
                name="trophy"
                size={18}
                color={activeTab === 'filters' ? colors.accent : colors.textTertiary}
              />
              <Text style={[styles.tabText, activeTab === 'filters' && styles.tabTextActive]}>
                {t('filterSort.tabs.filters')}
              </Text>
              {hasLeagueSelections && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedLeagues.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sort' && styles.tabActive]}
              onPress={() => setActiveTab('sort')}
            >
              <Icon
                name="time"
                size={18}
                color={activeTab === 'sort' ? colors.accent : colors.textTertiary}
              />
              <Text style={[styles.tabText, activeTab === 'sort' && styles.tabTextActive]}>
                {t('filterSort.tabs.sort')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'view' && styles.tabActive]}
              onPress={() => setActiveTab('view')}
            >
              <Icon
                name="settings"
                size={18}
                color={activeTab === 'view' ? colors.accent : colors.textTertiary}
              />
              <Text style={[styles.tabText, activeTab === 'view' && styles.tabTextActive]}>
                {t('filterSort.tabs.view')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {activeTab === 'filters' && (
            <>
              {/* League Search */}
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
                <TextInput
                  placeholder={t('filter.searchPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={leagueSearchQuery}
                  onChangeText={setLeagueSearchQuery}
                  style={styles.searchInput}
                  clearButtonMode="while-editing"
                />
                {leagueSearchQuery ? (
                  <TouchableOpacity
                    onPress={() => setLeagueSearchQuery('')}
                    style={styles.searchClear}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={onSelectAllLeagues}
                  style={[styles.actionButton, allLeaguesSelected && styles.actionButtonActive]}
                >
                  <Text style={[styles.actionButtonText, allLeaguesSelected && styles.actionButtonTextActive]}>
                    {t('filter.all')}
                  </Text>
                </TouchableOpacity>
                {hasLeagueSelections && (
                  <TouchableOpacity
                    onPress={onClearAllLeagues}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>{t('filter.clearAll')}</Text>
                  </TouchableOpacity>
                )}
                {hasLeagueSelections && (
                  <Text style={styles.selectionCount}>
                    {t('filter.leaguesSelected', { count: selectedLeagues.length })}
                  </Text>
                )}
              </View>

              {/* League List */}
              <FlatList
                data={filteredLeagues}
                keyExtractor={(item) => item.key}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const isSelected = selectedLeagues.includes(item.key);
                  return (
                    <TouchableOpacity
                      style={[styles.leagueItem, isSelected && styles.leagueItemSelected]}
                      onPress={() => onToggleLeague(item.key)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.leagueItemContent}>
                        <Icon
                          name="trophy"
                          size={20}
                          color={isSelected ? colors.accent : colors.textTertiary}
                          style={styles.leagueIcon}
                        />
                        <View style={styles.leagueInfo}>
                          <Text
                            style={[styles.leagueName, isSelected && styles.leagueNameSelected]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={styles.leagueCount}>
                            {item.total} {t('filter.matches')}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Icon name="check" size={16} color={colors.accent} />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="search" size={48} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>{t('home.noMatches')}</Text>
                    <Text style={styles.emptySubtext}>{t('home.noMatchesFiltered')}</Text>
                  </View>
                }
              />
            </>
          )}

          {activeTab === 'sort' && (
            <View style={styles.optionsContainer}>
              {sortOptions.map((option) => {
                const isSelected = sortOption === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => onSortChange(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Icon
                        name={option.icon as any}
                        size={22}
                        color={isSelected ? colors.accent : colors.textSecondary}
                        style={styles.optionIcon}
                      />
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {t(option.labelKey)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Icon name="check" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {activeTab === 'view' && (
            <View style={styles.optionsContainer}>
              {viewOptions.map((option) => {
                const isSelected = viewOption === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => onViewChange(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Icon
                        name={option.icon as any}
                        size={22}
                        color={isSelected ? colors.accent : colors.textSecondary}
                        style={styles.optionIcon}
                      />
                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                          {t(option.labelKey)}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {t(option.value === 'grouped' ? 'filterSort.viewGroupedDescription' : 'filterSort.viewFlatDescription')}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Icon name="check" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
});

const getStyles = () => {
  const containerPadding = getContainerPadding();
  const isSmall = screenDimensions.isSmall;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
      ...Platform.select({
        ios: {
          paddingTop: 0,
        },
        android: {
          paddingTop: spacing.lg,
        },
      }),
    },
    header: {
      backgroundColor: colors.bgPrimary,
      paddingHorizontal: containerPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...Platform.select({
        ios: {
          paddingTop: spacing.lg,
        },
      }),
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    tabs: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.bgSecondary,
      gap: spacing.xs,
    },
    tabActive: {
      backgroundColor: colors.accent + '22',
      borderWidth: 1,
      borderColor: colors.accent,
    },
    tabText: {
      ...typography.bodySmall,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: colors.accent,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: colors.accent,
      borderRadius: borderRadius.full,
      minWidth: 20,
      height: 20,
      paddingHorizontal: spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      ...typography.caption,
      color: colors.bgPrimary,
      fontWeight: '700',
      fontSize: 10,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: containerPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl * 2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
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
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    actionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.bgSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    actionButtonActive: {
      backgroundColor: colors.accent + '22',
      borderColor: colors.accent,
    },
    actionButtonText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    actionButtonTextActive: {
      color: colors.accent,
      fontWeight: '600',
    },
    selectionCount: {
      ...typography.caption,
      color: colors.textTertiary,
      marginLeft: 'auto',
    },
    leagueItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 64,
    },
    leagueItemSelected: {
      backgroundColor: colors.accent + '22',
      borderColor: colors.accent,
      borderWidth: 1.5,
    },
    leagueItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    leagueIcon: {
      marginRight: spacing.md,
    },
    leagueInfo: {
      flex: 1,
    },
    leagueName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
      marginBottom: spacing.xs / 2,
    },
    leagueNameSelected: {
      color: colors.accent,
      fontWeight: '600',
    },
    leagueCount: {
      ...typography.caption,
      color: colors.textTertiary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgPrimary,
    },
    checkboxSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '22',
    },
    optionsContainer: {
      gap: spacing.sm,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 64,
    },
    optionItemSelected: {
      backgroundColor: colors.accent + '22',
      borderColor: colors.accent,
      borderWidth: 1.5,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionIcon: {
      marginRight: spacing.md,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
      marginBottom: spacing.xs / 2,
    },
    optionLabelSelected: {
      color: colors.accent,
      fontWeight: '600',
    },
    optionDescription: {
      ...typography.caption,
      color: colors.textTertiary,
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

