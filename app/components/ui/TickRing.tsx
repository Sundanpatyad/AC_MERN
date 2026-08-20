import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  progress: number;
  size?: number;
  ticks?: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
};

/** Tick-style circular progress. progress is 0–1. */
export function TickRing({
  progress,
  size = 92,
  ticks = 36,
  color,
  trackColor,
  children,
}: Props) {
  const filled = Math.round(Math.max(0, Math.min(1, progress)) * ticks);
  const radius = size / 2 - 7;
  const tickH = size > 100 ? 10 : 8;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: ticks }, (_, i) => {
        const deg = (i / ticks) * 360;
        return (
          <View
            key={i}
            style={[
              styles.tick,
              {
                top: size / 2 - tickH / 2,
                left: size / 2 - 1.5,
                height: tickH,
                backgroundColor: i < filled ? color : trackColor,
                transform: [{ rotate: `${deg}deg` }, { translateY: -radius }],
              },
            ]}
          />
        );
      })}
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tick: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
