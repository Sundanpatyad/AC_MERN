import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsShell, SettingsCard, SettingsRow } from '../components/ui/SettingsShell';
import { AppPalette } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });

        const res = await apiConnector.get(endpoints.GET_NOTIFICATION_PREFS);
        if (res?.data?.success && res.data.data) {
          const merged = { ...DEFAULTS, ...res.data.data };
          setPrefs(merged);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      } catch {
        // keep local prefs if offline
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = async (next: Prefs) => {
    setPrefs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try {
      await apiConnector.put(endpoints.UPDATE_NOTIFICATION_PREFS, next);
    } catch {
      // local save still applied
    }
  };

  const update = async (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    if (key === 'pushEnabled') {
      try {
        const push = await import('../services/pushNotifications');
        if (!value) {
          next.testReminders = false;
          next.rankUpdates = false;
          next.promotions = false;
          await push.disablePushNotifications();
        } else {
          await push.enablePushNotifications();
        }
      } catch {
        // Native push may be unavailable until a native rebuild
      }
    }
    await persist(next);
  };

  const Toggle = ({
    value,
    onChange,
    disabled,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
  }) => (
    <Switch
      value={value}
      onValueChange={onChange}
      disabled={disabled || !ready}
      trackColor={{ false: colors.surfaceRaised, true: colors.borderStrong }}
      thumbColor={value ? colors.text : colors.textMuted}
    />
  );

  return (
    <SettingsShell title="Notifications">
      <Text style={styles.hint}>
        Control which alerts you receive from Awakening Classes. Preferences sync to your
        account for web and mobile.
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

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    hint: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
  });
}
