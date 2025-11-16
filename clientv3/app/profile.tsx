import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '@/components/layout/app-shell';
import { LocaleSelector } from '@/components/settings/locale-selector';
import { TimezoneSelector } from '@/components/settings/timezone-selector';
import { Icon } from '@/components/ui/icon';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography } from '@/lib/theme';
import { getContainerPadding } from '@/lib/responsive';

export default function ProfileScreen() {
  const t = useTranslation();
  const styles = getStyles();

  return (
    <AppShell title={t('profile.title')}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="settings" size={24} color={colors.accent} />
            <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          </View>
          
          <View style={styles.settingsCard}>
            <LocaleSelector />
            <TimezoneSelector />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information-circle" size={24} color={colors.accent} />
            <Text style={styles.sectionTitle}>{t('profile.about')}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{t('profile.version')}</Text>
            <Text style={styles.infoSubtext}>{t('profile.subtitle')}</Text>
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const getStyles = () => {
  const containerPadding = getContainerPadding();

  return StyleSheet.create({
    container: {
      padding: containerPadding,
      paddingBottom: spacing.xxxl * 2,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    settingsCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    infoText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    infoSubtext: {
      ...typography.caption,
      color: colors.textTertiary,
    },
  });
};

const styles = getStyles();

