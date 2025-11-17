import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useLocale, type TimeFormatPreference } from '@/providers/locale-provider';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';

const TIME_FORMAT_OPTIONS: TimeFormatPreference[] = ['auto', '24h', '12h'];

export const TimeFormatSelector = memo(function TimeFormatSelector() {
  const t = useTranslation();
  const { timeFormat, setTimeFormat } = useLocale();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('settings.timeFormat')}</Text>
      <View style={styles.optionsRow}>
        {TIME_FORMAT_OPTIONS.map((option) => {
          const isSelected = timeFormat === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setTimeFormat(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {t(`settings.timeFormatOptions.${option}` as const)}
              </Text>
              {isSelected && <Icon name="check" size={16} color={colors.accent} style={styles.checkIcon} />}
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
    minWidth: 120,
    ...shadows.subtle,
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
