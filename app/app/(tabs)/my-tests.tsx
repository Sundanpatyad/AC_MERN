import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isInstructorAccount, useAuthStore } from '../../store/authStore';
import { AdminPages } from '../../components/admin/AdminPages';
import { apiConnector } from '../../services/api';
import { endpoints } from '../../constants/api';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { MeshHero } from '../../components/ui/MeshHero';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabScreenBottomPadding } from '../../lib/safeArea';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MyTestsSkeleton } from '../../components/ui/Skeleton';
import { AppPalette, Fonts, Radii } from '../../constants/theme';
import { useTheme } from '../../providers/AppThemeProvider';
import { itemKey } from '../../utils/itemKey';

const PAGE_LIMIT = 10;

const formatScore = (score: number) => {
  const n = Number(score);
  if (Number.isNaN(n)) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

const formatDuration = (seconds: number) => {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
};

export default function MyTestsScreen() {
  const { user } = useAuthStore();
  if (isInstructorAccount(user?.accountType)) {
    return <AdminPages />;
  }
  return <StudentAttemptsScreen />;
}

function StudentAttemptsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabScreenBottomPadding();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [attempts, setAttempts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [averageScore, setAverageScore] = useState('0.00');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchAttempts = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    if (pageNum > 1 && !hasMore && !shouldRefresh) return;

    if (pageNum === 1 && !shouldRefresh) setIsLoading(true);
    else if (pageNum > 1) setIsLoadingMore(true);

    try {
      const response = await apiConnector.get(endpoints.GET_USER_ATTEMPTS, {
        params: { page: pageNum, limit: PAGE_LIMIT },
      });

      if (response.data?.success) {
        const next = response.data.attempts || [];
        const pagination = response.data.pagination;

        setAttempts((prev) => (shouldRefresh || pageNum === 1 ? next : [...prev, ...next]));
        setHasMore(Boolean(pagination?.hasNextPage));
        setPage(pageNum);
        setTotalAttempts(
          response.data.user?.totalAttempts ?? pagination?.total ?? next.length
        );
        setAverageScore(response.data.user?.averageScore || '0.00');
      }
    } catch (error) {
      console.error('Failed to fetch attempts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  }, [hasMore]);

  useEffect(() => {
    fetchAttempts(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchAttempts(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchAttempts(page + 1);
    }
  };

  const renderAttempt = ({ item }: { item: any }) => {
    const date = new Date(item.attemptDate || item.createdAt);
    const seriesName = item.mockTestSeries?.seriesName;
    const skipped = item.skippedAnswers ?? 0;

    return (
      <Pressable
        onPress={() => router.push(`/attempt/${item._id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Open attempt ${item.testName}`}
        style={({ pressed }) => [pressed && { opacity: 0.88 }]}
      >
        <Card style={styles.attemptCard}>
          <View style={styles.attemptRow}>
            <View style={styles.attemptCopy}>
              <Text style={styles.attemptTestName} numberOfLines={2}>
                {item.testName}
              </Text>
              {seriesName ? (
                <Text style={styles.seriesName} numberOfLines={1}>
                  {seriesName}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Score {formatScore(item.score)} / {item.totalQuestions}
                </Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{formatDuration(item.timeTaken)}</Text>
              </View>
              <Text style={styles.detailMeta}>
                {item.correctCount ?? 0} correct · {item.incorrectAnswers ?? 0} incorrect
                {skipped > 0 ? ` · ${skipped} skipped` : ''}
                {' · '}
                {date.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScreenBackground>
      <MeshHero
        fadeTo={colors.background}
        style={{ paddingTop: Math.max(insets.top, 12) + 4, paddingBottom: 16 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Attempts</Text>
          <Text style={styles.subtitle}>
            All your previous mock test attempts. Open any attempt to review answers.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={styles.statLabel}>Total attempts</Text>
            <Text style={styles.statValue}>{totalAttempts}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={styles.statLabel}>Average score</Text>
            <Text style={styles.statValue}>{averageScore}</Text>
          </View>
        </View>
      </MeshHero>

      {isLoading ? (
        <View style={[styles.listPad, { paddingBottom: tabClearance }]}>
          <MyTestsSkeleton />
        </View>
      ) : (
        <FlatList
          data={attempts}
          keyExtractor={(item, index) => itemKey(item._id, index)}
          renderItem={renderAttempt}
          contentContainerStyle={[
            styles.listPad,
            { paddingBottom: tabClearance },
            attempts.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.refreshTint}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No attempts yet</Text>
              <Text style={styles.emptyText}>Take a mock test to see your history here.</Text>
              <Button
                title="Browse mock tests"
                onPress={() => router.push('/(tabs)/mock-tests')}
                variant="outline"
                style={{ marginTop: 16 }}
              />
            </Card>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.textMuted} />
              </View>
            ) : null
          }
        />
      )}
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
      lineHeight: 18,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 14,
    },
    statCard: {
      flex: 1,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: Radii.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    statValue: {
      marginTop: 4,
      fontSize: 22,
      fontFamily: Fonts.semiBold,
      color: colors.text,
      letterSpacing: -0.4,
    },
    listPad: {
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 10,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    attemptCard: {
      padding: 14,
      marginBottom: 10,
    },
    attemptRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    attemptCopy: {
      flex: 1,
      minWidth: 0,
    },
    attemptTestName: {
      color: colors.text,
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      letterSpacing: -0.2,
    },
    seriesName: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: Fonts.sans,
    },
    metaRow: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: Fonts.medium,
    },
    metaDot: {
      color: colors.textMuted,
      fontSize: 12,
    },
    detailMeta: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: Fonts.sans,
      lineHeight: 16,
    },
    emptyCard: {
      padding: 24,
      alignItems: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      marginBottom: 4,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 18,
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });
}
