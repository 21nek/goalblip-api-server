import { StyleSheet, View } from 'react-native';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/theme';

export default function FavoritesScreen() {
  const t = useTranslation();

  return (
    <AppShell title={t('favoritesScreen.title')}>
      <View style={styles.container}>
        <EmptyState
          icon="star"
          title={t('favoritesScreen.emptyTitle')}
          message={t('favoritesScreen.emptyMessage')}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxxl * 2,
  },
});
