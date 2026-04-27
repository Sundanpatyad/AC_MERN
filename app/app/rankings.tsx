import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { apiConnector } from '../services/api';
import { endpoints } from '../constants/api';
import { Ionicons } from '@expo/vector-icons';

export default function RankingsScreen() {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRankings = async () => {
    try {
      // The backend route is GET /getRankings
      const response = await apiConnector.get(endpoints.GET_RANKINGS);
      if (response.data?.success) {
        setRankings(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performers across all tests</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Loading rankings...</Text>
        ) : rankings.length > 0 ? (
          <View style={styles.list}>
            {rankings.map((rank: any, index: number) => (
              <View key={index} style={styles.rankCard}>
                <View style={styles.rankBadge}>
                  {index === 0 && <Ionicons name="trophy" size={20} color="#fbbf24" />}
                  {index === 1 && <Ionicons name="trophy" size={20} color="#9ca3af" />}
                  {index === 2 && <Ionicons name="trophy" size={20} color="#b45309" />}
                  {index > 2 && <Text style={styles.rankNumber}>{rank.rank || index + 1}</Text>}
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{rank.userName}</Text>
                  <Text style={styles.testName}>{rank.testName} ({rank.seriesName})</Text>
                </View>

                <View style={styles.scoreInfo}>
                  <Text style={styles.score}>{rank.score}</Text>
                  <Text style={styles.totalScore}>/ {rank.totalQuestions}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No rankings available yet.</Text>
        )}
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
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  scrollContent: {
    padding: 20,
  },
  list: {
    gap: 12,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  rankBadge: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: '#a1a1aa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  testName: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  score: {
    color: '#3b82f6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalScore: {
    color: '#666',
    fontSize: 12,
  },
  loadingText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
