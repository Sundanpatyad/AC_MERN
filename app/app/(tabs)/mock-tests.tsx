import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';

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
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Tests</Text>
        <Text style={styles.subtitle}>Challenge yourself with our latest mock tests</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search series..."
            placeholderTextColor="#666"
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
            <Text style={styles.loadingText}>Loading tests...</Text>
          ) : filteredTests.length > 0 ? (
            filteredTests.map((test: any) => (
              <MockTestCard key={test._id} test={test} />
            ))
          ) : (
            <Text style={styles.emptyText}>No mock tests found.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },
  scrollContent: {
    padding: 20,
  },
  testsList: {
    gap: 16,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
    fontSize: 12,
  },
});
