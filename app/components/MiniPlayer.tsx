import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AutoplayYoutube } from './AutoplayYoutube';
import { useNativeBottomInset } from '../lib/safeArea';
import { floatingTabBarContainerHeight } from '../constants/layout';
import { Fonts } from '../constants/theme';

export type MiniVideo = {
  id: string;
  title: string;
  publishedAt?: string;
};

type MiniPlayerContextValue = {
  video: MiniVideo | null;
  setVideo: (video: MiniVideo) => void;
  close: () => void;
  dismissIfExpanded: () => void;
};

const MiniPlayerContext = createContext<MiniPlayerContextValue>({
  video: null,
  setVideo: () => {},
  close: () => {},
  dismissIfExpanded: () => {},
});

export function useMiniPlayer() {
  return useContext(MiniPlayerContext);
}

export function MiniPlayerProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideoState] = useState<MiniVideo | null>(null);
  const [mini, setMini] = useState(false);
  const keepMini = useRef(false);

  const setVideo = useCallback((next: MiniVideo) => {
    keepMini.current = false;
    setMini(false);
    setVideoState((current) =>
      current?.id === next.id && current.title === next.title ? current : next
    );
  }, []);
  const close = useCallback(() => {
    keepMini.current = false;
    setMini(false);
    setVideoState(null);
  }, []);
  const markMini = useCallback(() => {
    keepMini.current = true;
    setMini(true);
  }, []);
  const dismissIfExpanded = useCallback(() => {
    if (keepMini.current) return;
    setMini(false);
    setVideoState(null);
  }, []);
  const value = useMemo(
    () => ({ video, setVideo, close, dismissIfExpanded }),
    [video, setVideo, close, dismissIfExpanded]
  );

  return (
    <MiniPlayerContext.Provider value={value}>
      {children}
      <MiniPlayerHost mini={mini} onMinimize={markMini} />
    </MiniPlayerContext.Provider>
  );
}

function MiniPlayerHost({ mini, onMinimize }: { mini: boolean; onMinimize: () => void }) {
  const { video, close } = useMiniPlayer();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const bottomInset = useNativeBottomInset();
  const { width, height: screenHeight } = useWindowDimensions();
  const onWatch = segments[0] === 'watch' && Boolean(video);
  const playerHeight = Math.round(width * (9 / 16));
  const miniWidth = Math.min(196, Math.round(width * 0.46));
  const miniHeight = Math.round(miniWidth * (9 / 16));
  const miniBottom = floatingTabBarContainerHeight(bottomInset) + 10;
  const dragY = useSharedValue(0);

  const goBack = useCallback(() => {
    close();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, [close, router]);

  const finishMinimize = useCallback(() => {
    onMinimize();
    dragY.value = 0;
    router.replace('/(tabs)');
  }, [dragY, onMinimize, router]);

  const openFull = useCallback(() => {
    if (!video) return;
    router.push({
      pathname: '/watch/[id]',
      params: {
        id: video.id,
        title: video.title,
        publishedAt: video.publishedAt || '',
      },
    });
  }, [router, video]);

  const swipeDown = Gesture.Pan()
    .activeOffsetY(18)
    .failOffsetX([-36, 36])
    .onUpdate((event) => {
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const travel = screenHeight - insets.top - miniBottom - miniHeight;
      if (event.translationY > 90 || event.velocityY > 900) {
        dragY.value = withTiming(travel, { duration: 280 }, (finished) => {
          if (finished) runOnJS(finishMinimize)();
        });
      } else {
        dragY.value = withTiming(0, { duration: 180 });
      }
    });

  const expandedStyle = useAnimatedStyle(() => {
    const travel = Math.max(screenHeight - insets.top - miniBottom - miniHeight, 1);
    const p = Math.min(dragY.value / travel, 1);
    return {
      width: width - p * (width - miniWidth),
      height: playerHeight - p * (playerHeight - miniHeight),
      transform: [{ translateY: dragY.value }, { translateX: p * (width - miniWidth - 12) }],
      borderRadius: p * 12,
    };
  });

  if (!video || segments[0] === '(auth)') return null;

  if (onWatch && !mini) {
    return (
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <GestureDetector gesture={swipeDown}>
          <Animated.View style={[styles.expanded, { top: insets.top }, expandedStyle]}>
            <AutoplayYoutube videoId={video.id} height={playerHeight} width={width} />
            <Pressable
              onPress={goBack}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }

  if (!mini) return null;

  return (
    <View
      style={[
        styles.mini,
        {
          width: miniWidth,
          height: miniHeight,
          right: 12,
          bottom: floatingTabBarContainerHeight(bottomInset) + 10,
        },
      ]}
    >
      <AutoplayYoutube videoId={video.id} height={miniHeight} width={miniWidth} />
      <Pressable
        onPress={openFull}
        accessibilityRole="button"
        accessibilityLabel="Open video"
        style={styles.miniTap}
      />
      <Pressable
        onPress={close}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Close video"
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={14} color="#FFFFFF" />
      </Pressable>
      {video.title ? (
        <View style={styles.miniTitleWrap} pointerEvents="none">
          <Text style={styles.miniTitle} numberOfLines={1}>{video.title}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  expanded: {
    position: 'absolute',
    left: 0,
    zIndex: 40,
    backgroundColor: '#000',
  },
  backBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mini: {
    position: 'absolute',
    zIndex: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  miniTap: {
    ...StyleSheet.absoluteFillObject,
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  miniTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  miniTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.semiBold,
  },
});
