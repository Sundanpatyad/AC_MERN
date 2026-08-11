import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { ConfirmationSheet } from '../../components/ui/ConfirmationSheet';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { Palette, Radii } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLogoutSheetVisible, setIsLogoutSheetVisible] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', route: '/edit-profile' },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', route: '/privacy-security' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support' },
    { icon: 'information-circle-outline', label: 'About', route: '/about' },
  ];

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Profile
        </Text>
      </View>

      <ConfirmationSheet
        isVisible={isLogoutSheetVisible}
        onClose={() => setIsLogoutSheetVisible(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to log out from your account?"
        confirmText="Yes, Log out"
        confirmVariant="outline"
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
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={18} color={Palette.text} />
                </View>
                <Text style={styles.menuItemLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Log Out"
          onPress={() => setIsLogoutSheetVisible(true)}
          variant="outline"
          style={styles.logoutButton}
          textStyle={{ color: Palette.danger }}
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.4,
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
    backgroundColor: Palette.surfaceRaised,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: Palette.textSecondary,
    marginBottom: 14,
  },
  badge: {
    backgroundColor: Palette.surfaceRaised,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
  },
  badgeText: {
    color: Palette.text,
    fontWeight: '700',
    fontSize: 12,
  },
  menuSection: {
    backgroundColor: Palette.surface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    borderColor: 'rgba(255,69,58,0.45)',
  },
  version: {
    textAlign: 'center',
    color: Palette.textMuted,
    marginTop: 24,
    fontSize: 12,
  },
});
