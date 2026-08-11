import React, { useMemo } from 'react';
import { Text, StyleSheet, View, Linking } from 'react-native';
import { SettingsShell, SettingsCard, SettingsRow } from '../components/ui/SettingsShell';
import { BrandLogo } from '../components/ui/BrandLogo';
import { AppPalette, Radii } from '../constants/theme';
import { useTheme } from '../providers/AppThemeProvider';

const WEBSITE = 'https://awakeningclasses.in';
const YOUTUBE = 'https://www.youtube.com/@awakeningclasses';

export default function AboutScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SettingsShell title="About">
      <View style={styles.hero}>
        <BrandLogo size={96} style={styles.logo} />
        <Text style={styles.name}>Awakening Classes</Text>
        <Text style={styles.tagline}>Together we can</Text>
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>

      <SettingsCard>
        <SettingsRow
          label="Website"
          value="awakeningclasses.in"
          onPress={() => Linking.openURL(WEBSITE)}
        />
        <SettingsRow
          label="YouTube"
          value="@awakeningclasses"
          onPress={() => Linking.openURL(YOUTUBE)}
        />
        <SettingsRow label="Platform" value="iOS & Android" last />
      </SettingsCard>

      <Text style={styles.copy}>
        Awakening Classes helps students prepare for competitive exams with focused coaching,
        realistic mock tests, and transparent rankings.
      </Text>
      <Text style={styles.legal}>
        © {new Date().getFullYear()} Awakening Classes. All rights reserved.
      </Text>
    </SettingsShell>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    hero: {
      alignItems: 'center',
      marginBottom: 24,
    },
    logo: {
      marginBottom: 14,
    },
    name: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 6,
    },
    tagline: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    versionPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
    },
    versionText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    copy: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      marginBottom: 16,
    },
    legal: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
    },
  });
}
