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
import { Palette, Radii } from '@/constants/theme';

interface MockTestCardProps {
  test: any;
  onPress?: () => void;
  showStatus?: boolean;
}

export function MockTestCard({ test, onPress, showStatus = false }: MockTestCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/mock-test/${test._id}`);
    }
  };

  const isFree = test.price === 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={handlePress}>
      <View style={styles.imageContainer}>
        {test.thumbnail ? (
          <Image source={{ uri: test.thumbnail }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book" size={36} color={Palette.textMuted} />
          </View>
        )}
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{test.mockTests?.length || 0} Tests</Text>
          </View>
          {showStatus && (
            <View style={[styles.badge, styles.enrolledBadge]}>
              <Text style={styles.badgeText}>Enrolled</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {test.seriesName}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{isFree ? 'Free' : `₹${test.price}`}</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
            <Text style={styles.actionText}>{showStatus ? 'View' : 'Details'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Palette.surfaceRaised,
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
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
  },
  enrolledBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  badgeText: {
    color: Palette.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  title: {
    color: Palette.text,
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
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: Palette.text,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  actionText: {
    color: Palette.black,
    fontSize: 12,
    fontWeight: '700',
  },
});
