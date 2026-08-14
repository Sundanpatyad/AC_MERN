import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MeshHero } from '../../components/ui/MeshHero';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { RankingsSkeleton, Skeleton } from '../../components/ui/Skeleton';

export default function RankingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      
      const response = await apiConnector.get(endpoints.GET_RANKINGS, { params });
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
    <Card style={styles.rankCard}>
      <View style={styles.rankBadge}>
        {item.rank === 1 && <Ionicons name="trophy" size={20} color={colors.text} />}
        {item.rank === 2 && <Ionicons name="trophy" size={20} color={colors.textSecondary} />}
        {item.rank === 3 && <Ionicons name="trophy" size={20} color={colors.textMuted} />}
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
    </Card>
  );

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performers across all tests</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by user or test..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
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
      </MeshHero>

      <FlatList
        data={filteredData}
        renderItem={renderRankCard}
        keyExtractor={(item, index) => `${item.userId}-${item.testName}-${index}`}
        contentContainerStyle={styles.scrollContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.refreshTint}
          />
        }
        ListHeaderComponent={
          personalRank ? (
            <View style={styles.personalRankSection}>
              <Text style={styles.sectionLabel}>Your Ranking</Text>
              <Card style={[styles.rankCard, styles.userRankCard]}>
                <View style={styles.rankBadge}>
                  <Text style={[styles.rankNumber, { color: colors.text }]}>{personalRank.rank}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>You</Text>
                  <Text style={styles.testName} numberOfLines={1}>{personalRank.testName}</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.score}>{personalRank.score}</Text>
                  <Text style={styles.totalScore}>/ {personalRank.totalQuestions}</Text>
                </View>
              </Card>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>All Rankings</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <RankingsSkeleton count={8} />
          ) : (
            <Text style={styles.emptyText}>No rankings found matching your filters.</Text>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ paddingVertical: 16, gap: 10 }}>
              <Skeleton height={56} borderRadius={Radii.lg} />
              <Skeleton height={56} borderRadius={Radii.lg} />
            </View>
          ) : null
        }
      />
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 40,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
    },
    filterContainer: {
      marginTop: 14,
    },
    filterContent: {
      paddingRight: 20,
      gap: 8,
    },
    filterBadge: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: Radii.pill,
    },
    filterBadgeActive: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    filterText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    filterTextActive: {
      color: colors.primaryButtonText,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 16,
    },
    personalRankSection: {
      marginBottom: 20,
    },
    sectionLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 8,
      letterSpacing: 1.2,
    },
    userRankCard: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceRaised,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    list: {
      gap: 10,
    },
    rankCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      marginBottom: 10,
    },
    rankBadge: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankNumber: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '700',
    },
    userInfo: {
      flex: 1,
      paddingHorizontal: 12,
    },
    userName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    testName: {
      color: colors.textSecondary,
      fontSize: 11,
      marginBottom: 1,
    },
    seriesName: {
      color: colors.textMuted,
      fontSize: 10,
    },
    scoreInfo: {
      alignItems: 'flex-end',
      minWidth: 40,
    },
    score: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    totalScore: {
      color: colors.textMuted,
      fontSize: 11,
    },
    loadingText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 20,
      fontSize: 13,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 40,
      fontSize: 13,
    },
  });
}
