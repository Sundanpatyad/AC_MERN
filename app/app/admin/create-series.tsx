import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsShell } from '../../components/ui/SettingsShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { showMessage } from '../../providers/DialogProvider';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export default function CreateSeriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [seriesName, setSeriesName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (nextStatus: 'draft' | 'published') => {
    if (!seriesName.trim() || !description.trim()) {
      await showMessage({ title: 'Missing fields', message: 'Add a name and description.' });
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('seriesName', seriesName.trim());
      form.append('description', description.trim());
      form.append('price', String(Number(price) || 0));
      form.append('status', nextStatus);
      const response = await apiConnector.post(endpoints.CREATE_MOCK_TEST_SERIES, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20000,
      });
      const created = response.data?.data;
      if (!created?._id) {
        throw new Error(response.data?.message || 'Could not create series');
      }
      router.replace(`/admin/edit-series/${created._id}`);
    } catch (error: any) {
      await showMessage({
        title: 'Could not create',
        message: error?.response?.data?.message || error?.message || 'Try again.',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsShell title="Create Mock Test">
      <Text style={styles.hint}>Create the series first, then add tests and bulk questions.</Text>
      <Input label="Series name" value={seriesName} onChangeText={setSeriesName} placeholder="JKSSB Patwari Set 1" />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Exam-style papers with solutions"
        multiline
      />
      <Input
        label="Price (₹)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="0"
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.row}>
        {(['published', 'draft'] as const).map((id) => (
          <Pressable
            key={id}
            onPress={() => setStatus(id)}
            style={[
              styles.chip,
              {
                borderColor: status === id ? colors.text : colors.border,
                backgroundColor: status === id ? colors.text : 'transparent',
              },
            ]}
          >
            <Text style={{ color: status === id ? colors.background : colors.textSecondary, fontFamily: Fonts.medium, fontSize: 12 }}>
              {id}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button title="Create and add tests" onPress={() => handleCreate(status)} isLoading={saving} />
      <Button title="Save as draft" onPress={() => handleCreate('draft')} variant="outline" disabled={saving} />
    </SettingsShell>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    hint: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    label: {
      marginTop: 10,
      marginBottom: 8,
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      minHeight: 34,
      paddingHorizontal: 12,
      borderRadius: Radii.pill,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
