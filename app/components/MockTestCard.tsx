import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Radii } from '@/constants/theme';
import { useTheme } from '@/providers/AppThemeProvider';

interface MockTestCardProps {
  test: any;
  onPress?: () => void;
  showStatus?: boolean;
}

export function MockTestCard({ test, onPress, showStatus = false }: MockTestCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/mock-test/${test._id}`);
    }
  };

  const isFree = test.price === 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceRaised }]}>
        {test.thumbnail ? (
          <Image source={{ uri: test.thumbnail }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book" size={36} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.overlay, borderColor: colors.borderStrong },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.text }]}>{test.mockTests?.length || 0} Tests</Text>
          </View>
          {showStatus && (
            <View
              style={[
                styles.badge,
                styles.enrolledBadge,
                { backgroundColor: colors.glow, borderColor: colors.borderStrong },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.text }]}>Enrolled</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {test.seriesName}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.text }]}>
            {isFree ? 'Free' : `₹${test.price}`}
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.text }]}
            onPress={handlePress}
          >
            <Text style={[styles.actionText, { color: colors.primaryButtonText }]}>
              {showStatus ? 'View' : 'Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 14,
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
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  enrolledBadge: {
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
