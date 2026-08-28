import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { isInstructorAccount, useAuthStore } from '../../store/authStore';
import { AdminPages } from '../../components/admin/AdminPages';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { MockTestCard } from '../../components/MockTestCard';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MeshHero } from '../../components/ui/MeshHero';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabScreenBottomPadding } from '../../lib/safeArea';
import { Card } from '../../components/ui/Card';
import { MyTestsSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { SectionHeading } from '../../components/ui/SectionHeading';

export default function MyTestsScreen() {
  const { user } = useAuthStore();
  if (isInstructorAccount(user?.accountType)) {
    return <AdminPages />;
  }
  return <StudentMyTestsScreen />;
}

function StudentMyTestsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabScreenBottomPadding();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Tests</Text>
          <Text style={styles.subtitle}>Your enrolled tests and history</Text>
        </View>
      </MeshHero>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabClearance }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.refreshTint}
          />
        }
      >
        {isLoading ? (
          <MyTestsSkeleton />
        ) : (
          <>
        <View style={styles.section}>
          <SectionHeading title="Enrolled Series" style={{ marginBottom: 16 }} />
          {enrolledTests.length > 0 ? (
            <View style={styles.testsList}>
              {enrolledTests.map((test: any) => (
                <MockTestCard key={test._id} test={test} showStatus={true} />
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>You haven't enrolled in any tests yet.</Text>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeading title="Recent Attempts" style={{ marginBottom: 16 }} />
          {attempts.length > 0 ? (
            <View style={styles.testsList}>
              {attempts.slice(0, 5).map((attempt: any, index) => (
                <Card key={index} style={styles.attemptCard}>
                  <Text style={styles.attemptTestName}>{attempt.testName}</Text>
                  <View style={styles.attemptStats}>
                    <Text style={styles.attemptScore}>Score: {attempt.score} / {attempt.totalQuestions}</Text>
                    <Text style={styles.attemptDate}>
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No test attempts yet.</Text>
            </Card>
          )}
        </View>
          </>
        )}
      </ScrollView>
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
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 16,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    testsList: {
      gap: 12,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    emptyCard: {
      padding: 16,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      fontSize: 13,
    },
    attemptCard: {
      padding: 12,
    },
    attemptTestName: {
      color: colors.text,
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
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    attemptDate: {
      color: colors.textMuted,
      fontSize: 12,
    },
  });
}
