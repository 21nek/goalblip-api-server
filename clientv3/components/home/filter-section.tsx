import { memo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Switch, Platform } from 'react-native';
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
  liveOnly: boolean;
  onLiveOnlyChange: (value: boolean) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
};

export const FilterSection = memo(function FilterSection({
  search,
  onSearchChange,
  leagues,
  selectedLeagues,
  onToggleLeague,
  liveOnly,
  onLiveOnlyChange,
  activeFiltersCount,
  onClearFilters,
}: FilterSectionProps) {
  const ALL_LEAGUES = 'ALL';

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

      {/* League Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedLeagues.length && styles.chipActive]}
          onPress={() => onToggleLeague(ALL_LEAGUES)}
          activeOpacity={0.7}
        >
          <Icon name="trophy" size={16} color={!selectedLeagues.length ? colors.accent : colors.textTertiary} />
          <Text style={[styles.chipText, !selectedLeagues.length && styles.chipTextActive]}>
            Tüm Ligler
          </Text>
        </TouchableOpacity>
        {leagues.map((league) => {
          const isActive = selectedLeagues.includes(league.name);
          return (
            <TouchableOpacity
              key={league.name}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onToggleLeague(league.name)}
              activeOpacity={0.7}
            >
              <Text 
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {league.name} ({league.total})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Live Toggle and Active Filters */}
      <View style={styles.footerRow}>
        <View style={styles.liveToggleRow}>
          <Text style={styles.liveToggleLabel}>Sadece canlı</Text>
          <Switch
            value={liveOnly}
            onValueChange={onLiveOnlyChange}
            trackColor={{ false: colors.bgTertiary, true: colors.accent + '80' }}
            thumbColor={liveOnly ? colors.accent : colors.textTertiary}
            ios_backgroundColor={colors.bgTertiary}
          />
        </View>
        {activeFiltersCount > 0 && (
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
        )}
      </View>
    </View>
  );
});

const getStyles = () => {
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
  chipsScroll: {
    marginBottom: spacing.md,
  },
    chipsContainer: {
      paddingHorizontal: containerPadding,
      paddingRight: containerPadding + spacing.md,
    },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    backgroundColor: colors.bgSecondary,
    minHeight: 40,
    ...shadows.subtle,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '22',
    borderWidth: 1.5,
  },
    chipText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '500',
      marginLeft: spacing.xs,
      maxWidth: isSmall ? 120 : 200, // Prevent chips from being too wide
    },
  chipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: containerPadding,
      paddingTop: spacing.sm,
      flexWrap: 'wrap', // Allow wrapping on small screens
    },
  liveToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveToggleLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: spacing.sm,
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

