import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppPalette, Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

type Point = {
  label: string;
  value: number;
  max?: number;
};

type Props = {
  data: Point[];
  height?: number;
};

/** Lightweight bar chart — no extra native deps. */
export function ScoreBarChart({ data, height = 140 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!data.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No attempt data yet</Text>
      </View>
    );
  }

  const maxValue = Math.max(
    ...data.map((d) => (d.max && d.max > 0 ? (d.value / d.max) * 100 : d.value)),
    1
  );

  return (
    <View style={[styles.chart, { height }]}>
      {data.map((point, index) => {
        const pct =
          point.max && point.max > 0
            ? (point.value / point.max) * 100
            : point.value;
        const barHeight = Math.max(8, (pct / maxValue) * (height - 36));

        return (
          <View key={`${point.label}-${index}`} style={styles.col}>
            <Text style={styles.valueLabel}>
              {point.max ? `${point.value}` : Math.round(pct)}
            </Text>
            <View style={[styles.barTrack, { height: height - 36 }]}>
              <View style={[styles.barFill, { height: barHeight }]} />
            </View>
            <Text style={styles.axisLabel} numberOfLines={1}>
              {point.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      paddingTop: 4,
    },
    col: {
      flex: 1,
      alignItems: 'center',
    },
    valueLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 4,
    },
    barTrack: {
      width: '70%',
      maxWidth: 28,
      justifyContent: 'flex-end',
      backgroundColor: colors.surfaceRaised,
      borderRadius: Radii.sm,
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      backgroundColor: colors.text,
      borderRadius: Radii.sm,
      opacity: 0.92,
    },
    axisLabel: {
      marginTop: 6,
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '600',
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceRaised,
      borderRadius: Radii.md,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 13,
    },
  });
}
