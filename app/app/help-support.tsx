import React from 'react';
import { Text, StyleSheet, Linking, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsShell, SettingsCard, SettingsRow } from '../components/ui/SettingsShell';
import { Palette, Radii } from '../constants/theme';

const SUPPORT_EMAIL = 'mailto:support@awakeningclasses.com';
const WHATSAPP = 'https://whatsapp.com/channel/0029Van0bFDDDmFZjhOoX03N';
const YOUTUBE = 'https://www.youtube.com/@awakeningclasses';
const TELEGRAM = 'https://t.me/awakeningclasses3103';
const WEBSITE = 'https://awakeningclasses.com';

export default function HelpSupportScreen() {
  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <SettingsShell title="Help & Support">
      <Text style={styles.hint}>
        Need help with mocks, payments, or your account? Reach us through any channel below.
      </Text>

      <SettingsCard>
        <SettingsRow
          label="Email support"
          value="support@awakeningclasses.com"
          onPress={() => open(SUPPORT_EMAIL)}
          right={<Ionicons name="mail-outline" size={18} color={Palette.textSecondary} />}
        />
        <SettingsRow
          label="WhatsApp"
          value="Join our channel"
          onPress={() => open(WHATSAPP)}
          right={<Ionicons name="logo-whatsapp" size={18} color="#25D366" />}
        />
        <SettingsRow
          label="Telegram"
          value="t.me/awakeningclasses3103"
          onPress={() => open(TELEGRAM)}
          right={<Ionicons name="paper-plane-outline" size={18} color={Palette.textSecondary} />}
        />
        <SettingsRow
          label="Website"
          value="awakeningclasses.com"
          onPress={() => open(WEBSITE)}
          right={<Ionicons name="globe-outline" size={18} color={Palette.textSecondary} />}
        />
        <SettingsRow
          label="YouTube lectures"
          value="@awakeningclasses"
          last
          onPress={() => open(YOUTUBE)}
          right={<Ionicons name="logo-youtube" size={18} color="#FF0000" />}
        />
      </SettingsCard>

      <Text style={styles.sectionLabel}>FAQs</Text>
      <View style={styles.faqCard}>
        <Text style={styles.faqQ}>How do I start a mock test?</Text>
        <Text style={styles.faqA}>
          Open Tests, pick a series, enroll if needed, then tap Start on any available mock.
        </Text>
        <View style={styles.divider} />
        <Text style={styles.faqQ}>Where can I see my ranks?</Text>
        <Text style={styles.faqA}>
          Use the Rankings tab for the global leaderboard, or Home for your personal rank summary.
        </Text>
        <View style={styles.divider} />
        <Text style={styles.faqQ}>Payment failed but money was deducted?</Text>
        <Text style={styles.faqA}>
          Contact support with your payment ID. We verify Razorpay payments and unlock access once confirmed.
        </Text>
      </View>
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
  sectionLabel: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  faqCard: {
    backgroundColor: Palette.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 16,
  },
  faqQ: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  faqA: {
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.border,
    marginVertical: 14,
  },
});
