import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SettingsShell, SettingsCard } from '../components/ui/SettingsShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { AppPalette } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';
import { showMessage } from '../providers/DialogProvider';
import { MediaImage } from '../components/MediaImage';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoUri, setPhotoUri] = useState(user?.image || '');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    about: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiConnector.get(endpoints.GET_USER_DETAILS);
        const details = res.data?.data || res.data?.userDetails || res.data?.user;
        if (details) {
          setForm({
            firstName: details.firstName || user?.firstName || '',
            lastName: details.lastName || user?.lastName || '',
            contactNumber: details.additionalDetails?.contactNumber || '',
            about: details.additionalDetails?.about || '',
          });
          if (details.image) setPhotoUri(resolveMediaUrl(details.image) || details.image);
        } else if (user) {
          setForm((f) => ({
            ...f,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          }));
        }
      } catch {
        if (user) {
          setForm((f) => ({
            ...f,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyUser = async (updated: any) => {
    await setUser({
      ...user!,
      firstName: updated.firstName || user?.firstName || '',
      lastName: updated.lastName || user?.lastName || '',
      image: updated.image || user?.image || '',
      email: updated.email || user?.email || '',
      accountType: updated.accountType || user?.accountType || 'Student',
      _id: updated._id || user?._id || '',
    });
    if (updated.image) setPhotoUri(updated.image);
  };

  const handleChangePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        await showMessage({
          title: 'Permission needed',
          message: 'Allow photo access to update your profile picture.',
        });
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (picked.canceled || !picked.assets?.[0]?.uri) return;

      const asset = picked.assets[0];
      setPhotoUri(asset.uri);
      setPhotoBusy(true);

      const body = new FormData();
      body.append('profileImage', {
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as any);

      const res = await apiConnector.put(endpoints.UPDATE_DISPLAY_PICTURE_API, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 45000,
      });
      const updated = res.data?.data;
      if (!res.data?.success || !updated) {
        throw new Error(res.data?.message || 'Could not update photo');
      }
      await applyUser(updated);
      await showMessage({ title: 'Photo updated', message: 'Your profile photo was saved.' });
    } catch (error: any) {
      setPhotoUri(user?.image || '');
      await showMessage({
        title: 'Could not update photo',
        message: error?.response?.data?.message || error?.message || 'Try another image.',
      });
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      await showMessage({ title: 'Missing name', message: 'First and last name are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiConnector.put(endpoints.UPDATE_PROFILE_API, form);
      if (res.data?.success) {
        const updated = res.data.updatedUserDetails;
        if (updated) await applyUser(updated);
        await showMessage({ title: 'Saved', message: 'Your profile was updated.' });
      }
    } catch (error: any) {
      await showMessage({
        title: 'Could not save',
        message: error?.response?.data?.message || 'Try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const letter = (form.firstName || user?.firstName || 'A').slice(0, 1).toUpperCase();

  return (
    <SettingsShell title="Edit Profile">
      {isLoading ? (
        <DetailSkeleton />
      ) : (
        <>
          <Text style={styles.sectionLabel}>Photo</Text>
          <SettingsCard>
            <View style={styles.photoRow}>
              <Pressable onPress={handleChangePhoto} disabled={photoBusy} style={styles.avatarWrap}>
                {photoUri ? (
                  <MediaImage uri={photoUri} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarLetter}>{letter}</Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  {photoBusy ? (
                    <ActivityIndicator color={colors.primaryButtonText} size="small" />
                  ) : (
                    <Ionicons name="camera" size={14} color={colors.primaryButtonText} />
                  )}
                </View>
              </Pressable>
              <View style={styles.photoCopy}>
                <Text style={styles.photoTitle}>Profile photo</Text>
                <Text style={styles.photoHint}>Tap the photo to choose a new one.</Text>
              </View>
            </View>
          </SettingsCard>

          <Text style={styles.sectionLabel}>Personal info</Text>
          <SettingsCard>
            <View style={styles.formPad}>
              <Input
                label="First Name"
                value={form.firstName}
                onChangeText={(t) => update('firstName', t)}
                placeholder="First name"
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChangeText={(t) => update('lastName', t)}
                placeholder="Last name"
              />
              <Input
                label="Contact Number"
                value={form.contactNumber}
                onChangeText={(t) => update('contactNumber', t)}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
              <Input
                label="About"
                value={form.about}
                onChangeText={(t) => update('about', t)}
                placeholder="Tell us about yourself"
                multiline
                style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
              />
            </View>
          </SettingsCard>

          <Button title="Save Changes" onPress={handleSave} isLoading={isSaving} />
        </>
      )}
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
      marginTop: 4,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 16,
    },
    avatarWrap: {
      width: 84,
      height: 84,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.surfaceRaised,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
    },
    cameraBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoCopy: {
      flex: 1,
      gap: 4,
    },
    photoTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    photoHint: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    formPad: {
      padding: 14,
      paddingTop: 8,
    },
  });
}
