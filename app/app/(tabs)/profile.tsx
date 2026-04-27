import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { ConfirmationSheet } from '../../components/ui/ConfirmationSheet';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLogoutSheetVisible, setIsLogoutSheetVisible] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>Profile</Text>
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
            source={{ uri: user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}` }} 
            style={styles.avatar} 
          />
          <Text style={styles.name} numberOfLines={1}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
          
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.accountType || 'Student'}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#fff" />
                <Text style={styles.menuItemLabel} numberOfLines={1}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <Button 
          title="Log Out" 
          onPress={() => setIsLogoutSheetVisible(true)} 
          variant="outline"
          style={styles.logoutButton}
          textStyle={{ color: '#ef4444' }}
        />
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#222',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  badgeText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  },
  menuSection: {
    backgroundColor: '#121212',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
    fontSize: 12,
  },
});
