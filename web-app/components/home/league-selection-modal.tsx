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

type LeagueSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  leagues: LeagueFilter[];
  selectedLeagues: string[];
  onToggleLeague: (league: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

export const LeagueSelectionModal = memo(function LeagueSelectionModal({
  visible,
  onClose,
  leagues,
  selectedLeagues,
  onToggleLeague,
  onSelectAll,
  onClearAll,
}: LeagueSelectionModalProps) {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const styles = getStyles();

  // Filter leagues based on search
  const filteredLeagues = useMemo(() => {
    if (!searchQuery.trim()) return leagues;
    const query = searchQuery.trim().toLowerCase();
    return leagues.filter((league) => league.name.toLowerCase().includes(query));
  }, [leagues, searchQuery]);

  const allSelected = selectedLeagues.length === 0;
  const hasSelections = selectedLeagues.length > 0;

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
            <Text style={styles.headerTitle}>{t('filter.selectLeague')}</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              placeholder={t('filter.searchPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
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
              onPress={onSelectAll}
              style={[styles.actionButton, allSelected && styles.actionButtonActive]}
            >
              <Text style={[styles.actionButtonText, allSelected && styles.actionButtonTextActive]}>
                {t('filter.all')}
              </Text>
            </TouchableOpacity>
            {hasSelections && (
              <TouchableOpacity
                onPress={onClearAll}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>{t('filter.clearAll')}</Text>
              </TouchableOpacity>
            )}
            {hasSelections && (
              <Text style={styles.selectionCount}>
                {t('filter.leaguesSelected', { count: selectedLeagues.length })}
              </Text>
            )}
          </View>
        </View>

        {/* League List */}
        <FlatList
          data={filteredLeagues}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
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
              <Text style={styles.emptySubtext}>
                {t('home.noMatchesFiltered')}
              </Text>
            </View>
          }
        />
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
    listContent: {
      paddingHorizontal: containerPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl * 2,
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
