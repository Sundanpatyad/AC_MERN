import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabScreenBottomPadding } from '../../lib/safeArea';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '../ui/ScreenBackground';
import { MeshHero } from '../ui/MeshHero';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { formatINR } from '../../lib/admin';
import { useAuthStore } from '../../store/authStore';
import { AppPalette, Fonts } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';

export function InstructorTests() {
  const { user } = useAuthStore();
  const isAdmin = user?.accountType === 'Admin';
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabScreenBottomPadding();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTests = useCallback(async () => {
    try {
      const [instructorRes, publicRes] = await Promise.all([
        apiConnector.get(endpoints.GET_INSTRUCTOR_MOCK_TESTS).catch(() => null),
        isAdmin ? apiConnector.get(endpoints.GET_ALL_MOCK_TESTS).catch(() => null) : Promise.resolve(null),
      ]);
      const instructorTests = instructorRes?.data?.data || [];
      const publicTests = publicRes?.data?.data || [];
      const byId = new Map<string, any>();
      [...instructorTests, ...publicTests].forEach((test) => {
        if (test?._id) byId.set(String(test._id), test);
      });
      setTests(Array.from(byId.values()));
    } catch (error) {
      console.error('Failed to load instructor tests', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{isAdmin ? 'All Tests' : 'My Tests'}</Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Every published series, plus tests you manage.' : 'Create, edit, and start your mock series.'}
          </Text>
          <Button title="Create mock test" onPress={() => router.push('/admin/create-series')} style={{ marginTop: 14 }} />
        </View>
      </MeshHero>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabClearance }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTests();
            }}
            tintColor={colors.refreshTint}
          />
        }
      >
        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : tests.length === 0 ? (
          <Text style={styles.empty}>No mock tests yet.</Text>
        ) : (
          tests.map((test) => {
            const firstTestId = test.mockTests?.[0]?._id;
            return (
              <Card key={test._id} padding={16} style={{ marginBottom: 10 }}>
                <Pressable onPress={() => router.push(`/admin/edit-series/${test._id}`)}>
                  <Text style={styles.name}>{test.seriesName || test.testName}</Text>
                  <Text style={styles.meta}>
                    {test.status || 'published'} · {formatINR(Number(test.price) || 0)} ·{' '}
                    {Number(test.studentsEnrolledCount ?? test.studentsEnrolled?.length ?? 0)} enrolled
                  </Text>
                </Pressable>
                <View style={styles.actions}>
                  <Pressable onPress={() => router.push(`/admin/edit-series/${test._id}`)}>
                    <Text style={styles.link}>Edit</Text>
                  </Pressable>
                  {firstTestId ? (
                    <Pressable onPress={() => router.push(`/take-test/${firstTestId}?seriesId=${test._id}`)}>
                      <Text style={styles.link}>Start now</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => router.push(`/mock-test/${test._id}`)}>
                      <Text style={styles.link}>Open</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/admin/purchasers',
                        params: {
                          seriesId: test._id,
                          testName: test.seriesName || test.testName,
                          price: String(test.price || 0),
                          enrollments: String(test.studentsEnrolledCount ?? test.studentsEnrolled?.length ?? 0),
                          revenue: String(
                            (Number(test.price) || 0) *
                              (test.studentsEnrolledCount ?? test.studentsEnrolled?.length ?? 0)
                          ),
                        },
                      })
                    }
                  >
                    <Text style={styles.link}>Buyers</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 22,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    name: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    meta: {
      marginTop: 6,
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 12,
    },
    link: {
      fontSize: 13,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    empty: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 28,
    },
  });
}
