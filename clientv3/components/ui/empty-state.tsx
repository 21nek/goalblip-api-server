import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/lib/theme';
import { Icon } from './icon';

type EmptyStateProps = {
  icon?: 'empty' | 'warning' | 'error' | 'search' | 'robot' | 'star';
  title: string;
  message?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = 'empty', title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={56} color={colors.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    minHeight: 200,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.xl,
    marginVertical: spacing.lg,
    ...shadows.subtle,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  message: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
    maxWidth: 300,
  },
  action: {
    marginTop: spacing.md,
  },
});

