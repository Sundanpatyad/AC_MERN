import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function RankingsScreen() {
  const { user } = useAuthStore();
  const [rankings, setRankings] = useState<any[]>([]);
  const [personalRank, setPersonalRank] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState('All');
  const [availableTests, setAvailableTests] = useState<string[]>(['All']);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRankings = async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum > 1 && !hasMore) return;
    
    if (pageNum === 1 && !shouldRefresh) setIsLoading(true);
    else if (pageNum > 1) setIsLoadingMore(true);

    try {
      const params: any = {
        page: pageNum,
        limit: 20
      };
      if (selectedTest !== 'All') params.testName = selectedTest;
      
      const response = await apiConnector.get(endpoints.GET_RANKINGS, null, null, params);
      if (response.data?.success) {
        const newData = response.data.data || [];
        const pagination = response.data.pagination;
        
        if (shouldRefresh || pageNum === 1) {
          setRankings(newData);
        } else {
          setRankings(prev => [...prev, ...newData]);
        }
        
        setHasMore(pagination?.hasNextPage || false);
        setPage(pageNum);

        // User personal rank
        if (response.data.loggedInUserRank && response.data.loggedInUserRank.length > 0) {
          setPersonalRank(response.data.loggedInUserRank[0]);
        } else if (pageNum === 1) {
          setPersonalRank(null);
        }
        
        // Only update test list if on 'All' and first page
        if (selectedTest === 'All' && pageNum === 1) {
          const tests = ['All', ...Array.from(new Set(newData.map((r: any) => r.testName)))] as string[];
          if (tests.length > availableTests.length) {
            setAvailableTests(tests);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRankings(1, true);
  }, [selectedTest]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchRankings(page + 1);
    }
  };

  const filteredData = searchQuery.trim() === '' 
    ? rankings 
    : rankings.filter(rank => 
        rank.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rank.testName.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const renderRankCard = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.rankCard}>
      <View style={styles.rankBadge}>
        {item.rank === 1 && <Ionicons name="trophy" size={20} color="#fbbf24" />}
        {item.rank === 2 && <Ionicons name="trophy" size={20} color="#9ca3af" />}
        {item.rank === 3 && <Ionicons name="trophy" size={20} color="#b45309" />}
        {item.rank > 3 && <Text style={styles.rankNumber}>{item.rank}</Text>}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.userName}</Text>
        <Text style={styles.testName} numberOfLines={1}>{item.testName}</Text>
        <Text style={styles.seriesName} numberOfLines={1}>{item.seriesName}</Text>
      </View>

      <View style={styles.scoreInfo}>
        <Text style={styles.score}>{item.score}</Text>
        <Text style={styles.totalScore}>/ {item.totalQuestions}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performers across all tests</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by user or test..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {availableTests.map((test) => (
            <TouchableOpacity
              key={test}
              style={[
                styles.filterBadge,
                selectedTest === test && styles.filterBadgeActive
              ]}
              onPress={() => setSelectedTest(test)}
            >
              <Text style={[
                styles.filterText,
                selectedTest === test && styles.filterTextActive
              ]}>{test}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderRankCard}
        keyExtractor={(item, index) => `${item.userId}-${item.testName}-${index}`}
        contentContainerStyle={styles.scrollContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListHeaderComponent={
          personalRank ? (
            <View style={styles.personalRankSection}>
              <Text style={styles.sectionLabel}>Your Ranking</Text>
              <View style={[styles.rankCard, styles.userRankCard]}>
                <View style={styles.rankBadge}>
                  <Text style={[styles.rankNumber, { color: '#3b82f6' }]}>{personalRank.rank}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>You</Text>
                  <Text style={styles.testName} numberOfLines={1}>{personalRank.testName}</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.score}>{personalRank.score}</Text>
                  <Text style={styles.totalScore}>/ {personalRank.totalQuestions}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>All Rankings</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>No rankings found matching your filters.</Text>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />
          ) : null
        }
      />
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
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },
  filterContainer: {
    marginTop: 12,
  },
  filterContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterBadge: {
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  filterBadgeActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  personalRankSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  userRankCard: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 16,
  },
  list: {
    gap: 10,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 0,
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: '#666',
    fontSize: 13,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  testName: {
    color: '#888',
    fontSize: 10,
    marginBottom: 1,
  },
  seriesName: {
    color: '#555',
    fontSize: 9,
  },
  scoreInfo: {
    alignItems: 'flex-end',
    minWidth: 40,
  },
  score: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '700',
  },
  totalScore: {
    color: '#555',
    fontSize: 10,
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
