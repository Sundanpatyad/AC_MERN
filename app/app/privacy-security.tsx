import React, { useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsShell, SettingsCard } from '../components/ui/SettingsShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmationSheet } from '../components/ui/ConfirmationSheet';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { AppPalette } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return;
    }
    if (newPassword !== confirmNewPassword) {
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
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch {
      // ignore
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
        router.replace('/(auth)/login');
      }
    } catch {
      // ignore
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
        style={{ borderColor: `${colors.danger}73` }}
        textStyle={{ color: colors.danger }}
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

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    sectionLabel: {
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
  });
}
