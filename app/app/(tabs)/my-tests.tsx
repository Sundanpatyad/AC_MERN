import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';

export default function MyTestsScreen() {
  const [enrolledTests, setEnrolledTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [enrolledRes, attemptsRes] = await Promise.all([
        apiConnector.get(endpoints.GET_ENROLLED_MOCK_TESTS),
        apiConnector.get(endpoints.GET_USER_ATTEMPTS)
      ]);

      if (enrolledRes.data?.success) {
        setEnrolledTests(enrolledRes.data.data || []);
      }
      
      if (attemptsRes.data?.success) {
        // Backend returns attempts in 'attempts' key, not 'data'
        setAttempts(attemptsRes.data.attempts || []);
      }
    } catch (error) {
      console.error('Failed to fetch my tests:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tests</Text>
        <Text style={styles.subtitle}>Your enrolled tests and history</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enrolled Series</Text>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : enrolledTests.length > 0 ? (
            <View style={styles.testsList}>
              {enrolledTests.map((test: any) => (
                <MockTestCard key={test._id} test={test} showStatus={true} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>You haven't enrolled in any tests yet.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attempts</Text>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : attempts.length > 0 ? (
            <View style={styles.testsList}>
              {attempts.slice(0, 5).map((attempt: any, index) => (
                <View key={index} style={styles.attemptCard}>
                  <Text style={styles.attemptTestName}>{attempt.testName}</Text>
                  <View style={styles.attemptStats}>
                    <Text style={styles.attemptScore}>Score: {attempt.score} / {attempt.totalQuestions}</Text>
                    <Text style={styles.attemptDate}>
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No test attempts yet.</Text>
            </View>
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
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  testsList: {
    gap: 16,
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: '#0f0f0f',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
  attemptCard: {
    backgroundColor: '#0f0f0f',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  attemptTestName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  attemptStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attemptScore: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 13,
  },
  attemptDate: {
    color: '#666',
    fontSize: 11,
  },
});
