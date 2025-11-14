import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/lib/theme';
import { getContainerPadding } from '@/lib/responsive';

type LeagueHeaderProps = {
  league: string;
};

export const LeagueHeader = memo(function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.leagueName}>{league || 'Lig Bilinmiyor'}</Text>
    </View>
  );
});

const getStyles = () => {
  const containerPadding = getContainerPadding();
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.bgPrimary,
      paddingVertical: spacing.md,
      paddingHorizontal: containerPadding,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    leagueName: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: '700',
    },
  });
};

const styles = getStyles();

