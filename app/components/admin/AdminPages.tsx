import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '../ui/ScreenBackground';
import { MeshHero } from '../ui/MeshHero';
import { SettingsCard } from '../ui/SettingsShell';
import { ListRow } from '../ui/ListRow';
import { AppPalette, Fonts } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

const PAGES = [
  { icon: 'grid-outline', label: 'Dashboard', route: '/admin/dashboard' },
  { icon: 'stats-chart-outline', label: 'Admin Console', route: '/(tabs)' },
  { icon: 'document-text-outline', label: 'My Tests', route: '/(tabs)/mock-tests' },
  { icon: 'add-circle-outline', label: 'Create Mock Test', route: '/admin/create-series' },
  { icon: 'notifications-outline', label: 'Send Notification', route: '/admin/send-notification' },
  { icon: 'folder-open-outline', label: 'Study Materials', route: '/admin/study-materials' },
] as const;

export function AdminPages() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin</Text>
          <Text style={styles.subtitle}>All instructor pages from the website console.</Text>
        </View>
      </MeshHero>

      <View style={styles.body}>
        <SettingsCard>
          {PAGES.map((item, index) => (
            <ListRow
              key={item.route}
              iconName={item.icon}
              label={item.label}
              onPress={() => router.push(item.route as any)}
              style={
                index === PAGES.length - 1
                  ? { borderBottomWidth: 0 }
                  : {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    }
              }
            />
          ))}
        </SettingsCard>
      </View>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 22,
      fontFamily: Fonts.semiBold,
      color: '#0F172A',
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: 'rgba(15,23,42,0.55)',
    },
    body: {
      paddingHorizontal: 20,
    },
  });
}
