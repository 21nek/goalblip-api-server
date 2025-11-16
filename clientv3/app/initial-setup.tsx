import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppShell } from '@/components/layout/app-shell';
import { Icon } from '@/components/ui/icon';
import { useLocale, SUPPORTED_LOCALES, TIMEZONE_PRESETS, LOCALE_LABEL_KEYS, type Locale } from '@/providers/locale-provider';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { getContainerPadding, screenDimensions } from '@/lib/responsive';

export default function InitialSetupScreen() {
  const router = useRouter();
  const t = useTranslation();
  const { locale, timezone, setLocale, setTimezone, completeInitialSetup } = useLocale();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(timezone);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        setLocale(selectedLocale),
        setTimezone(selectedTimezone),
        completeInitialSetup(),
      ]);
      // Navigate to home
      router.replace('/');
    } catch (error) {
      console.error('[InitialSetup] Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const styles = getStyles();
  const isSmall = screenDimensions.isSmall;

  return (
    <AppShell showBottomNav={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon name="settings" size={48} color={colors.accent} />
          <Text style={styles.title}>{t('initialSetup.welcome')}</Text>
          <Text style={styles.subtitle}>
            {t('initialSetup.subtitle')}
          </Text>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('initialSetup.languageSelection')}</Text>
          <View style={styles.optionsGrid}>
            {SUPPORTED_LOCALES.map((loc) => {
              const isSelected = selectedLocale === loc;

              return (
                <TouchableOpacity
                  key={loc}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setSelectedLocale(loc)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {t(LOCALE_LABEL_KEYS[loc])}
                    </Text>
                    {isSelected && (
                      <Icon name="check" size={20} color={colors.accent} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Timezone Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('initialSetup.timezoneSelection')}</Text>
          <View style={styles.optionsList}>
            {TIMEZONE_PRESETS.map((preset) => {
              const isSelected = selectedTimezone === preset.tz;

              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.timezoneOption, isSelected && styles.timezoneOptionSelected]}
                  onPress={() => setSelectedTimezone(preset.tz)}
                  activeOpacity={0.7}
                >
                  <View style={styles.timezoneContent}>
                    <Icon
                      name="time"
                      size={20}
                      color={isSelected ? colors.accent : colors.textSecondary}
                      style={styles.timezoneIcon}
                    />
                    <View style={styles.timezoneInfo}>
                      <Text style={[styles.timezoneLabel, isSelected && styles.timezoneLabelSelected]}>
                        {t(preset.labelKey)}
                      </Text>
                      <Text style={styles.timezoneId}>{preset.tz}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkbox}>
                        <Icon name="check" size={16} color={colors.accent} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? t('initialSetup.saving') : t('initialSetup.continue')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AppShell>
  );
}

const getStyles = () => {
  const containerPadding = getContainerPadding();
  const isSmall = screenDimensions.isSmall;

  return StyleSheet.create({
    container: {
      padding: containerPadding,
      paddingBottom: spacing.xxxl * 2,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
      marginTop: spacing.xl,
    },
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      fontWeight: '700',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    section: {
      marginBottom: spacing.xxxl,
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: spacing.md,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.xs,
    },
    optionCard: {
      width: isSmall ? '48%' : '31%',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      margin: spacing.xs,
      borderWidth: 2,
      borderColor: colors.border,
      ...shadows.subtle,
    },
    optionCardSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '15',
    },
    optionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    optionLabelSelected: {
      color: colors.accent,
      fontWeight: '700',
    },
    optionsList: {
      gap: spacing.sm,
    },
    timezoneOption: {
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      ...shadows.subtle,
    },
    timezoneOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '15',
    },
    timezoneContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timezoneIcon: {
      marginRight: spacing.md,
    },
    timezoneInfo: {
      flex: 1,
    },
    timezoneLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
      marginBottom: spacing.xs / 2,
    },
    timezoneLabelSelected: {
      color: colors.accent,
      fontWeight: '700',
    },
    timezoneId: {
      ...typography.caption,
      color: colors.textTertiary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.accent + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: borderRadius.full,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xxl,
      alignItems: 'center',
      marginTop: spacing.xl,
      ...shadows.elevated,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      ...typography.body,
      color: colors.bgPrimary,
      fontWeight: '700',
      fontSize: 16,
    },
  });
};
