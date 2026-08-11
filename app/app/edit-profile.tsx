import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SettingsShell, SettingsCard } from '../components/ui/SettingsShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';
import { useAuthStore } from '../store/authStore';
import { AppPalette, Radii } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';

const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'];

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
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
            dateOfBirth: details.additionalDetails?.dateOfBirth
              ? String(details.additionalDetails.dateOfBirth).slice(0, 10)
              : '',
            gender: details.additionalDetails?.gender || '',
            contactNumber: details.additionalDetails?.contactNumber || '',
            about: details.additionalDetails?.about || '',
          });
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

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiConnector.put(endpoints.UPDATE_PROFILE_API, form);
      if (res.data?.success) {
        const updated = res.data.updatedUserDetails;
        if (updated) {
          await setUser({
            ...user!,
            firstName: updated.firstName,
            lastName: updated.lastName,
            image: updated.image || user?.image || '',
            email: updated.email || user?.email || '',
            accountType: updated.accountType || user?.accountType || 'Student',
            _id: updated._id || user?._id || '',
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsShell title="Edit Profile">
      {isLoading ? (
        <DetailSkeleton />
      ) : (
        <>
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
                label="Date of Birth"
                value={form.dateOfBirth}
                onChangeText={(t) => update('dateOfBirth', t)}
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderWrap}>
                {GENDERS.map((g) => {
                  const active = form.gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderChip, active && styles.genderChipActive]}
                      onPress={() => update('gender', g)}
                    >
                      <Text style={[styles.genderText, active && styles.genderTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
    },
    formPad: {
      padding: 14,
      paddingTop: 8,
    },
    fieldLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 8,
      marginTop: 6,
      fontWeight: '600',
    },
    genderWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
    },
    genderChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    genderChipActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    genderText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    genderTextActive: {
      color: colors.primaryButtonText,
    },
  });
}
