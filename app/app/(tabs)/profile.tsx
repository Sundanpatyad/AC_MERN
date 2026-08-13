import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { ConfirmationSheet } from '../../components/ui/ConfirmationSheet';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { ListRow } from '../../components/ui/ListRow';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLogoutSheetVisible, setIsLogoutSheetVisible] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', route: '/edit-profile' },
    { icon: 'color-palette-outline', label: 'Appearance', route: '/appearance' },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/privacy-security' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support' },
  ];

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            Profile
          </Text>
          <View style={styles.settingsTab}>
            <Ionicons name="settings-outline" size={16} color={colors.textMuted} />
            <Text style={styles.settingsTabText}>Settings</Text>
          </View>
        </View>
      </View>

      <ConfirmationSheet
        isVisible={isLogoutSheetVisible}
        onClose={() => setIsLogoutSheetVisible(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to log out from your account?"
        confirmText="Yes, Log out"
        confirmVariant="outline"
        tone="danger"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                user?.image ||
                `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.name} numberOfLines={1}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.accountType || 'Student'}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <ListRow
              key={index}
              iconName={item.icon as any}
              label={item.label}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.menuRow,
                index === menuItems.length - 1
                  ? { borderBottomWidth: 0 }
                  : {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
              ]}
            />
          ))}

          <ListRow
            iconName="log-out-outline"
            label="Log Out"
            onPress={() => setIsLogoutSheetVisible(true)}
            iconColor={colors.danger}
            labelColor={colors.danger}
            showChevron={false}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      padding: 20,
      paddingTop: 64,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
    },
    settingsTab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radii.pill,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsTabText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '700',
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 32,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      marginBottom: 16,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 14,
    },
    badge: {
      backgroundColor: colors.surfaceRaised,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    badgeText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    menuSection: {
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    menuRow: {
      borderRadius: 0,
    },
    version: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: 24,
      fontSize: 12,
    },
  });
}
