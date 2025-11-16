import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useLocale, SUPPORTED_LOCALES, LOCALE_LABEL_KEYS } from '@/providers/locale-provider';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';

export const LocaleSelector = memo(function LocaleSelector() {
  const t = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('profile.language')}</Text>
      <View style={styles.optionsRow}>
        {SUPPORTED_LOCALES.map((loc) => {
          const isSelected = locale === loc;
          return (
            <TouchableOpacity
              key={loc}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setLocale(loc)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {t(LOCALE_LABEL_KEYS[loc])}
              </Text>
              {isSelected && (
                <Icon name="check" size={16} color={colors.accent} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 100,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '15',
  },
  optionText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
});
