import { memo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useLocale, TIMEZONE_PRESETS } from '@/providers/locale-provider';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme';
import { getContainerPadding } from '@/lib/responsive';

export const TimezoneSelector = memo(function TimezoneSelector() {
  const t = useTranslation();
  const { timezone, getTimezonePreset, setTimezone } = useLocale();
  const [modalVisible, setModalVisible] = useState(false);
  const preset = getTimezonePreset();

  const handleSelect = async (tz: string) => {
    await setTimezone(tz);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('profile.timezone')}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Icon name="time" size={20} color={colors.accent} style={styles.icon} />
          <View style={styles.selectorInfo}>
            <Text style={styles.selectorLabel}>
              {preset ? t(preset.labelKey) : timezone}
            </Text>
            <Text style={styles.selectorSubtext}>{timezone}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('initialSetup.timezoneSelection')}</Text>
            <View style={styles.closeButton} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {TIMEZONE_PRESETS.map((preset) => {
              const isSelected = timezone === preset.tz;

              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.timezoneOption, isSelected && styles.timezoneOptionSelected]}
                  onPress={() => handleSelect(preset.tz)}
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
});

const getStyles = () => {
  const containerPadding = getContainerPadding();

  return StyleSheet.create({
    container: {
      marginBottom: spacing.xl,
    },
    label: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.subtle,
    },
    selectorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      marginRight: spacing.md,
    },
    selectorInfo: {
      flex: 1,
    },
    selectorLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: spacing.xs / 2,
    },
    selectorSubtext: {
      ...typography.caption,
      color: colors.textTertiary,
    },
    modalContainer: {
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
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    modalContent: {
      paddingHorizontal: containerPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl * 2,
    },
    timezoneOption: {
      backgroundColor: colors.bgSecondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
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
  });
};

const styles = getStyles();
