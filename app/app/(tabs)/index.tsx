import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [featuredTests, setFeaturedTests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeaturedTests = useCallback(async () => {
    try {
      const response = await apiConnector.get(endpoints.GET_ALL_MOCK_TESTS);
      if (response.data?.success) {
        // Filter out drafts and show latest 5
        const tests = response.data.data
          .filter((t: any) => t.status !== 'draft')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setFeaturedTests(tests);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedTests();
  }, [fetchFeaturedTests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeaturedTests();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting} numberOfLines={1}>Hello, {user?.firstName}!</Text>
            <Text style={styles.subtitle}>Ready to practice today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="star" size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>Top 10%</Text>
            <Text style={styles.statLabel}>Avg Rank</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Tests</Text>
          <Text 
            style={styles.seeAll}
            onPress={() => router.push('/(tabs)/mock-tests')}
          >
            See All
          </Text>
        </View>

        <View style={styles.testsList}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading tests...</Text>
          ) : featuredTests.length > 0 ? (
            featuredTests.map((test: any) => (
              <MockTestCard key={test._id} test={test} />
            ))
          ) : (
            <Text style={styles.emptyText}>No tests available right now.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 0.2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  seeAll: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
  },
  testsList: {
    gap: 14,
    paddingBottom: 20,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 13,
  },
});
