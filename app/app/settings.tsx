import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { ConfirmationSheet } from '../components/ui/ConfirmationSheet';
import { SettingsShell, SettingsCard } from '../components/ui/SettingsShell';
import { ListRow } from '../components/ui/ListRow';
import { AppPalette } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';

const MENU = [
  { icon: 'person-outline', label: 'Edit Profile', route: '/edit-profile' },
  { icon: 'color-palette-outline', label: 'Appearance', route: '/appearance' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/privacy-security' },
  { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support' },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLogoutVisible, setIsLogoutVisible] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SettingsShell title="Settings">
      <ConfirmationSheet
        isVisible={isLogoutVisible}
        onClose={() => setIsLogoutVisible(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to log out from your account?"
        confirmText="Yes, Log out"
        confirmVariant="outline"
        tone="danger"
      />

      <SettingsCard>
        {MENU.map((item, index) => (
          <ListRow
            key={item.route}
            iconName={item.icon}
            label={item.label}
            onPress={() => router.push(item.route as any)}
            style={[
              styles.menuRow,
              index === MENU.length - 1
                ? { borderBottomWidth: 0 }
                : {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
            ]}
          />
        ))}
      </SettingsCard>

      <SettingsCard>
        <ListRow
          iconName="log-out-outline"
          label="Log Out"
          onPress={() => setIsLogoutVisible(true)}
          iconColor={colors.danger}
          labelColor={colors.danger}
          showChevron={false}
          style={{ borderBottomWidth: 0 }}
        />
      </SettingsCard>

      <Text style={styles.version}>Version 1.0.0</Text>
    </SettingsShell>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    menuRow: {
      borderRadius: 0,
    },
    version: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: 8,
      fontSize: 12,
    },
  });
}
