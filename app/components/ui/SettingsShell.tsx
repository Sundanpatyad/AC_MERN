import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBackground } from './ScreenBackground';
import { MeshHero } from './MeshHero';
import { Radii, Type } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

type Props = {
  title: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function SettingsShell({ title, children, contentStyle }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 14 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.backBtnSpacer} />
        </View>
      </MeshHero>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </ScreenBackground>
  );
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

export function SettingsRow({
  label,
  value,
  onPress,
  right,
  last,
  selected,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  const Comp: any = onPress ? TouchableOpacity : View;
  return (
    <Comp
      style={[
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
        ) : null}
      </View>
      {right}
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.text} />
      ) : onPress && !right ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Comp>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
  },
  backBtnSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    ...Type.title,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    marginTop: 3,
  },
});
