import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SettingsShell, SettingsCard, SettingsRow } from '../components/ui/SettingsShell';
import { ThemePreference } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';

const OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  {
    value: 'system',
    label: 'System',
    description: 'Match your device light or dark setting',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light appearance',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark appearance',
  },
];

export default function AppearanceScreen() {
  const { preference, setPreference, colors } = useTheme();

  const onSelect = async (value: ThemePreference) => {
    if (value === preference) return;
    await setPreference(value);
  };

  return (
    <SettingsShell title="Appearance">
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Choose how Awakening Classes looks. System follows your phone settings.
      </Text>

      <SettingsCard>
        {OPTIONS.map((opt, index) => (
          <SettingsRow
            key={opt.value}
            label={opt.label}
            value={opt.description}
            selected={preference === opt.value}
            last={index === OPTIONS.length - 1}
            onPress={() => onSelect(opt.value)}
          />
        ))}
      </SettingsCard>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
});
