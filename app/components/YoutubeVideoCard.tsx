import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

export type YoutubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string | null;
  url: string;
};

export function formatVideoDate(iso: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Props = {
  video: YoutubeVideo;
  onPress: () => void;
  variant?: 'hero' | 'feed';
  heroWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function YoutubeVideoCard({
  video,
  onPress,
  variant = 'feed',
  heroWidth = 260,
  style,
}: Props) {
  const { colors } = useTheme();
  const dateLabel = formatVideoDate(video.publishedAt);

  if (variant === 'hero') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={video.title}
        style={({ pressed }) => [styles.hero, { width: heroWidth, opacity: pressed ? 0.94 : 1 }, style]}
      >
        <Image source={{ uri: video.thumbnail }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
          locations={[0.2, 0.55, 1]}
          style={styles.heroGradient}
        />
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {video.title}
          </Text>
          {dateLabel ? <Text style={styles.heroDate}>{dateLabel}</Text> : null}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={video.title}
      style={({ pressed }) => [styles.feed, { opacity: pressed ? 0.94 : 1 }, style]}
    >
      <Image
        source={{ uri: video.thumbnail }}
        style={[styles.feedImage, { backgroundColor: colors.surfaceRaised }]}
        resizeMode="cover"
      />
      <Text style={[styles.feedTitle, { color: colors.text }]} numberOfLines={2}>
        {video.title}
      </Text>
      <Text style={[styles.feedMeta, { color: colors.textMuted }]} numberOfLines={1}>
        {dateLabel ? `Awakening Classes · ${dateLabel}` : 'Awakening Classes'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 176,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroCopy: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.semiBold,
    letterSpacing: -0.2,
  },
  heroDate: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontFamily: Fonts.sans,
    lineHeight: 16,
  },
  feed: {
    gap: 8,
  },
  feedImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radii.md,
  },
  feedTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.semiBold,
    letterSpacing: -0.2,
  },
  feedMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sans,
  },
});
