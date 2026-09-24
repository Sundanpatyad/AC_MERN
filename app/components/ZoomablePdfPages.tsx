import React, { useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../providers/AppThemeProvider';
import { Fonts } from '../constants/theme';

const PAGE_GAP = 10;
const PAGE_RATIO = 1.35;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

type Props = {
  pages: string[];
  width: number;
};

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 20) / 20));
}

function touchDistance(event: GestureResponderEvent) {
  const touches = event.nativeEvent.touches;
  if (touches.length < 2) return 0;
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

export function ZoomablePdfPages({ pages, width }: Props) {
  const { colors } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [pinching, setPinching] = useState(false);
  const [areaH, setAreaH] = useState(0);
  const startDistance = useRef(0);
  const startZoom = useRef(1);
  const lastTap = useRef(0);
  const pageWidth = width * zoom;
  const pageHeight = pageWidth * PAGE_RATIO;
  const canPanX = zoom > 1.01;

  const applyZoom = (value: number) => {
    setZoom(clampZoom(value));
  };

  const onAreaLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (next > 0 && next !== areaH) setAreaH(next);
  };

  const onTouchStart = (event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length < 2) return;
    startDistance.current = touchDistance(event);
    startZoom.current = zoom;
    setPinching(true);
  };

  const onTouchMove = (event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length < 2 || startDistance.current <= 0) return;
    const distance = touchDistance(event);
    if (distance <= 0) return;
    applyZoom(startZoom.current * (distance / startDistance.current));
  };

  const onTouchEnd = (event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length >= 2) return;
    startDistance.current = 0;
    setPinching(false);
  };

  const pagesBlock = (
    <View onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      {pages.map((uri, index) => (
        <Pressable
          key={`${index}-${uri.slice(-24)}`}
          onPress={() => {
            const now = Date.now();
            if (now - lastTap.current < 280) applyZoom(zoom > 1.05 ? 1 : 2);
            lastTap.current = now;
          }}
        >
          <Image
            source={{ uri }}
            style={{ width: pageWidth, height: pageHeight, marginBottom: PAGE_GAP, backgroundColor: '#fff' }}
            resizeMode="contain"
          />
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.zoomBar, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => applyZoom(zoom - 0.25)}
          hitSlop={8}
          disabled={zoom <= MIN_ZOOM}
          accessibilityLabel="Zoom out"
        >
          <Text style={[styles.zoomBtn, { color: zoom <= MIN_ZOOM ? colors.border : colors.text }]}>−</Text>
        </Pressable>
        <Text style={[styles.zoomLabel, { color: colors.text }]}>{Math.round(zoom * 100)}%</Text>
        <Pressable
          onPress={() => applyZoom(zoom + 0.25)}
          hitSlop={8}
          disabled={zoom >= MAX_ZOOM}
          accessibilityLabel="Zoom in"
        >
          <Text style={[styles.zoomBtn, { color: zoom >= MAX_ZOOM ? colors.border : colors.text }]}>+</Text>
        </Pressable>
      </View>

      <View style={styles.root} onLayout={onAreaLayout}>
        <ScrollView
          horizontal
          style={areaH ? { width, height: areaH } : styles.root}
          contentContainerStyle={{ width: pageWidth }}
          scrollEnabled={!pinching && canPanX}
          nestedScrollEnabled
          directionalLockEnabled
          bounces={canPanX}
          showsHorizontalScrollIndicator={canPanX}
          persistentScrollbar={Platform.OS === 'android' && canPanX}
          removeClippedSubviews={false}
        >
          <ScrollView
            style={areaH ? { width: pageWidth, height: areaH } : { width: pageWidth }}
            contentContainerStyle={styles.content}
            scrollEnabled={!pinching}
            nestedScrollEnabled
            directionalLockEnabled
            bounces
            showsVerticalScrollIndicator
            persistentScrollbar={Platform.OS === 'android'}
            removeClippedSubviews={false}
          >
            {pagesBlock}
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  zoomBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  zoomBtn: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: Fonts.medium,
    minWidth: 18,
    textAlign: 'center',
  },
  zoomLabel: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
});
