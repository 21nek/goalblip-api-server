import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, typography } from '@/lib/theme';
import { getContainerPadding, screenDimensions } from '@/lib/responsive';

type LeagueHeaderProps = {
  league: string;
};

export const LeagueHeader = memo(function LeagueHeader({ league }: LeagueHeaderProps) {
  const t = useTranslation();
  const styles = getStyles();
  
  return (
    <View style={styles.container}>
      <View style={styles.accentBar} />
      <Icon name="trophy" size={20} color={colors.accent} style={styles.icon} />
      <Text style={styles.leagueName}>{league || t('common.unknownLeague')}</Text>
    </View>
  );
});

const getStyles = () => {
  const containerPadding = getContainerPadding();
  const isSmall = screenDimensions.isSmall;
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgSecondary,
      paddingVertical: spacing.lg,
      paddingHorizontal: containerPadding,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: colors.accent,
    },
    icon: {
      marginRight: spacing.sm,
    },
    leagueName: {
      ...typography.h3,
      fontSize: isSmall ? 18 : typography.h3.fontSize,
      color: colors.accent,
      fontWeight: '700',
      flex: 1,
    },
  });
};

