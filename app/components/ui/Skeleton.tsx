import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, StyleProp, DimensionValue } from 'react-native';
import { AppPalette, Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Pulsing bone used as a building block for screen loaders. */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = Radii.sm,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.bone,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 44, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

export function MockTestCardSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Skeleton height={150} borderRadius={0} />
      <View style={styles.cardBody}>
        <Skeleton height={14} width="78%" />
        <View style={styles.cardFooter}>
          <Skeleton height={14} width={56} />
          <Skeleton height={28} width={72} borderRadius={Radii.pill} />
        </View>
      </View>
    </View>
  );
}

export function HomeSkeleton({ bannerHeight = 180 }: { bannerHeight?: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <View style={[styles.homeHeader, styles.hPad]}>
        <View style={{ flex: 1, gap: 10 }}>
          <Skeleton height={10} width={120} />
          <Skeleton height={26} width="70%" />
          <Skeleton height={14} width="50%" />
        </View>
        <SkeletonCircle size={48} />
      </View>

      <View style={styles.hPad}>
        <Skeleton height={bannerHeight} borderRadius={Radii.lg} style={{ marginBottom: 12 }} />
        <Skeleton height={48} borderRadius={Radii.pill} style={{ marginBottom: 24 }} />

        <Skeleton height={18} width={110} style={{ marginBottom: 12 }} />
        <View style={styles.block}>
          <View style={styles.statsRow}>
            <Skeleton height={64} style={{ flex: 1 }} borderRadius={Radii.md} />
            <Skeleton height={64} style={{ flex: 1 }} borderRadius={Radii.md} />
            <Skeleton height={64} style={{ flex: 1 }} borderRadius={Radii.md} />
          </View>
          <Skeleton height={12} width={100} style={{ marginBottom: 12 }} />
          <View style={styles.chartRow}>
            {[40, 70, 55, 90, 60, 75].map((h, i) => (
              <Skeleton key={i} height={h} width={28} borderRadius={Radii.sm} />
            ))}
          </View>
        </View>

        <Skeleton height={18} width={110} style={{ marginTop: 20, marginBottom: 12 }} />
        <View style={styles.block}>
          <View style={styles.row}>
            <SkeletonCircle size={48} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton height={12} width={80} />
              <Skeleton height={24} width={64} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8, width: 90 }}>
              <Skeleton height={12} width={70} />
              <Skeleton height={10} width={90} />
            </View>
          </View>
        </View>

        <Skeleton height={18} width={140} style={{ marginTop: 20, marginBottom: 12 }} />
        <MockTestCardSkeleton />
        <MockTestCardSkeleton />
      </View>
    </View>
  );
}

export function TestListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <MockTestCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function RankingsSkeleton({ count = 8 }: { count?: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.pad}>
      <View style={[styles.block, { marginBottom: 16 }]}>
        <Skeleton height={12} width={100} style={{ marginBottom: 12 }} />
        <View style={styles.row}>
          <Skeleton height={28} width={36} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton height={14} width="50%" />
            <Skeleton height={10} width="70%" />
          </View>
          <Skeleton height={18} width={40} />
        </View>
      </View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.rankRow}>
          <Skeleton height={16} width={28} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton height={13} width="55%" />
            <Skeleton height={10} width="40%" />
          </View>
          <Skeleton height={16} width={36} />
        </View>
      ))}
    </View>
  );
}

export function DetailSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.pad}>
      <Skeleton height={200} borderRadius={Radii.lg} style={{ marginBottom: 20 }} />
      <Skeleton height={24} width="80%" style={{ marginBottom: 10 }} />
      <Skeleton height={14} width="60%" style={{ marginBottom: 20 }} />
      <View style={styles.statsRow}>
        <Skeleton height={72} style={{ flex: 1 }} borderRadius={Radii.md} />
        <Skeleton height={72} style={{ flex: 1 }} borderRadius={Radii.md} />
      </View>
      <Skeleton height={14} width="90%" style={{ marginTop: 20, marginBottom: 8 }} />
      <Skeleton height={14} width="75%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="85%" style={{ marginBottom: 24 }} />
      <Skeleton height={52} borderRadius={Radii.pill} />
    </View>
  );
}

export function MyTestsSkeleton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.pad}>
      <Skeleton height={16} width={130} style={{ marginBottom: 14 }} />
      <MockTestCardSkeleton />
      <Skeleton height={16} width={140} style={{ marginTop: 12, marginBottom: 14 }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.attemptRow}>
          <Skeleton height={14} width="65%" />
          <View style={styles.cardFooter}>
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={70} />
          </View>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    bone: {
      backgroundColor: colors.surfaceRaised,
    },
    pad: {
      gap: 0,
    },
    hPad: {
      paddingHorizontal: 20,
    },
    homeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 12,
    },
    block: {
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 100,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    cardBody: {
      padding: 16,
      gap: 14,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    attemptRow: {
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 10,
      gap: 12,
    },
  });
}
