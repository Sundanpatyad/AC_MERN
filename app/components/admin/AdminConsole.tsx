import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '../ui/ScreenBackground';
import { MeshHero } from '../ui/MeshHero';
import { Card } from '../ui/Card';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import {
  AdminTest,
  PERIODS,
  REVENUE_FILTERS,
  enrichTests,
  formatINR,
  getRange,
} from '../../lib/admin';

const TABS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'tests', label: 'Tests' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AdminConsole() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [tab, setTab] = useState<TabId>('analytics');
  const [trackWidth, setTrackWidth] = useState(0);
  const pillX = useSharedValue(0);
  const tabIndex = tab === 'analytics' ? 0 : 1;
  const pillWidth = Math.max((trackWidth - 8) / TABS.length, 0);

  useEffect(() => {
    pillX.value = withTiming(tabIndex * pillWidth, { duration: 240 });
  }, [pillX, pillWidth, tabIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };
  const [period, setPeriod] = useState('all');
  const [revenueFilter, setRevenueFilter] = useState('all');
  const [testQuery, setTestQuery] = useState('');
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const { from, to } = getRange(period);
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const [adminRes, publicSeries, instructorSeries] = await Promise.all([
        apiConnector.get(endpoints.ADMIN_MOCK_LIST, { params, timeout: 20000 }),
        apiConnector.get(endpoints.GET_ALL_MOCK_TESTS).catch(() => null),
        apiConnector.get(endpoints.GET_INSTRUCTOR_MOCK_TESTS).catch(() => null),
      ]);

      if (!adminRes.data?.success) {
        setError(adminRes.data?.message || 'Failed to load admin data.');
        return;
      }

      const seriesList = [
        ...(Array.isArray(publicSeries?.data?.data) ? publicSeries.data.data : []),
        ...(Array.isArray(instructorSeries?.data?.data) ? instructorSeries.data.data : []),
      ];
      setTests(enrichTests(adminRes.data.data ?? [], seriesList));
    } catch (err) {
      console.error('Admin console load failed', err);
      setError('Could not load admin data. Try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const analyticsTests = useMemo(() => {
    return tests
      .filter((test) => {
        if (revenueFilter === 'paid' && !(test.revenue > 0)) return false;
        if (revenueFilter === 'free' && Number(test.price) > 0) return false;
        return true;
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [tests, revenueFilter]);

  const purchaserTests = useMemo(() => {
    const q = testQuery.trim().toLowerCase();
    return tests
      .filter((test) => !q || String(test.testName).toLowerCase().includes(q))
      .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
  }, [tests, testQuery]);

  const totals = useMemo(() => {
    const totalRevenue = analyticsTests.reduce((sum, test) => sum + (test.revenue || 0), 0);
    const totalEnrollments = analyticsTests.reduce((sum, test) => sum + (test.enrollments || 0), 0);
    return {
      totalRevenue,
      totalEnrollments,
      totalTests: analyticsTests.length,
      avgRevenue: totalEnrollments ? totalRevenue / totalEnrollments : 0,
    };
  }, [analyticsTests]);

  const maxRevenue = Math.max(...analyticsTests.map((t) => t.revenue || 0), 1);
  const visibleTests = tab === 'analytics' ? analyticsTests : purchaserTests;

  const openTest = (test: AdminTest) => {
    router.push({
      pathname: '/admin/purchasers',
      params: {
        seriesId: test.seriesId || '',
        testName: test.testName,
        price: String(test.price || 0),
        enrollments: String(test.enrollments || 0),
        revenue: String(test.revenue || 0),
      },
    });
  };

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Console</Text>
        <Text style={styles.subtitle}>
          {tab === 'analytics'
            ? 'Revenue and enrollment analytics for each mock test.'
            : 'See who purchased each mock test.'}
        </Text>

        <View style={styles.tabRow} onLayout={onTrackLayout}>
          {pillWidth > 0 ? (
            <Animated.View style={[styles.tabPill, { width: pillWidth }, pillStyle]} />
          ) : null}
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={styles.tab}
              >
                <Text style={[styles.tabLabel, active ? styles.tabLabelOn : styles.tabLabelOff]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      </MeshHero>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
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
        {tab === 'analytics' ? (
          <>
            <FilterRow
              label="Period"
              value={period}
              options={PERIODS}
              onChange={setPeriod}
              colors={colors}
            />
            <FilterRow
              label="Revenue"
              value={revenueFilter}
              options={REVENUE_FILTERS}
              onChange={setRevenueFilter}
              colors={colors}
            />

            <View style={styles.statsGrid}>
              <StatCard label="Revenue" value={formatINR(totals.totalRevenue)} icon="cash-outline" colors={colors} />
              <StatCard
                label="Enrollments"
                value={totals.totalEnrollments.toLocaleString('en-IN')}
                icon="people-outline"
                colors={colors}
              />
              <StatCard label="Tests" value={String(totals.totalTests)} icon="document-text-outline" colors={colors} />
              <StatCard label="Avg / user" value={formatINR(totals.avgRevenue)} icon="trending-up-outline" colors={colors} />
            </View>
          </>
        ) : (
          <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              value={testQuery}
              onChangeText={setTestQuery}
              placeholder="Search tests"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
        )}

        {loading ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : error ? (
          <Text style={[styles.empty, { color: colors.danger }]}>{error}</Text>
        ) : visibleTests.length === 0 ? (
          <Text style={styles.empty}>No tests match these filters.</Text>
        ) : (
          <View style={styles.list}>
            {visibleTests.map((test) => (
              <Pressable
                key={test.seriesId || test.testName}
                onPress={() => openTest(test)}
                style={({ pressed }) => [pressed && { opacity: 0.75 }]}
              >
                <Card padding={16}>
                  <Text style={styles.testName} numberOfLines={2}>
                    {test.testName}
                  </Text>
                  <View style={styles.metaRow}>
                    <Meta label="Price" value={formatINR(test.price)} colors={colors} />
                    <Meta
                      label={tab === 'tests' ? 'Purchases' : 'Enrolled'}
                      value={Number(test.enrollments || 0).toLocaleString('en-IN')}
                      colors={colors}
                    />
                    <Meta label="Revenue" value={formatINR(test.revenue)} colors={colors} />
                  </View>
                  <View style={[styles.track, { backgroundColor: colors.surfaceRaised }]}>
                    <View
                      style={[
                        styles.fill,
                        {
                          backgroundColor: colors.text,
                          width: `${Math.max((test.revenue / maxRevenue) * 100, test.revenue ? 6 : 0)}%`,
                        },
                      ]}
                    />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

function FilterRow({
  label,
  value,
  options,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string; short: string }[];
  onChange: (id: string) => void;
  colors: AppPalette;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: Fonts.medium, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => {
          const active = value === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              style={{
                minHeight: 34,
                paddingHorizontal: 12,
                borderRadius: Radii.pill,
                borderWidth: 1,
                borderColor: active ? colors.text : colors.border,
                backgroundColor: active ? colors.text : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Fonts.medium,
                  color: active ? colors.background : colors.textSecondary,
                }}
              >
                {option.short}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: AppPalette;
}) {
  return (
    <Card padding={14} style={{ flex: 1, minWidth: '46%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Ionicons name={icon} size={14} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: Fonts.medium }}>{label}</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 18, fontFamily: Fonts.semiBold }}>{value}</Text>
    </Card>
  );
}

function Meta({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: AppPalette;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: Fonts.medium }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 13, fontFamily: Fonts.semiBold, marginTop: 2 }}>{value}</Text>
    </View>
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
      lineHeight: 18,
    },
    tabRow: {
      marginTop: 16,
      flexDirection: 'row',
      borderRadius: Radii.pill,
      padding: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    tabPill: {
      position: 'absolute',
      top: 4,
      left: 4,
      height: 36,
      borderRadius: Radii.pill,
      backgroundColor: colors.text,
    },
    tab: {
      flex: 1,
      height: 36,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    tabLabel: {
      fontSize: 13,
      fontFamily: Fonts.semiBold,
    },
    tabLabelOn: {
      color: colors.primaryButtonText,
    },
    tabLabelOff: {
      color: colors.textSecondary,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 44,
      borderWidth: 1,
      borderRadius: Radii.pill,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.sans,
    },
    list: {
      gap: 10,
    },
    testName: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      marginBottom: 12,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    track: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
    },
    fill: {
      height: 4,
      borderRadius: 2,
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
