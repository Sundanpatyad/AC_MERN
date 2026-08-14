import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SettingsShell } from '../../components/ui/SettingsShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { showMessage } from '../../providers/DialogProvider';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

const CATEGORIES = [
  { id: 'testReminders', label: 'Test reminders' },
  { id: 'rankUpdates', label: 'Rank updates' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'general', label: 'General' },
];

export default function SendNotificationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('testReminders');
  const [target, setTarget] = useState<'all' | 'email'>('all');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      await showMessage({ title: 'Missing fields', message: 'Add a title and message first.' });
      return;
    }
    if (target === 'email' && !email.trim()) {
      await showMessage({ title: 'Missing email', message: 'Enter the student email to notify.' });
      return;
    }

    setSending(true);
    try {
      const payload =
        target === 'all'
          ? { title: title.trim(), body: body.trim(), broadcast: true, category }
          : { title: title.trim(), body: body.trim(), email: email.trim(), category };
      const response = await apiConnector.post(endpoints.SEND_NOTIFICATION, payload);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to send');
      }
      const { successCount = 0, failureCount = 0, skippedByPrefs = 0, message } = response.data;
      await showMessage({
        title: 'Notification sent',
        message:
          message ||
          `Sent to ${successCount} device(s)${failureCount ? `, ${failureCount} failed` : ''}${
            skippedByPrefs ? `, ${skippedByPrefs} skipped` : ''
          }`,
      });
      setTitle('');
      setBody('');
      if (target === 'email') setEmail('');
    } catch (error: any) {
      await showMessage({
        title: 'Could not send',
        message: error?.response?.data?.message || error?.message || 'Try again.',
        tone: 'danger',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <SettingsShell title="Send Notification">
      <Text style={styles.hint}>
        Choose a type matching the toggles in notification settings. Users who disabled that type
        will be skipped.
      </Text>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="Exam reminder" />
      <Input
        label="Message"
        value={body}
        onChangeText={setBody}
        placeholder="Your next mock is live"
        multiline
      />

      <Text style={styles.label}>Audience</Text>
      <View style={styles.row}>
        {(['all', 'email'] as const).map((id) => (
          <Chip
            key={id}
            label={id === 'all' ? 'Everyone' : 'One email'}
            active={target === id}
            onPress={() => setTarget(id)}
            colors={colors}
          />
        ))}
      </View>
      {target === 'email' ? (
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="student@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      ) : null}

      <Text style={styles.label}>Category</Text>
      <View style={styles.row}>
        {CATEGORIES.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            active={category === item.id}
            onPress={() => setCategory(item.id)}
            colors={colors}
          />
        ))}
      </View>

      <Button title="Send notification" onPress={handleSend} isLoading={sending} />
    </SettingsShell>
  );
}

function Chip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: AppPalette;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 34,
        paddingHorizontal: 12,
        borderRadius: Radii.pill,
        borderWidth: 1,
        borderColor: active ? colors.text : colors.border,
        backgroundColor: active ? colors.text : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: Fonts.medium,
          color: active ? colors.background : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    hint: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    label: {
      marginTop: 10,
      marginBottom: 8,
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
      letterSpacing: 0.3,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
  });
}
