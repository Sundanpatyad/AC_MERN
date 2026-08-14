import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Fonts, Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';
import { isInstructorAccount, useAuthStore } from '@/store/authStore';

interface MockTestCardProps {
  test: any;
  onPress?: () => void;
  showStatus?: boolean;
  /** `default` = media card, `row` = compact list row, `hero` = tall carousel card */
  variant?: 'default' | 'row' | 'hero';
  style?: StyleProp<ViewStyle>;
  /** Width for hero carousel cards */
  heroWidth?: number;
}

function stripHtml(value?: string) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function MockTestCard({
  test,
  onPress,
  showStatus = false,
  variant = 'default',
  style,
  heroWidth = 320,
}: MockTestCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const instructor = isInstructorAccount(user?.accountType);
  const isRow = variant === 'row';
  const isHero = variant === 'hero';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/mock-test/${test._id}`);
    }
  };

  const isFree = Number(test.price) === 0;
  const testCount = test.mockTests?.length || 0;
  const priceLabel = isFree ? 'Free' : `₹${test.price}`;
  const actionLabel =
    instructor || isFree || showStatus || test.isEnrolled ? 'Start now' : 'Buy now';
  const description =
    stripHtml(test.description) ||
    `${testCount} ${testCount === 1 ? 'test' : 'tests'} · Practice and rank up`;
  const badgeLabel = isFree ? 'Free' : showStatus ? 'Enrolled' : 'Featured';

  if (isHero) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${test.seriesName}, ${priceLabel}`}
        style={({ pressed }) => [
          styles.hero,
          { width: heroWidth, opacity: pressed ? 0.94 : 1 },
          style,
        ]}
      >
        {test.thumbnail ? (
          <Image source={{ uri: test.thumbnail }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.surfaceRaised }]}>
            <Ionicons name="book-outline" size={32} color={colors.textMuted} />
          </View>
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
          locations={[0.2, 0.55, 1]}
          style={styles.heroGradient}
        />

        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>{badgeLabel}</Text>
        </View>

        <View style={styles.heroCopy}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {test.seriesName}
            </Text>
            <Text style={styles.heroPrice} numberOfLines={1}>
              {priceLabel}
            </Text>
          </View>
          <Text style={styles.heroDesc} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </Pressable>
    );
  }

  if (isRow) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${test.seriesName}, ${priceLabel}`}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.92 : 1,
          },
          style,
        ]}
      >
        <View style={[styles.rowThumb, { backgroundColor: colors.surfaceRaised }]}>
          {test.thumbnail ? (
            <Image source={{ uri: test.thumbnail }} style={styles.rowImage} />
          ) : (
            <Ionicons name="book-outline" size={22} color={colors.textMuted} />
          )}
        </View>

        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
            {test.seriesName}
          </Text>
          <Text style={[styles.rowMeta, { color: colors.textMuted }]} numberOfLines={1}>
            {testCount} {testCount === 1 ? 'test' : 'tests'}
            {showStatus ? ' · Enrolled' : ''}
            {` · ${priceLabel}`}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.92 },
        style,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${test.seriesName}, ${priceLabel}`}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceRaised }]}>
        {test.thumbnail ? (
          <Image source={{ uri: test.thumbnail }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book-outline" size={36} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.overlay, borderColor: colors.borderStrong },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>{testCount} Tests</Text>
          </View>
          {showStatus ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.glow, borderColor: colors.borderStrong },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.text }]}>Enrolled</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {test.seriesName}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.text }]}>{priceLabel}</Text>
          <View style={[styles.actionButton, { backgroundColor: colors.text }]}>
            <Text style={[styles.actionText, { color: colors.primaryButtonText }]}>
              {actionLabel}
            </Text>
          </View>
        </View>
      </View>
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
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  heroBadgeText: {
    color: '#111111',
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  heroCopy: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    letterSpacing: -0.2,
  },
  heroPrice: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontFamily: Fonts.sans,
    lineHeight: 16,
  },
  card: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.pill,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: 12,
  },
  rowThumb: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowImage: {
    width: '100%',
    height: '100%',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
