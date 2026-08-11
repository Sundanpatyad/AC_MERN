import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MyTestsSkeleton } from '../../components/ui/Skeleton';
import { Palette, Radii } from '../../constants/theme';

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
    <ScreenBackground>
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
        {isLoading ? (
          <MyTestsSkeleton />
        ) : (
          <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enrolled Series</Text>
          {enrolledTests.length > 0 ? (
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
          {attempts.length > 0 ? (
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
          </>
        )}
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  testsList: {
    gap: 12,
  },
  loadingText: {
    color: Palette.textMuted,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: Palette.surface,
    padding: 24,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
  },
  emptyText: {
    color: Palette.textMuted,
    textAlign: 'center',
    fontSize: 13,
  },
  attemptCard: {
    backgroundColor: Palette.surface,
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  attemptTestName: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  attemptStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attemptScore: {
    color: Palette.text,
    fontWeight: '700',
    fontSize: 13,
  },
  attemptDate: {
    color: Palette.textMuted,
    fontSize: 12,
  },
});
