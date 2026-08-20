import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Fonts, Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';
import { TickRing } from './TickRing';

const BRAND = '#B10207';

type Point = {
  value: number;
  max?: number;
};

type Props = {
  avgScore: number;
  testsTaken: number;
  rank: number | null;
  chartData: Point[];
};

function percentOf(point: Point) {
  if (point.max && point.max > 0) return (point.value / point.max) * 100;
  return point.value;
}

/** Compact average ring + recent-score bars for the home screen. */
export function ProgressGlance({ avgScore, testsTaken, rank, chartData }: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const bars = Array.from({ length: 6 }, (_, i) => chartData[chartData.length - 6 + i] ?? null);
  const hasScores = chartData.length > 0;
  const peak = Math.max(...bars.map((b) => (b ? percentOf(b) : 0)), 1);

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/my-tests')}
      accessibilityRole="button"
      accessibilityLabel="Open test history"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <TickRing progress={hasScores ? avgScore / 100 : 0} color={BRAND} trackColor={colors.border}>
        <Text style={[styles.avgValue, { color: colors.text }]}>
          {hasScores ? `${avgScore}` : '—'}
        </Text>
        <Text style={[styles.avgUnit, { color: colors.textMuted }]}>
          {hasScores ? '%' : 'avg'}
        </Text>
      </TickRing>

      <View style={styles.chartCol}>
        <Text style={[styles.chartLabel, { color: colors.textMuted }]}>Recent scores</Text>
        <View style={styles.bars}>
          {bars.map((point, i) => {
            const pct = point ? percentOf(point) : 0;
            const h = point ? Math.max(6, (pct / peak) * 64) : 6;
            return (
              <View key={i} style={styles.barSlot}>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceRaised }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: h,
                        backgroundColor: point ? colors.text : colors.border,
                        opacity: point ? 1 : 0.7,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {testsTaken} {testsTaken === 1 ? 'attempt' : 'attempts'}
          </Text>
          <Text style={[styles.metaDot, { color: colors.border }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {rank != null ? `Rank #${rank}` : 'No rank yet'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avgValue: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: Fonts.semiBold,
    letterSpacing: -0.5,
  },
  avgUnit: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.medium,
    marginTop: 1,
  },
  chartCol: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  chartLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    letterSpacing: 0.2,
  },
  bars: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barSlot: {
    flex: 1,
    height: 68,
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: 68,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  metaDot: {
    fontSize: 12,
  },
});
