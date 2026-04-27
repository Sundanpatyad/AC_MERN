import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {test.thumbnail ? (
          <Image source={{ uri: test.thumbnail }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="book" size={40} color="#333" />
          </View>
        )}
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{test.mockTests?.length || 0} Tests</Text>
          </View>
          {showStatus && (
             <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.8)' }]}>
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
          <Text style={styles.price}>
            {isFree ? 'Free' : `₹${test.price}`}
          </Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handlePress}
          >
            <Text style={styles.actionText}>
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
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1a1a1a',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
});
