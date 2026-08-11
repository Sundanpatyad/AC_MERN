import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SettingsShell, SettingsCard } from '../components/ui/SettingsShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmationSheet } from '../components/ui/ConfirmationSheet';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { Palette } from '../constants/theme';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Toast.show({ type: 'error', text1: 'Fill all password fields' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Toast.show({ type: 'error', text1: 'New passwords do not match' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiConnector.post(endpoints.CHANGE_PASSWORD_API, {
        oldPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Password updated' });
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Toast.show({ type: 'error', text1: res.data?.message || 'Update failed' });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await apiConnector.delete(endpoints.DELETE_PROFILE_API);
      if (res.data?.success) {
        await logout();
        Toast.show({ type: 'success', text1: 'Account deleted' });
        router.replace('/(auth)/login');
      } else {
        Toast.show({ type: 'error', text1: res.data?.message || 'Delete failed' });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to delete account',
      });
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <SettingsShell title="Privacy & Security">
      <Text style={styles.sectionLabel}>Change password</Text>
      <SettingsCard>
        <View style={styles.formPad}>
          <Input
            label="Current Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            isPassword
            placeholder="Current password"
          />
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            placeholder="New password"
          />
          <Input
            label="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            isPassword
            placeholder="Confirm new password"
          />
          <Button
            title="Update Password"
            onPress={handleChangePassword}
            isLoading={isSaving}
            style={{ marginTop: 8 }}
          />
        </View>
      </SettingsCard>

      <Text style={styles.sectionLabel}>Danger zone</Text>
      <Text style={styles.hint}>
        Deleting your account permanently removes your profile, enrollments, and progress.
      </Text>
      <Button
        title={isDeleting ? 'Deleting...' : 'Delete Account'}
        onPress={() => setShowDelete(true)}
        variant="outline"
        style={styles.deleteBtn}
        textStyle={{ color: Palette.danger }}
        disabled={isDeleting}
      />

      <ConfirmationSheet
        isVisible={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete account?"
        message="This cannot be undone. All your data will be permanently removed."
        confirmText="Yes, delete"
        confirmVariant="outline"
      />
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  formPad: {
    padding: 14,
    paddingTop: 8,
  },
  hint: {
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  deleteBtn: {
    borderColor: 'rgba(255,69,58,0.45)',
  },
});
