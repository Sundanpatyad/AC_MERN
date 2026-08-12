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
import { useRouter } from 'expo-router';
import { Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

interface MockTestCardProps {
  test: any;
  onPress?: () => void;
  showStatus?: boolean;
  /** `default` = media card, `row` = compact list row */
  variant?: 'default' | 'row';
  style?: StyleProp<ViewStyle>;
}

export function MockTestCard({
  test,
  onPress,
  showStatus = false,
  variant = 'default',
  style,
}: MockTestCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const isRow = variant === 'row';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/mock-test/${test._id}`);
    }
  };

  const isFree = test.price === 0;
  const testCount = test.mockTests?.length || 0;
  const priceLabel = isFree ? 'Free' : `₹${test.price}`;

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
              {showStatus ? 'View' : 'Details'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
