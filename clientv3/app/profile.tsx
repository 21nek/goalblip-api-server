import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { colors, spacing } from '@/lib/theme';

export default function ProfileScreen() {
  return (
    <AppShell title="Profil">
      <View style={styles.container}>
        <EmptyState
          icon="information-circle"
          title="Profil"
          message="Profil özellikleri yakında eklenecek."
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

