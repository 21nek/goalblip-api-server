import { memo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { getContainerPadding, screenDimensions } from '@/lib/responsive';

type LeagueFilter = {
  name: string;
  total: number;
};

type FilterSectionProps = {
  search: string;
  onSearchChange: (text: string) => void;
  leagues: LeagueFilter[];
  selectedLeagues: string[];
  onToggleLeague: (league: string) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onOpenLeagueModal: () => void;
};

export const FilterSection = memo(function FilterSection({
  search,
  onSearchChange,
  leagues,
  selectedLeagues,
  onToggleLeague,
  activeFiltersCount,
  onClearFilters,
  onOpenLeagueModal,
}: FilterSectionProps) {
  const styles = getStyles(selectedLeagues.length > 0);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconWrapper}>
          <Icon name="search" size={20} color={colors.textTertiary} />
        </View>
        <TextInput
          placeholder="Takım veya lig ara..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={onSearchChange}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        {search ? (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.searchClear}>
            <Icon name="close-circle" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* League Selection Button */}
      <TouchableOpacity
        style={styles.leagueButton}
        onPress={onOpenLeagueModal}
        activeOpacity={0.7}
      >
        <View style={styles.leagueButtonContent}>
          <Icon
            name="trophy"
            size={20}
            color={selectedLeagues.length > 0 ? colors.accent : colors.textSecondary}
          />
          <View style={styles.leagueButtonTextContainer}>
            <Text style={styles.leagueButtonLabel}>Lig Seç</Text>
            {selectedLeagues.length > 0 ? (
              <Text style={styles.leagueButtonCount}>
                {selectedLeagues.length} lig seçili
              </Text>
            ) : (
              <Text style={styles.leagueButtonSubtext}>Tüm ligler</Text>
            )}
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <View style={styles.footerRow}>
          <View style={styles.activeFiltersRow}>
            {selectedLeagues.slice(0, 2).map((league) => (
              <View key={league} style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>{league}</Text>
                <TouchableOpacity
                  onPress={() => onToggleLeague(league)}
                  style={styles.activeFilterClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close-circle" size={14} color={colors.accent} />
                </TouchableOpacity>
              </View>
            ))}
            {activeFiltersCount > 2 && (
              <Text style={styles.moreFiltersText}>+{activeFiltersCount - 2}</Text>
            )}
            <TouchableOpacity onPress={onClearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const getStyles = (hasSelections: boolean) => {
  const containerPadding = getContainerPadding();
  const isSmall = screenDimensions.isSmall;
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.bgPrimary,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: isSmall ? spacing.sm : spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: containerPadding,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48, // iOS/Android touch target
    },
  searchIconWrapper: {
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
  leagueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: containerPadding,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: hasSelections ? colors.accent : colors.border,
    minHeight: 56,
    ...shadows.subtle,
  },
  leagueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leagueButtonTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  leagueButtonLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  leagueButtonCount: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '500',
  },
  leagueButtonSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
  },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: containerPadding,
      paddingTop: spacing.sm,
      flexWrap: 'wrap', // Allow wrapping on small screens
    },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '33',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  activeFilterText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  activeFilterClose: {
    padding: 2,
  },
  moreFiltersText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginRight: spacing.sm,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
  },
    clearButtonText: {
      ...typography.caption,
      color: colors.accent,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });
};

const styles = getStyles();

