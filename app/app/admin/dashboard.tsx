import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { SettingsShell } from '../../components/ui/SettingsShell';
import { Card } from '../../components/ui/Card';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { formatINR } from '../../lib/admin';
import { AppPalette, Fonts } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { useAuthStore } from '../../store/authStore';

export default function InstructorDashboardScreen() {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, coursesRes, testsRes] = await Promise.all([
        apiConnector.get(endpoints.GET_INSTRUCTOR_DASHBOARD).catch(() => null),
        apiConnector.get(endpoints.GET_INSTRUCTOR_COURSES).catch(() => null),
        apiConnector.get(endpoints.GET_INSTRUCTOR_MOCK_TESTS).catch(() => null),
      ]);

      const dash = Array.isArray(dashRes?.data?.courses) ? dashRes.data.courses : [];
      setStats({
        revenue: dash.reduce((sum: number, row: any) => sum + (row.totalAmountGenerated || 0), 0),
        students: dash.reduce((sum: number, row: any) => sum + (row.totalStudentsEnrolled || 0), 0),
      });
      setCourses(coursesRes?.data?.data || coursesRes?.data?.courses || []);
      setTests(testsRes?.data?.data || []);
    } catch (error) {
      console.error('Instructor dashboard failed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SettingsShell title="Dashboard" contentStyle={{ paddingTop: 4 }}>
      <ScrollView
        scrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={colors.refreshTint}
          />
        }
      >
        <Text style={styles.hello}>Hi {user?.firstName || 'Instructor'}</Text>
        <Text style={styles.sub}>Your courses and mock tests in one place.</Text>

        <View style={styles.stats}>
          <Card padding={16} style={{ flex: 1 }}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValue}>{formatINR(stats.revenue)}</Text>
          </Card>
          <Card padding={16} style={{ flex: 1 }}>
            <Text style={styles.statLabel}>Students</Text>
            <Text style={styles.statValue}>{stats.students.toLocaleString('en-IN')}</Text>
          </Card>
        </View>

        <Text style={styles.section}>Mock tests</Text>
        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : tests.length === 0 ? (
          <Text style={styles.empty}>No mock tests yet.</Text>
        ) : (
          tests.slice(0, 8).map((test) => (
            <Card key={test._id} padding={14} style={{ marginBottom: 8 }}>
              <Text style={styles.itemTitle}>{test.seriesName || test.testName}</Text>
              <Text style={styles.itemMeta}>
                {test.status || 'published'} · {formatINR(Number(test.price) || 0)} ·{' '}
                {Number(test.studentsEnrolledCount ?? test.studentsEnrolled?.length ?? 0)} enrolled
              </Text>
            </Card>
          ))
        )}

        <Text style={[styles.section, { marginTop: 20 }]}>Courses</Text>
        {courses.length === 0 ? (
          <Text style={styles.empty}>No courses yet.</Text>
        ) : (
          courses.slice(0, 8).map((course) => (
            <Card key={course._id} padding={14} style={{ marginBottom: 8 }}>
              <Text style={styles.itemTitle}>{course.courseName}</Text>
              <Text style={styles.itemMeta}>
                {course.status || 'draft'} · {formatINR(Number(course.price) || 0)}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SettingsShell>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    hello: {
      fontSize: 22,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    sub: {
      marginTop: 4,
      marginBottom: 18,
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    stats: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 22,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    statValue: {
      marginTop: 6,
      fontSize: 18,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    section: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 10,
    },
    itemTitle: {
      fontSize: 14,
      fontFamily: Fonts.semiBold,
      color: colors.text,
    },
    itemMeta: {
      marginTop: 4,
      fontSize: 12,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
    },
    empty: {
      fontSize: 13,
      fontFamily: Fonts.sans,
      color: colors.textSecondary,
      marginBottom: 8,
    },
  });
}
