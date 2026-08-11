import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { TestListSkeleton } from '../../components/ui/Skeleton';
import { Palette, Radii } from '../../constants/theme';

export default function MockTestsScreen() {
  const [allTests, setAllTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    try {
      const response = await apiConnector.get(endpoints.GET_ALL_MOCK_TESTS);
      if (response.data?.success) {
        const tests = response.data.data
          .filter((t: any) => t.status !== 'draft')
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setAllTests(tests);
      }
    } catch (error) {
      console.error('Failed to fetch all tests:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTests();
  };

  const filteredTests = allTests.filter((test: any) =>
    test.seriesName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Tests</Text>
        <Text style={styles.subtitle}>Challenge yourself with our latest mock tests</Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={Palette.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search series..."
            placeholderTextColor={Palette.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.testsList}>
          {isLoading ? (
            <TestListSkeleton count={4} />
          ) : filteredTests.length > 0 ? (
            filteredTests.map((test: any) => <MockTestCard key={test._id} test={test} />)
          ) : (
            <Text style={styles.emptyText}>No mock tests found.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Palette.text,
    fontSize: 15,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  testsList: {
    gap: 4,
  },
  loadingText: {
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  emptyText: {
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 13,
  },
});
