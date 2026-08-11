import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { SettingsShell, SettingsCard, SettingsRow } from '../components/ui/SettingsShell';
import { Palette } from '../constants/theme';

const STORAGE_KEY = 'ac_notification_prefs';

type Prefs = {
  pushEnabled: boolean;
  testReminders: boolean;
  rankUpdates: boolean;
  promotions: boolean;
};

const DEFAULTS: Prefs = {
  pushEnabled: true,
  testReminders: true,
  rankUpdates: true,
  promotions: false,
};

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const update = async (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    if (key === 'pushEnabled' && !value) {
      next.testReminders = false;
      next.rankUpdates = false;
      next.promotions = false;
    }
    setPrefs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    Toast.show({ type: 'success', text1: 'Preferences saved' });
  };

  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
    <Switch
      value={value}
      onValueChange={onChange}
      disabled={disabled || !ready}
      trackColor={{ false: Palette.surfaceRaised, true: 'rgba(255,255,255,0.35)' }}
      thumbColor={value ? Palette.text : Palette.textMuted}
    />
  );

  return (
    <SettingsShell title="Notifications">
      <Text style={styles.hint}>
        Control which alerts you receive from Awakening Classes. Preferences are saved on this device.
      </Text>

      <SettingsCard>
        <SettingsRow
          label="Push notifications"
          value="Master switch for all alerts"
          right={
            <Toggle
              value={prefs.pushEnabled}
              onChange={(v) => update('pushEnabled', v)}
            />
          }
        />
        <SettingsRow
          label="Test reminders"
          value="Upcoming mocks and deadlines"
          right={
            <Toggle
              value={prefs.testReminders}
              onChange={(v) => update('testReminders', v)}
              disabled={!prefs.pushEnabled}
            />
          }
        />
        <SettingsRow
          label="Rank updates"
          value="When leaderboard positions change"
          right={
            <Toggle
              value={prefs.rankUpdates}
              onChange={(v) => update('rankUpdates', v)}
              disabled={!prefs.pushEnabled}
            />
          }
        />
        <SettingsRow
          label="Promotions"
          value="Offers and new series"
          last
          right={
            <Toggle
              value={prefs.promotions}
              onChange={(v) => update('promotions', v)}
              disabled={!prefs.pushEnabled}
            />
          }
        />
      </SettingsCard>
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
});
